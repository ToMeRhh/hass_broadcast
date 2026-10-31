import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import {
  DEFAULT_TITLE,
  ResolvedTileConfig,
  TileConfig,
  TileShape,
  resolveTileConfig,
} from "./config";
import { INSECURE_CONTEXT_MESSAGE } from "./errors";
import { formatClock } from "./format";
import { discoverPlayers } from "./players";
import { RecordingController, Take } from "./recording";
import { Outcome, describeTargets, outcomeStatus, sendClip } from "./sending";
import { iconStyles, micStyles } from "./styles";
import { tileForm } from "./forms";
import { binIcon, checkIcon, closeIcon, speakerIcon, warnIcon } from "./ui/icons";
import { mic } from "./ui/mic";
import { layers, timerText } from "./ui/strip";

/** How long the tile shows how a send went before it is ready again. */
export const RESULT_MS = 2500;

/**
 * The square tile's button: most of the space above the text, so it grows
 * when the tile is resized, and never smaller than at the default 3×2. The
 * blob around it while recording is wider still and spills into the padding,
 * hence not all of it.
 */
const SQUARE_MIC = "max(52px, min(100cqw, 100cqh) * 0.6)";

/** How far outside the bin's edge a release still lands on it, in px. */
const BIN_SLOP = 8;

/** What the tile's second line says once something has happened. */
interface Result {
  kind: "sent" | "partial" | "failed" | "discarded";
  /** Short enough for a tile. */
  text: string;
  /** The full story, for the tooltip and screen readers. */
  detail: string;
}

/**
 * A walkie-talkie button: hold to talk, let go to send to a fixed set of
 * speakers. There is no review step and no picker — that is the card's job;
 * this is for the one person or room you call every day.
 *
 * Letting go is final, so the take can be thrown away instead: while it
 * records, a bin shows in a spot reserved for it (a square tile's status
 * line, whose timer moves up into the name's place, or the end of a
 * horizontal one), and letting go on it, or pressing Escape, discards.
 *
 * Recording goes through the same RecordingController as the card, and
 * sending through the same upload-once path, so a message left here shows up
 * in the card's recent messages like any other.
 */
@customElement("hass-broadcast-tile")
export class HassBroadcastTile extends LitElement {
  @property({ attribute: false }) hass?: any;
  @state() private config: TileConfig = { type: "" };
  @state() private result?: Result;
  /** The held pointer is on the bin: letting go now discards. */
  @state() private overBin = false;

  private resultTimer?: number;

  private rec = new RecordingController(this, {
    // Release-to-send only makes sense held: a tap-to-start tile would send
    // the moment a second tap stopped it, with no way to take it back.
    recordMode: () => "push_to_talk",
    maxDuration: () => this.resolved.maxDuration,
    noiseSuppression: () => this.resolved.noiseSuppression,
    onStart: () => this.showResult(undefined),
    onError: (text) => this.showResult({ kind: "failed", text: shorten(text), detail: text }),
    onTake: (take) => this.send(take),
    onDiscard: () =>
      this.showResult({ kind: "discarded", text: "Discarded", detail: "Discarded, not sent." }),
  });

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && this.rec.phase === "recording") {
      this.overBin = false;
      void this.rec.onPressEnd(true);
    }
  };

  static styles = [
    micStyles,
    iconStyles,
    css`
      ha-card {
        height: 100%;
        box-sizing: border-box;
        overflow: visible;
      }
      .tile {
        position: relative;
        display: grid;
        height: 100%;
        box-sizing: border-box;
        align-items: center;
      }
      .tile.square {
        grid-template-rows: 1fr auto;
        justify-items: center;
        gap: 6px;
        padding: 12px 8px 8px;
        text-align: center;
      }
      /* Room between the name and the bin's outline over the status line,
         taken from the padding under it: a 3×2 tile's button is already at
         its smallest. */
      .square > .text {
        gap: 4px;
      }
      /* The button's cell is a size container, so the button can follow the
         tile as it is resized; see SQUARE_MIC. */
      .tile.square > .slot {
        container-type: size;
        align-self: stretch;
        justify-self: stretch;
        display: grid;
        place-items: center;
      }
      .tile.horizontal {
        grid-template-columns: auto 1fr;
        gap: 12px;
        padding: 8px 12px;
      }
      .text {
        display: flex;
        flex-direction: column;
        min-width: 0;
        max-width: 100%;
      }
      .name {
        overflow: hidden;
        font-weight: 500;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .layers {
        display: grid;
      }
      .tile-status {
        height: 18px;
        transition: opacity 180ms ease;
      }
      /* Under a square tile's bin; the name line shows the timer instead.
         Hidden, not just covered: a bin still fading in, or one whose
         background a browser without color-mix() drops, would show it
         through. */
      .square[data-recording="true"] .tile-status {
        opacity: 0;
        transition: none;
      }
      /* A square tile's name line, which turns into the timer mid-take. */
      .tile-name > .layer {
        font-size: inherit;
        color: inherit;
      }
      .layer {
        grid-area: 1 / 1;
        display: flex;
        align-items: center;
        gap: 4px;
        min-width: 0;
        overflow: hidden;
        font-size: 0.85em;
        color: var(--secondary-text-color);
        white-space: nowrap;
        opacity: 0;
        transition: opacity 180ms ease;
      }
      .square .layer {
        justify-content: center;
      }
      .layer[data-on="true"] {
        opacity: 1;
      }
      .layer span {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .layer svg {
        flex: none;
        width: 14px;
        height: 14px;
      }
      .layer-sent {
        color: var(--success-color, #43a047);
      }
      .layer-partial {
        color: var(--warning-color, #ff9800);
      }
      .layer-failed,
      .layer-armed {
        color: var(--error-color, #db4437);
      }
      /* Reserved in both shapes and only shown mid-take, so nothing moves:
         over a square tile's status line, at the end of a horizontal one.
         Opaque, since it covers text. */
      .bin {
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        box-sizing: border-box;
        border: 1.5px dashed var(--divider-color, #bdbdbd);
        background: color-mix(
          in srgb,
          var(--secondary-text-color, #727272) 12%,
          var(--card-background-color, var(--ha-card-background, #fff))
        );
        color: var(--secondary-text-color, #727272);
        opacity: 0;
        pointer-events: none;
        transition: opacity 180ms ease, background 180ms ease, color 180ms ease;
      }
      .bin[data-on="true"] {
        opacity: 1;
      }
      .bin[data-armed="true"] {
        border-color: transparent;
        background: var(--error-color, #db4437);
        color: #fff;
      }
      .bin svg {
        flex: none;
        width: 18px;
        height: 18px;
      }
      /* Only the status line, centred on it so its text sits where the
         line's does (8px padding + half the 18px line − half the 22px bin):
         the blob around a 3×2 tile's button reaches past the name, and would
         run into anything taller. */
      .square > .bin {
        position: absolute;
        right: 8px;
        bottom: 6px;
        left: 8px;
        height: 22px;
        gap: 3px;
        border-radius: 11px;
        font-size: 0.8em;
        white-space: nowrap;
      }
      .square > .bin svg {
        width: 14px;
        height: 14px;
      }
      .horizontal > .bin {
        position: absolute;
        top: 50%;
        right: 12px;
        width: 36px;
        height: 36px;
        margin-top: -18px;
        border-radius: 50%;
      }
      .tile[data-armed="true"] .mic-wrap {
        --mic-color: var(--disabled-text-color, #9e9e9e);
      }
      .timer {
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        color: var(--error-color, #db4437);
      }
      .timer[data-warning="true"] {
        color: var(--warning-color, #ff9800);
      }
      @media (prefers-reduced-motion: reduce) {
        .tile-status,
        .layer,
        .bin {
          transition: none;
        }
      }
    `,
  ];

  setConfig(config: TileConfig): void {
    this.config = config;
  }

  private get resolved(): ResolvedTileConfig {
    return resolveTileConfig(this.config);
  }

  private get shape(): TileShape {
    return this.resolved.shape;
  }

  private get targets(): string[] {
    return this.resolved.speakers;
  }

  getCardSize(): number {
    return this.shape === "square" ? 3 : 1;
  }

  getGridOptions() {
    return this.shape === "square"
      ? { rows: 2, columns: 3, min_rows: 2, min_columns: 3 }
      : { rows: 1, columns: 6, min_rows: 1, max_rows: 1, min_columns: 4 };
  }

  /** Home Assistant draws the editor from this schema; see forms.ts. */
  static getConfigForm() {
    return tileForm;
  }

  /** Pre-picks the first speaker found, so a fresh tile works at once. */
  static getStubConfig(hass?: any): TileConfig {
    const first = discoverPlayers(hass)[0];
    return {
      type: "custom:hass-broadcast-tile",
      name: DEFAULT_TITLE,
      speakers: first ? [first] : [],
      shape: "square",
      max_duration: 60,
      mode: "plain",
    };
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("keydown", this.onKeyDown);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this.onKeyDown);
    this.clearResultTimer();
    this.result = undefined;
  }

  /** Whether a pointer event lands on the bin, give or take BIN_SLOP. */
  private isOverBin(event: PointerEvent): boolean {
    const bin = this.renderRoot.querySelector(".bin");
    if (!bin) {
      return false;
    }
    const box = bin.getBoundingClientRect();
    return (
      event.clientX >= box.left - BIN_SLOP &&
      event.clientX <= box.right + BIN_SLOP &&
      event.clientY >= box.top - BIN_SLOP &&
      event.clientY <= box.bottom + BIN_SLOP
    );
  }

  private onPressMove(event: PointerEvent): void {
    this.overBin = this.rec.phase === "recording" && this.isOverBin(event);
  }

  private onPressEnd(event?: PointerEvent): void {
    const discard = event !== undefined && this.isOverBin(event);
    this.overBin = false;
    void this.rec.onPressEnd(discard);
  }

  private clearResultTimer(): void {
    if (this.resultTimer !== undefined) {
      window.clearTimeout(this.resultTimer);
      this.resultTimer = undefined;
    }
  }

  private showResult(result: Result | undefined): void {
    this.clearResultTimer();
    this.result = result;
    if (result) {
      this.resultTimer = window.setTimeout(() => {
        this.resultTimer = undefined;
        this.result = undefined;
      }, RESULT_MS);
    }
  }

  private async send(take: Take): Promise<void> {
    if (this.targets.length === 0) {
      this.showResult({
        kind: "failed",
        text: "No speakers set",
        detail: "Pick speakers in the card editor.",
      });
      return;
    }
    this.rec.setSending(true);
    try {
      const outcome = await sendClip({
        hass: this.hass,
        // Never played back here, so no object URL is made for it.
        clip: {
          source: { kind: "fresh", blob: take.blob },
          url: "",
          duration: take.duration,
          peaks: [],
        },
        targets: this.targets,
        mode: this.resolved.mode,
      });
      this.showResult(this.describe(outcome));
    } catch (err: any) {
      const detail = `Could not send: ${err?.message ?? err}`;
      this.showResult({ kind: "failed", text: "Not sent", detail });
    } finally {
      this.rec.setSending(false);
    }
  }

  private describe(outcome: Outcome): Result {
    const detail = outcomeStatus(this.hass, outcome).text;
    switch (outcome.kind) {
      case "sent":
        return { kind: "sent", text: "Sent", detail };
      case "partial":
        return {
          kind: "partial",
          text: `Not on ${describeTargets(this.hass, outcome.failed)}`,
          detail,
        };
      case "failed":
        return { kind: "failed", text: "Not sent", detail };
    }
  }

  /** Where a message goes; "hold to talk" is the button's own label. */
  private get idleText() {
    if (!this.rec.supported) {
      return html`<span>Needs HTTPS</span>`;
    }
    if (!this.targets.length) {
      return html`<span>Pick speakers in the card editor</span>`;
    }
    const speakers = describeTargets(this.hass, this.targets);
    return html`${speakerIcon}<span title=${speakers}>${speakers}</span>`;
  }

  render() {
    const recording = this.rec.phase === "recording";
    // From the release on, the take is on its way: the tile sends it once
    // Recorder.stop() has finished recording the tail.
    const sending = this.rec.phase === "sending" || this.rec.phase === "finishing";
    const { name, maxDuration: limit } = this.resolved;
    const warning =
      recording && limit - this.rec.elapsed <= Math.min(10, limit * 0.25);
    const armed = recording && this.overBin;
    const view = armed
      ? "armed"
      : recording
        ? "recording"
        : sending
        ? "sending"
        : this.result?.kind ?? "idle";
    const resultLayer = (icon: unknown) =>
      html`${icon}<span title=${this.result?.detail ?? ""}>${this.result?.text ?? ""}</span>`;
    const label = recording
      ? "Recording — release to send, Escape to discard"
      : this.targets.length
        ? `Hold to talk to ${describeTargets(this.hass, this.targets)}`
        : "Hold to talk";
    return html`
      <ha-card>
        <div
          class="tile ${this.shape}"
          data-recording=${recording}
          data-armed=${armed}
          title=${this.rec.supported ? "" : INSECURE_CONTEXT_MESSAGE}
        >
          <div class="slot">
            ${mic({
              size: this.shape === "square" ? SQUARE_MIC : 40,
              recording,
              disabled: !this.rec.supported || sending || this.targets.length === 0,
              recordMode: "push_to_talk",
              level: this.rec.level,
              maxDuration: limit,
              label,
              onPressStart: (event) => void this.rec.onPressStart(event),
              onPressEnd: (event) => this.onPressEnd(event),
              onPressMove: (event) => this.onPressMove(event),
            })}
          </div>
          <div class="text">
            ${this.shape === "square"
              ? layers("tile-name", recording ? "timer" : "name", {
                  name: html`<span class="name">${name}</span>`,
                  timer: timerText(formatClock(this.rec.elapsed), warning),
                })
              : html`<span class="name">${name}</span>`}
            ${layers("tile-status", view, {
              idle: this.idleText,
              recording: timerText(formatClock(this.rec.elapsed), warning),
              armed: html`<span>Release to discard</span>`,
              sending: html`<span>Sending…</span>`,
              sent: resultLayer(checkIcon),
              partial: resultLayer(warnIcon),
              failed: resultLayer(closeIcon),
              discarded: resultLayer(binIcon),
            })}
          </div>
          <div class="bin" data-on=${recording} data-armed=${armed} aria-hidden="true">
            ${this.shape === "square" ? html`${binIcon}<span>Discard</span>` : binIcon}
          </div>
        </div>
        <div class="sr-only" aria-live="polite">${this.result?.detail ?? ""}</div>
      </ha-card>
    `;
  }
}

/** First sentence of a long error, so it fits on a tile. */
function shorten(text: string): string {
  return text.split(/(?<=\.) /)[0];
}

(window as any).customCards = (window as any).customCards ?? [];
(window as any).customCards.push({
  type: "hass-broadcast-tile",
  name: "Voice Broadcast Tile",
  description: "Hold to talk, let go to send to the speakers you chose.",
  preview: true,
});

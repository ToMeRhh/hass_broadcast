import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { BroadcastMode } from "./api";
import { clampMaxDuration, resolveMode } from "./config";
import { INSECURE_CONTEXT_MESSAGE } from "./errors";
import { formatClock } from "./format";
import { discoverPlayers } from "./players";
import { RecordingController, Take } from "./recording";
import { Outcome, describeTargets, outcomeStatus, sendClip } from "./sending";
import { iconStyles, micStyles } from "./styles";
import { tileForm } from "./forms";
import { checkIcon, closeIcon, warnIcon } from "./ui/icons";
import { mic } from "./ui/mic";
import { layers, timerText } from "./ui/strip";

/** How long the tile shows how a send went before it is ready again. */
export const RESULT_MS = 2500;

export interface TileConfig {
  type: string;
  name?: string;
  /** The speakers every message goes to. */
  speakers?: string[];
  shape?: "square" | "horizontal";
  mode?: BroadcastMode;
  max_duration?: number;
  noise_suppression?: boolean;
}

/** What the tile's second line says once something has happened. */
interface Result {
  kind: "sent" | "partial" | "failed";
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
 * Recording goes through the same RecordingController as the card, and
 * sending through the same upload-once path, so a message left here shows up
 * in the card's recent messages like any other.
 */
@customElement("hass-broadcast-tile")
export class HassBroadcastTile extends LitElement {
  @property({ attribute: false }) hass?: any;
  @state() private config: TileConfig = { type: "" };
  @state() private result?: Result;

  private resultTimer?: number;

  private rec = new RecordingController(this, {
    // Release-to-send only makes sense held: a tap-to-start tile would send
    // the moment a second tap stopped it, with no way to take it back.
    recordMode: () => "push_to_talk",
    maxDuration: () => clampMaxDuration(this.config.max_duration),
    noiseSuppression: () => this.config.noise_suppression === true,
    onStart: () => this.showResult(undefined),
    onError: (text) => this.showResult({ kind: "failed", text: shorten(text), detail: text }),
    onTake: (take) => this.send(take),
  });

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
        display: grid;
        height: 100%;
        box-sizing: border-box;
        align-items: center;
      }
      .tile.square {
        grid-template-rows: 1fr auto;
        justify-items: center;
        gap: 6px;
        padding: 12px 8px;
        text-align: center;
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
        height: 18px;
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
      .layer-failed {
        color: var(--error-color, #db4437);
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
        .layer {
          transition: none;
        }
      }
    `,
  ];

  setConfig(config: TileConfig): void {
    this.config = config;
  }

  private get shape(): "square" | "horizontal" {
    return this.config.shape === "horizontal" ? "horizontal" : "square";
  }

  private get targets(): string[] {
    return Array.isArray(this.config.speakers) ? this.config.speakers : [];
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
      name: "Intercom",
      speakers: first ? [first] : [],
      shape: "square",
      mode: "plain",
    };
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearResultTimer();
    this.result = undefined;
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
        mode: resolveMode(this.config.mode),
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

  private get name(): string {
    return this.config.name?.trim() || "Intercom";
  }

  private get idleText(): string {
    if (!this.rec.supported) {
      return "Needs HTTPS";
    }
    return this.targets.length ? "Hold to talk" : "Pick speakers in the card editor";
  }

  render() {
    const recording = this.rec.phase === "recording";
    // From the release on, the take is on its way: the tile sends it once
    // Recorder.stop() has finished recording the tail.
    const sending = this.rec.phase === "sending" || this.rec.phase === "finishing";
    const limit = clampMaxDuration(this.config.max_duration);
    const warning =
      recording && limit - this.rec.elapsed <= Math.min(10, limit * 0.25);
    const view = recording
      ? "recording"
      : sending
        ? "sending"
        : this.result?.kind ?? "idle";
    const resultLayer = (icon: unknown) =>
      html`${icon}<span title=${this.result?.detail ?? ""}>${this.result?.text ?? ""}</span>`;
    const label = recording ? "Recording — release to send" : `Hold to talk to ${this.name}`;
    return html`
      <ha-card>
        <div class="tile ${this.shape}" title=${this.rec.supported ? "" : INSECURE_CONTEXT_MESSAGE}>
          <div class="slot">
            ${mic({
              size: this.shape === "square" ? 52 : 40,
              recording,
              disabled: !this.rec.supported || sending || this.targets.length === 0,
              recordMode: "push_to_talk",
              level: this.rec.level,
              maxDuration: limit,
              label,
              onPressStart: (event) => void this.rec.onPressStart(event),
              onPressEnd: () => void this.rec.onPressEnd(),
            })}
          </div>
          <div class="text">
            <span class="name">${this.name}</span>
            ${layers("tile-status", view, {
              idle: html`<span>${this.idleText}</span>`,
              recording: timerText(formatClock(this.rec.elapsed), warning),
              sending: html`<span>Sending…</span>`,
              sent: resultLayer(checkIcon),
              partial: resultLayer(warnIcon),
              failed: resultLayer(closeIcon),
            })}
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
  preview: false,
});

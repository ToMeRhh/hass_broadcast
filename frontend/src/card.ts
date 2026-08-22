import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import {
  BroadcastMessage,
  BroadcastMode,
  deleteMessage,
  listMessages,
  sendBroadcast,
  uploadRecording,
} from "./api";
import { INSECURE_CONTEXT_MESSAGE, micErrorMessage } from "./errors";
import { Recorder } from "./recorder";
import { allowedTargets, discoverPlayers, visiblePlayers } from "./players";
import { clampMaxDuration } from "./editor";
import "./editor";
import {
  Clip,
  freshClip,
  loadStoredClip,
  revokeClip,
  storedId,
} from "./clip";
import { BAR_COUNT, LevelEnvelope, silence } from "./levels";
import { cardStyles } from "./styles";
import { visualizer } from "./ui/visualizer";

const DEFAULT_TITLE = "Voice Broadcast";

interface CardConfig {
  type: string;
  /** Card heading, renamable from the editor. Blank falls back to DEFAULT_TITLE. */
  title?: string;
  targets?: string[];
  /** Only these speakers appear on the card. Empty means "every one found". */
  show_players?: string[];
  /** Speakers to leave off the card, applied after show_players. */
  hide_players?: string[];
  mode?: BroadcastMode;
  max_duration?: number;
  show_history?: boolean;
  /** How the record button behaves. Absent means push-to-talk. */
  record_mode?: "push_to_talk" | "start_stop";
  /** Which speaker-list style the card draws. Absent means rows. */
  player_list?: "rows" | "chips" | "dropdown";
}

type Phase = "idle" | "recording" | "sending";

/** What the status line is saying, and whether it reads as a problem. */
interface Status {
  kind: "error" | "info";
  text: string;
}

@customElement("hass-broadcast-card")
export class HassBroadcastCard extends LitElement {
  @property({ attribute: false }) hass?: any;
  @state() private config: CardConfig = { type: "" };
  @state() private phase: Phase = "idle";
  @state() private elapsed = 0;
  @state() private status?: Status;
  @state() private selected: string[] = [];
  @state() private history: BroadcastMessage[] = [];
  @state() private clip?: Clip;
  /** Bars the strip draws right now: live tail, loaded waveform, or silence. */
  @state() private bars: number[] = [];
  /** The history row currently being fetched, for its pending state. */
  @state() private loadingId?: string;
  @state() private position = 0;

  private recorder = new Recorder();
  private envelope = new LevelEnvelope();
  private timer?: number;
  // Guards Recorder.start()/stop() against re-entrant calls — e.g. a
  // double-tap on the record button, or the max-duration timer firing at
  // the same moment as a manual stop. Recorder.stop() throws when there is
  // no active recording session, so these transitions must not race.
  private busy = false;
  // Set in disconnectedCallback. That callback's own teardown only fires for
  // phase === "recording", but during start() the phase is still "idle", so a
  // teardown mid-start would be skipped entirely and startRecording would
  // resume on a detached element — holding the microphone open and installing
  // an interval that keeps the dead element alive.
  private disconnected = false;

  static styles = cardStyles;

  setConfig(config: CardConfig): void {
    this.config = config;
    this.selected = config.targets ? [...config.targets] : [];
  }

  getCardSize(): number {
    return this.config.show_history === false ? 3 : 6;
  }

  static getConfigElement() {
    return document.createElement("hass-broadcast-card-editor");
  }

  static getStubConfig(): CardConfig {
    return { type: "custom:hass-broadcast-card", targets: [], mode: "plain" };
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Reset for a re-attach (dashboard navigation moves the element rather
    // than recreating it).
    this.disconnected = false;
    if (!Recorder.isSupported()) {
      this.status = { kind: "error", text: INSECURE_CONTEXT_MESSAGE };
    }
    void this.refreshHistory();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.disconnected = true;
    this.clearTimer();
    revokeClip(this.clip);
    // Torn down (dashboard navigation, view switch) while a recording is
    // in progress. The MediaStream/AudioContext/worklet node stay alive
    // until something calls Recorder.stop() — there is no side-effect-free
    // "abandon" method, and Task 10's Recorder API is already reviewed and
    // settled, so call stop() here and discard the resulting blob rather
    // than leaking the mic open until a page reload. Skip this when
    // `busy` is already true: a start()/stop() is already in flight (e.g.
    // the user tapped stop and navigated away in the same tick) and will
    // release the session itself once its own promise settles — calling
    // stop() again here would race it and hit Recorder.stop()'s own
    // "no active session" throw.
    if (this.phase === "recording" && !this.busy) {
      this.phase = "idle";
      this.busy = true;
      // disconnectedCallback is synchronous and cannot be awaited, so this
      // is fire-and-forget. The rejection is still handled so teardown can
      // never surface an unhandled promise rejection.
      this.recorder
        .stop()
        .catch(() => {
          // Nothing left to recover into once the card is torn down.
        })
        .finally(() => {
          this.busy = false;
        });
    }
  }

  private clearTimer(): void {
    if (this.timer !== undefined) {
      window.clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private async refreshHistory(): Promise<void> {
    if (!this.hass || this.config.show_history === false) {
      return;
    }
    try {
      this.history = await listMessages(this.hass);
    } catch {
      this.history = [];
    }
  }

  private get players(): string[] {
    return visiblePlayers(
      discoverPlayers(this.hass),
      this.config.show_players,
      this.config.hide_players,
    );
  }

  /**
   * The speakers a broadcast actually goes to. `targets` is saved config and
   * may name a speaker the filters have since removed from the card; sending
   * to one nobody can see is the failure mode this guards.
   */
  private get targets(): string[] {
    return allowedTargets(
      this.selected,
      this.config.show_players,
      this.config.hide_players,
    );
  }

  private async startRecording(): Promise<void> {
    // Ignore a re-entrant call (double-tap) while a start/stop is already
    // in flight, or if we are already recording.
    if (this.busy || this.phase === "recording") {
      return;
    }
    this.busy = true;
    this.status = undefined;
    try {
      this.recorder.onLevel((level) => {
        if (this.envelope.push(level, Date.now())) {
          this.bars = this.envelope.tail(BAR_COUNT);
        }
      });
      this.envelope.reset();
      await this.recorder.start();
    } catch (err: any) {
      this.fail(micErrorMessage(err));
      return;
    } finally {
      this.busy = false;
    }

    // Torn down while start() was in flight. disconnectedCallback already ran
    // (clearTimer with it), so transitioning here would strand a detached
    // element with a live 1s interval and the microphone held open until the
    // max-duration timer fired — up to 300s after the user navigated away.
    // Release the session instead.
    if (this.disconnected) {
      this.busy = true;
      void this.recorder
        .stop()
        .catch(() => {
          // Nothing left to recover into once the card is torn down.
        })
        .finally(() => {
          this.busy = false;
        });
      return;
    }

    this.phase = "recording";
    this.elapsed = 0;
    const limit = clampMaxDuration(this.config.max_duration);
    this.timer = window.setInterval(() => {
      this.elapsed += 1;
      if (this.elapsed >= limit) {
        void this.stopRecording();
      }
    }, 1000);
  }

  private async stopRecording(): Promise<void> {
    // Recorder.stop() throws when there is no active recording session.
    // Guard against double-taps on the stop button and against the
    // max-duration timer firing at the same instant as a manual stop —
    // both would otherwise call stop() twice for one recording.
    if (this.busy || this.phase !== "recording") {
      return;
    }
    this.busy = true;
    this.clearTimer();
    try {
      const { blob, duration } = await this.recorder.stop();
      this.setClip(freshClip(blob, duration, this.envelope.all()));
      this.phase = "idle";
    } catch (err: any) {
      // Don't strand the UI showing "recording" over a dead session — a
      // second tap would just hit Recorder.stop()'s own "no active
      // session" throw again. Whatever went wrong, the recording is gone
      // either way, so surface it and reset to idle.
      this.fail(`Could not finish recording: ${err?.message ?? err}`);
      this.phase = "idle";
    } finally {
      this.busy = false;
    }
  }

  /** Swap in a new clip, releasing the one it replaces. */
  private setClip(clip: Clip): void {
    if (this.clip && this.clip !== clip) {
      revokeClip(this.clip);
    }
    this.clip = clip;
    this.bars = clip.peaks.length ? clip.peaks : [];
  }

  private clearClip(): void {
    revokeClip(this.clip);
    this.clip = undefined;
    this.bars = [];
  }

  private seek(fraction: number): void {
    if (this.clip) {
      this.position = fraction * this.clip.duration;
    }
  }

  private fail(text: string): void {
    this.status = { kind: "error", text };
  }

  private toggleTarget(entityId: string): void {
    this.selected = this.selected.includes(entityId)
      ? this.selected.filter((id) => id !== entityId)
      : [...this.selected, entityId];
  }

  private get canBroadcast(): boolean {
    return (
      this.clip !== undefined &&
      this.targets.length > 0 &&
      this.phase !== "sending"
    );
  }

  /**
   * The id to broadcast. A fresh clip is uploaded once and then *becomes* a
   * stored clip, so retrying a partial failure — or sending the same message
   * to another speaker — never uploads a second copy.
   */
  private async messageId(clip: Clip): Promise<string> {
    const existing = storedId(clip);
    if (existing !== undefined) {
      return existing;
    }
    const blob = (clip.source as { kind: "fresh"; blob: Blob }).blob;
    const id = await uploadRecording(this.hass, blob, clip.duration);
    this.clip = { ...clip, source: { kind: "stored", id } };
    return id;
  }

  private async broadcast(): Promise<void> {
    const clip = this.clip;
    if (!clip) {
      this.fail("Record a message or pick one from below first.");
      return;
    }
    const targets = this.targets;
    if (targets.length === 0) {
      this.fail("Pick at least one speaker first.");
      return;
    }
    this.phase = "sending";
    this.status = undefined;
    try {
      const id = await this.messageId(clip);
      const { failed } = await sendBroadcast(
        this.hass,
        id,
        targets,
        this.config.mode ?? "plain",
      );
      this.phase = "idle";
      if (failed.length === 0) {
        this.status = { kind: "info", text: `Sent to ${this.describe(targets)}` };
      } else if (failed.length >= targets.length) {
        // The clip is kept in every branch now, so the old "the recording was
        // kept" reassurance is gone — nothing is ever thrown away here.
        this.fail(`Could not play on any speaker: ${this.describe(failed)}.`);
      } else {
        this.fail(`Played, but not on ${this.describe(failed)}.`);
      }
      await this.refreshHistory();
    } catch (err: any) {
      this.phase = "idle";
      this.fail(`Could not send: ${err?.message ?? err}`);
    }
  }

  /** Load a stored message so it behaves exactly like one just recorded. */
  private async loadMessage(message: BroadcastMessage): Promise<void> {
    this.loadingId = message.id;
    this.status = undefined;
    try {
      this.setClip(await loadStoredClip(this.hass, message));
    } catch (err: any) {
      this.fail(err?.message ?? String(err));
    } finally {
      this.loadingId = undefined;
    }
  }

  /** Name entity ids the way the picker does, so a warning is readable. */
  private describe(entityIds: string[]): string {
    return entityIds
      .map(
        (entityId) =>
          this.hass?.states?.[entityId]?.attributes?.friendly_name ?? entityId,
      )
      .join(", ");
  }

  private async deleteRecording(id: string): Promise<void> {
    try {
      const deleted = await deleteMessage(this.hass, id);
      if (deleted) {
        await this.refreshHistory();
      }
    } catch (err: any) {
      // The server is the authority on who may delete what — can_delete
      // just tells us what to draw. If it says yes but the delete is
      // rejected anyway (e.g. a stale can_delete from before the recording
      // changed hands), surface a clear message instead of failing silently.
      if (err?.code === "not_authorized") {
        this.fail("You do not have permission to delete this recording.");
      } else {
        this.fail(`Could not delete: ${err?.message ?? err}`);
      }
    }
  }

  render() {
    const recording = this.phase === "recording";
    return html`
      <ha-card .header=${this.config.title?.trim() || DEFAULT_TITLE}>
        ${this.status ? html`<div class="status ${this.status.kind}">${this.status.text}</div>` : nothing}

        <div class="row">
          ${visualizer({
            bars: this.bars.length ? this.bars : silence(BAR_COUNT),
            progress: this.clip ? this.position / (this.clip.duration || 1) : undefined,
            seekable: this.clip !== undefined,
            onSeek: (fraction) => this.seek(fraction),
          })}
          <div class="record-row">
            <button
              class="record"
              ?disabled=${!Recorder.isSupported() || this.phase === "sending"}
              @click=${recording ? this.stopRecording : this.startRecording}
              title=${recording ? "Stop" : "Record"}
            >
              ${recording ? "■" : "●"}
            </button>
          </div>
        </div>

        ${this.clip
          ? html`
              <div class="actions">
                <button class="action send" @click=${this.broadcast}>Broadcast</button>
                <button class="action discard" @click=${this.clearClip}>Clear</button>
              </div>
            `
          : nothing}

        <div class="targets">
          ${this.players.map(
            (entityId) => html`
              <button
                class="chip"
                data-on=${this.selected.includes(entityId)}
                @click=${() => this.toggleTarget(entityId)}
              >
                ${this.hass.states[entityId].attributes.friendly_name ?? entityId}
              </button>
            `,
          )}
        </div>

        ${this.config.show_history === false
          ? nothing
          : html`
              <div class="history">
                ${this.history.map(
                  (message) => html`
                    <div class="history-row">
                      <span>${new Date(message.created).toLocaleString()}</span>
                      <button @click=${() => this.loadMessage(message)}>Load</button>
                      ${message.can_delete
                        ? html`<button @click=${() => this.deleteRecording(message.id)}>Delete</button>`
                        : nothing}
                    </div>
                  `,
                )}
              </div>
            `}
      </ha-card>
    `;
  }
}

(window as any).customCards = (window as any).customCards ?? [];
(window as any).customCards.push({
  type: "hass-broadcast-card",
  name: "Voice Broadcast",
  description: "Record a voice message and play it on your speakers.",
  preview: false,
});

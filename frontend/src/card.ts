import { LitElement, css, html, nothing } from "lit";
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
import { clampMaxDuration } from "./editor";
import "./editor";

const SUPPORT_PLAY_MEDIA = 512;

interface CardConfig {
  type: string;
  targets?: string[];
  mode?: BroadcastMode;
  max_duration?: number;
  show_history?: boolean;
}

type Phase = "idle" | "recording" | "preview" | "sending";

@customElement("hass-broadcast-card")
export class HassBroadcastCard extends LitElement {
  @property({ attribute: false }) hass?: any;
  @state() private config: CardConfig = { type: "" };
  @state() private phase: Phase = "idle";
  @state() private level = 0;
  @state() private elapsed = 0;
  @state() private error?: string;
  @state() private selected: string[] = [];
  @state() private history: BroadcastMessage[] = [];
  @state() private previewUrl?: string;

  private recorder = new Recorder();
  private blob?: Blob;
  private duration = 0;
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

  static styles = css`
    ha-card { padding: 16px; }
    .row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .record { border: none; border-radius: 50%; width: 56px; height: 56px;
      background: var(--error-color, #db4437); color: #fff; cursor: pointer; font-size: 22px; }
    .record[disabled] { opacity: 0.5; cursor: not-allowed; }
    .meter { flex: 1; height: 6px; background: var(--divider-color, #ddd); border-radius: 3px; overflow: hidden; }
    .meter > div { height: 100%; background: var(--primary-color); transition: width 80ms linear; }
    .error { color: var(--error-color, #db4437); margin-bottom: 12px; }
    .targets { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .chip { padding: 6px 12px; border-radius: 16px; cursor: pointer;
      border: 1px solid var(--divider-color, #ddd); background: none; color: var(--primary-text-color); }
    .chip[data-on="true"] { background: var(--primary-color); color: var(--text-primary-color, #fff); }
    .history { border-top: 1px solid var(--divider-color, #ddd); margin-top: 12px; padding-top: 8px; }
    .history-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
    .history-row span { flex: 1; font-size: 0.9em; }
    audio { width: 100%; margin-bottom: 12px; }
  `;

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
      this.error = INSECURE_CONTEXT_MESSAGE;
    }
    void this.refreshHistory();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.disconnected = true;
    this.clearTimer();
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
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
    if (!this.hass) {
      return [];
    }
    return Object.keys(this.hass.states)
      .filter((entityId) => entityId.startsWith("media_player."))
      .filter(
        (entityId) =>
          (this.hass.states[entityId].attributes.supported_features &
            SUPPORT_PLAY_MEDIA) !== 0,
      )
      .sort();
  }

  private async startRecording(): Promise<void> {
    // Ignore a re-entrant call (double-tap) while a start/stop is already
    // in flight, or if we are already recording.
    if (this.busy || this.phase === "recording") {
      return;
    }
    this.busy = true;
    this.error = undefined;
    try {
      this.recorder.onLevel((level) => {
        this.level = level;
      });
      await this.recorder.start();
    } catch (err: any) {
      this.error = micErrorMessage(err);
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
      this.blob = blob;
      this.duration = duration;
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
      }
      this.previewUrl = URL.createObjectURL(blob);
      this.level = 0;
      this.phase = "preview";
    } catch (err: any) {
      // Don't strand the UI showing "recording" over a dead session — a
      // second tap would just hit Recorder.stop()'s own "no active
      // session" throw again. Whatever went wrong, the recording is gone
      // either way, so surface it and reset to idle.
      this.error = `Could not finish recording: ${err?.message ?? err}`;
      this.phase = "idle";
    } finally {
      this.busy = false;
    }
  }

  private discard(): void {
    this.blob = undefined;
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = undefined;
    }
    this.phase = "idle";
  }

  private toggleTarget(entityId: string): void {
    this.selected = this.selected.includes(entityId)
      ? this.selected.filter((id) => id !== entityId)
      : [...this.selected, entityId];
  }

  private async send(): Promise<void> {
    if (!this.blob || this.selected.length === 0) {
      this.error = "Pick at least one speaker first.";
      return;
    }
    this.phase = "sending";
    this.error = undefined;
    try {
      const id = await uploadRecording(this.hass, this.blob, this.duration);
      await sendBroadcast(
        this.hass,
        id,
        this.selected,
        this.config.mode ?? "plain",
      );
      this.discard();
      await this.refreshHistory();
    } catch (err: any) {
      // Keep the recording so it is not lost; the user can retry.
      this.error = `Could not send: ${err?.message ?? err}`;
      this.phase = "preview";
    }
  }

  private async replay(id: string): Promise<void> {
    if (this.selected.length === 0) {
      this.error = "Pick at least one speaker first.";
      return;
    }
    try {
      await sendBroadcast(this.hass, id, this.selected, this.config.mode ?? "plain");
    } catch (err: any) {
      this.error = `Could not play: ${err?.message ?? err}`;
    }
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
        this.error = "You do not have permission to delete this recording.";
      } else {
        this.error = `Could not delete: ${err?.message ?? err}`;
      }
    }
  }

  render() {
    const recording = this.phase === "recording";
    return html`
      <ha-card header="Voice Broadcast">
        ${this.error ? html`<div class="error">${this.error}</div>` : nothing}

        <div class="row">
          <button
            class="record"
            ?disabled=${!Recorder.isSupported() || this.phase === "sending"}
            @click=${recording ? this.stopRecording : this.startRecording}
            title=${recording ? "Stop" : "Record"}
          >
            ${recording ? "■" : "●"}
          </button>
          <div class="meter"><div style="width:${Math.round(this.level * 100)}%"></div></div>
          <span>${recording ? `${this.elapsed}s` : ""}</span>
        </div>

        ${this.phase === "preview" && this.previewUrl
          ? html`
              <audio controls src=${this.previewUrl}></audio>
              <div class="row">
                <button @click=${this.send}>Send</button>
                <button @click=${this.discard}>Discard</button>
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
                      <button @click=${() => this.replay(message.id)}>Play</button>
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

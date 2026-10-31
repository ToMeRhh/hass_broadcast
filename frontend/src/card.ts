import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

import {
  BroadcastMessage,
  deleteMessage,
  listMessages,
  saveRecording,
  uploadRecording,
} from "./api";
import { INSECURE_CONTEXT_MESSAGE } from "./errors";
import { allowedTargets, discoverPlayers, visiblePlayers } from "./players";
import { CardConfig, ResolvedConfig, resolveConfig } from "./config";
import { cardForm } from "./forms";
// One bundle defines both cards, so the single Lovelace resource the
// integration registers brings the tile along with the card.
import "./tile";
import {
  Clip,
  freshClip,
  loadStoredClip,
  revokeClip,
  storedId,
} from "./clip";
import { formatClock } from "./format";
import { BAR_COUNT, silence } from "./levels";
import { RecordMode, RecordingController } from "./recording";
import { Status, outcomeStatus, sendClip } from "./sending";
import { cardStyles } from "./styles";
import { compactLayout } from "./layouts/compact";
import { fullLayout } from "./layouts/full";
import { CardParts, View } from "./layouts/parts";
import { historyDialog, historySection } from "./ui/history";
import {
  bookmarkIcon,
  bookmarkOutlineIcon,
  closeIcon,
  historyIcon,
  pauseIcon,
  playIcon,
  sendIcon,
} from "./ui/icons";
import { mic } from "./ui/mic";
import { targetList } from "./ui/targets";
import { visualizer } from "./ui/visualizer";
import { volumeButton, volumeControl } from "./ui/volume";

export type { CardConfig };

/** How long a non-sticky status message holds its slot. */
export const STATUS_MS = 4000;

/** The timer warns for the last this-many seconds of a take… */
const WARN_SECONDS = 10;
/** …or the last quarter of it, whichever is shorter. */
const WARN_FRACTION = 0.25;

@customElement("hass-broadcast-card")
export class HassBroadcastCard extends LitElement {
  @property({ attribute: false }) hass?: any;
  @state() private config: CardConfig = { type: "" };
  @state() private status?: Status;
  @state() private selected: string[] = [];
  @state() private history: BroadcastMessage[] = [];
  @state() private clip?: Clip;
  /** The history row currently being fetched, for its pending state. */
  @state() private loadingId?: string;
  @state() private position = 0;
  @state() private playing = false;
  @state() private pickerOpen = false;
  @state() private historyOpen = false;
  @state() private volumeOpen = false;
  @state() private menuOpen = false;
  /** Off by default: an untouched card sends no volume override at all. */
  @state() private volumeOverride = false;
  @state() private volume = 1;
  /** A Save is in flight, so its button holds still until it lands. */
  @state() private saving = false;

  private audio?: HTMLAudioElement;
  private statusTimer?: number;

  private rec = new RecordingController(this, {
    recordMode: () => this.recordMode,
    maxDuration: () => this.resolved.maxDuration,
    noiseSuppression: () => this.resolved.noiseSuppression,
    onStart: () => this.setStatus(undefined),
    onError: (text, sticky) => this.fail(text, sticky),
    onTake: (take) => {
      this.setClip(freshClip(take.blob, take.duration, take.peaks));
    },
  });

  static styles = cardStyles;

  setConfig(config: CardConfig): void {
    this.config = config;
    this.selected = [...resolveConfig(config).selected];
  }

  // Never add a getter named `layout`: Lovelace assigns `layout` ("grid",
  // "masonry", "panel") to every card it hosts, and a getter-only property by
  // that name throws, so the card is never created. Read `resolved.layout`.
  private get resolved(): ResolvedConfig {
    return resolveConfig(this.config);
  }

  getCardSize(): number {
    // Lovelace counts in 50px units. Compact is two rows by design; full is
    // header + strip + core + a speaker dropdown, plus whatever stacks below.
    const config = this.resolved;
    if (config.layout === "compact") {
      return 2;
    }
    let size = 5;
    size += config.speakerPicker === "list" ? 4 : config.speakerPicker === "chips" ? 1 : 0;
    if (config.recentMessages === "list") {
      size += 3;
    }
    return size;
  }

  getGridOptions() {
    // No `rows`: the sections view then sizes the card to its content, which
    // is what a card whose height depends on its config needs.
    return { columns: 12, min_columns: 6 };
  }

  /** Home Assistant draws the editor from this schema; see forms.ts. */
  static getConfigForm() {
    return cardForm;
  }

  /**
   * A new card offers every speaker, so the editor starts from the full list
   * and the user removes the ones they do not want.
   */
  static getStubConfig(hass?: any): CardConfig {
    return {
      type: "custom:hass-broadcast-card",
      layout: "full",
      speaker_picker: "dropdown",
      recent_messages: "button",
      volume_control: true,
      speakers: discoverPlayers(hass),
      selected: [],
      record_mode: "push_to_talk",
      max_duration: 60,
      keep_messages: true,
      mode: "plain",
    };
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (!this.rec.supported) {
      this.status = { kind: "error", text: INSECURE_CONTEXT_MESSAGE, sticky: true };
    }
    void this.refreshHistory();
  }

  /**
   * Light dismiss for the popovers: a press anywhere outside the open one —
   * elsewhere on the card or on the dashboard — closes it, as Escape does.
   * The press is not swallowed, so tapping Send or the mic with the speaker
   * dropdown open still sends or records. Each wrap carries `data-popover`;
   * a press inside one leaves that one alone, so its own button still
   * toggles it and its rows and slider still work.
   */
  private onDocumentPointerDown = (event: PointerEvent): void => {
    const hit = event
      .composedPath()
      .map((node) => (node as HTMLElement).dataset?.popover)
      .find((name) => name !== undefined);
    if (hit !== "picker") {
      this.pickerOpen = false;
    }
    if (hit !== "volume") {
      this.volumeOpen = false;
    }
    if (hit !== "menu") {
      this.menuOpen = false;
    }
  };

  private onDocumentKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      this.closePopovers();
    }
  };

  private listening = false;

  private closePopovers(): void {
    this.pickerOpen = false;
    this.volumeOpen = false;
    this.menuOpen = false;
  }

  /** The document listeners, attached only while a popover is open. */
  private listen(on: boolean): void {
    if (on === this.listening) {
      return;
    }
    this.listening = on;
    // Capture, so a handler that stops propagation cannot keep a menu open.
    if (on) {
      document.addEventListener("pointerdown", this.onDocumentPointerDown, true);
      document.addEventListener("keydown", this.onDocumentKeyDown, true);
    } else {
      document.removeEventListener("pointerdown", this.onDocumentPointerDown, true);
      document.removeEventListener("keydown", this.onDocumentKeyDown, true);
    }
  }

  protected updated(): void {
    this.listen(this.pickerOpen || this.volumeOpen || this.menuOpen);
    // `historyOpen` renders the <dialog> element; showModal() is what puts it
    // in the top layer and brings the backdrop, Escape and focus trap with it.
    // A bare `open` attribute renders the same markup inline instead, so the
    // call has to happen here. The optional calls keep this a no-op under the
    // tests' SSR DOM shim, which has a renderRoot but no query methods.
    const dialog = (this.renderRoot as any)?.querySelector?.(
      "dialog",
    ) as HTMLDialogElement | null;
    if (dialog && !dialog.open) {
      dialog.showModal?.();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopPlayback();
    this.clearStatusTimer();
    revokeClip(this.clip);
    // Dashboard navigation moves the element rather than recreating it, so
    // on re-attach connectedCallback runs again on this same instance. A
    // clip left in place would render an enabled Play/Send over the object
    // URL just revoked above.
    this.clip = undefined;
    // Same reason: a dialog left open would showModal() itself back onto the
    // screen the next time connectedCallback runs on this instance.
    this.historyOpen = false;
    this.closePopovers();
    this.listen(false);
  }

  private async refreshHistory(): Promise<void> {
    if (!this.hass || this.resolved.recentMessages === "off") {
      return;
    }
    try {
      this.history = await listMessages(this.hass);
    } catch {
      this.history = [];
    }
  }

  private get players(): string[] {
    return visiblePlayers(discoverPlayers(this.hass), this.resolved.speakers);
  }

  /**
   * The speakers a broadcast actually goes to: the selection, limited to the
   * speakers the card offers. Sending to one nobody can see on the card is the
   * failure mode this guards.
   */
  private get targets(): string[] {
    return allowedTargets(this.selected, this.resolved.speakers);
  }

  private get recordMode(): RecordMode {
    return this.resolved.recordMode;
  }

  // --- status --------------------------------------------------------------

  private clearStatusTimer(): void {
    if (this.statusTimer !== undefined) {
      window.clearTimeout(this.statusTimer);
      this.statusTimer = undefined;
    }
  }

  /**
   * Show a message in the strip. It holds the slot for STATUS_MS and then
   * hands it back, unless it is sticky — a condition the user has to fix
   * before anything else will work.
   */
  private setStatus(status: Status | undefined): void {
    this.clearStatusTimer();
    this.status = status;
    if (status && !status.sticky) {
      this.statusTimer = window.setTimeout(() => {
        this.statusTimer = undefined;
        if (this.status === status) {
          this.status = undefined;
        }
      }, STATUS_MS);
    }
  }

  private fail(text: string, sticky = false): void {
    this.setStatus({ kind: "error", text, sticky });
  }

  // --- clip and playback ---------------------------------------------------

  /** Swap in a new clip, releasing the one it replaces. */
  private setClip(clip: Clip): void {
    this.stopPlayback();
    if (this.clip && this.clip !== clip) {
      revokeClip(this.clip);
    }
    this.clip = clip;
  }

  private clearClip(): void {
    this.stopPlayback();
    revokeClip(this.clip);
    this.clip = undefined;
  }

  private seek(fraction: number): void {
    if (!this.clip) {
      return;
    }
    this.position = fraction * this.clip.duration;
    const audio = this.ensureAudio();
    if (audio && audio.src === this.clip.url) {
      audio.currentTime = this.position;
    }
  }

  /**
   * The `<audio>` element is created on demand and never rendered: the card
   * draws its own transport, and the tests run in plain Node where `Audio`
   * does not exist at all.
   */
  private ensureAudio(): HTMLAudioElement | undefined {
    if (typeof Audio === "undefined") {
      return undefined;
    }
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.addEventListener("timeupdate", () => {
        this.position = this.audio?.currentTime ?? 0;
      });
      this.audio.addEventListener("ended", () => {
        this.playing = false;
        this.position = 0;
      });
    }
    return this.audio;
  }

  private togglePlay(): void {
    const audio = this.ensureAudio();
    if (!audio || !this.clip) {
      return;
    }
    if (this.playing) {
      audio.pause();
      this.playing = false;
      return;
    }
    if (audio.src !== this.clip.url) {
      audio.src = this.clip.url;
      audio.currentTime = this.position;
    }
    void audio.play().then(
      () => {
        this.playing = true;
      },
      (err: any) => {
        this.fail(`Could not play that here: ${err?.message ?? err}`);
      },
    );
  }

  private stopPlayback(): void {
    this.audio?.pause();
    this.playing = false;
    this.position = 0;
  }

  // --- broadcasting --------------------------------------------------------

  private toggleTarget(entityId: string): void {
    this.selected = this.selected.includes(entityId)
      ? this.selected.filter((id) => id !== entityId)
      : [...this.selected, entityId];
  }

  private get canBroadcast(): boolean {
    return (
      this.clip !== undefined &&
      this.targets.length > 0 &&
      this.rec.phase === "idle" &&
      // A send started mid-save swaps in a temporary source, so the save's
      // result would be dropped and the clip saved twice on a second tap.
      !this.saving
    );
  }

  private async broadcast(): Promise<void> {
    // Send is only ever enabled at phase === "idle" (see canBroadcast), but
    // broadcast() is also reachable directly (tests, and any stale event
    // still in flight), so re-check here too: sending mid-take would flip
    // phase to "sending" and then "idle" while the recorder is still active,
    // and every stop path is gated on phase === "recording" — the recorder
    // would never be told to stop.
    if (this.rec.phase !== "idle" || this.saving) {
      return;
    }
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
    this.rec.setSending(true);
    this.setStatus(undefined);
    try {
      const outcome = await sendClip({
        hass: this.hass,
        clip,
        targets,
        mode: this.resolved.mode,
        volume: this.volumeOverride ? this.volume : undefined,
        keep: this.resolved.keepMessages,
        onStored: (source) => {
          // The upload can outlive the clip it was for: a Discard tap
          // mid-upload runs clearClip() before this resolves. Only rewrite
          // the source if this is still the clip the card is holding, or a
          // cleared clip comes back holding an already-revoked object URL.
          if (this.clip === clip) {
            this.clip = { ...clip, source };
          }
        },
      });
      this.rec.setSending(false);
      // The clip is kept in every branch: sending the same message to another
      // speaker, or retrying the ones that failed, must not need a re-record.
      this.setStatus(outcomeStatus(this.hass, outcome));
      await this.refreshHistory();
    } catch (err: any) {
      this.rec.setSending(false);
      // Deleted from another card or device since it was loaded: the audio
      // still plays from its object URL, but there is nothing left to send.
      if (err?.code === "not_found" && storedId(clip) !== undefined) {
        if (this.clip === clip) {
          this.clearClip();
        }
        this.fail("That recording was deleted.");
        await this.refreshHistory();
        return;
      }
      this.fail(`Could not send: ${err?.message ?? err}`);
    }
  }

  /**
   * Keep the loaded clip in history, on a card whose sends are temporary.
   * A temporary clip is promoted where it lies; one that expired before the
   * tap (or a fresh one never sent) is uploaded as a saved recording instead.
   */
  private async saveClip(): Promise<void> {
    const clip = this.clip;
    if (!clip || clip.source.kind === "stored" || this.saving) {
      return;
    }
    const source = clip.source;
    this.saving = true;
    try {
      let id: string;
      if (source.kind === "temporary") {
        try {
          await saveRecording(this.hass, source.id);
          id = source.id;
        } catch (err: any) {
          if (err?.code !== "not_found") {
            throw err;
          }
          id = await uploadRecording(this.hass, source.blob, clip.duration);
        }
      } else {
        id = await uploadRecording(this.hass, source.blob, clip.duration);
      }
      // As in broadcast(): a Discard tap mid-save must not bring the clip back.
      if (this.clip === clip) {
        this.clip = { ...clip, source: { kind: "stored", id } };
      }
      await this.refreshHistory();
    } catch (err: any) {
      this.fail(`Could not save: ${err?.message ?? err}`);
    } finally {
      this.saving = false;
    }
  }

  // --- history -------------------------------------------------------------

  /** Load a stored message so it behaves exactly like one just recorded. */
  private async loadMessage(message: BroadcastMessage): Promise<void> {
    this.loadingId = message.id;
    this.historyOpen = false;
    this.setStatus(undefined);
    try {
      this.setClip(await loadStoredClip(this.hass, message));
    } catch (err: any) {
      this.fail(err?.message ?? String(err));
    } finally {
      this.loadingId = undefined;
    }
  }

  private async deleteRecording(id: string): Promise<void> {
    try {
      const deleted = await deleteMessage(this.hass, id);
      // Either way the server no longer has it, so a loaded copy would play
      // but could never be sent.
      if (this.clip && storedId(this.clip) === id) {
        this.clearClip();
      }
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

  // --- rendering -----------------------------------------------------------

  private get hint(): string {
    return this.recordMode === "push_to_talk" ? "Hold to talk" : "Tap to record";
  }

  /**
   * The record button's title/aria-label. Deliberately static within a
   * phase: some screen readers re-announce a changed aria-label on the
   * focused element, so a label that ticked once a second narrated the whole
   * take. The timer lives in the strip instead.
   */
  private get recordLabel(): string {
    if (this.rec.phase === "sending") {
      return "Broadcasting";
    }
    if (this.rec.phase === "recording") {
      return this.recordMode === "push_to_talk"
        ? "Recording — release to stop"
        : "Recording — tap to stop";
    }
    return this.hint;
  }

  /** Which layer the state-dependent slots show. */
  private get view(): View {
    if (this.rec.phase === "recording" || this.rec.phase === "finishing") {
      return "recording";
    }
    if (this.status) {
      return "status";
    }
    return this.clip ? "review" : "idle";
  }

  private get timerWarning(): boolean {
    const limit = this.resolved.maxDuration;
    const window = Math.min(WARN_SECONDS, limit * WARN_FRACTION);
    return this.view === "recording" && limit - this.rec.elapsed <= window;
  }

  private historyProps() {
    return {
      messages: this.history,
      loadedId: this.clip ? storedId(this.clip) : undefined,
      loadingId: this.loadingId,
      onLoad: (message: BroadcastMessage) => void this.loadMessage(message),
      onDelete: (id: string) => void this.deleteRecording(id),
      onDialogOpenChange: (open: boolean) => {
        this.historyOpen = open;
      },
    };
  }

  private get parts(): CardParts {
    const recording = this.rec.phase === "recording";
    const sending = this.rec.phase === "sending";
    const reviewing = this.clip !== undefined && this.view !== "recording";
    const volumeProps = {
      enabled: this.volumeOverride,
      value: this.volume,
      onToggle: () => {
        this.volumeOverride = !this.volumeOverride;
      },
      onChange: (value: number) => {
        this.volume = value;
      },
    };
    const config = this.resolved;
    return {
      title: config.title,
      view: this.view,
      speakerPicker: config.speakerPicker,
      recentMessages: config.recentMessages,
      volumeControl: config.volumeControl,
      hint: this.hint,
      timer: formatClock(this.rec.elapsed),
      timerWarning: this.timerWarning,
      status: this.status,
      reviewing,
      mic: (size) =>
        mic({
          size,
          recording,
          disabled: !this.rec.supported || sending,
          recordMode: this.recordMode,
          level: this.rec.level,
          maxDuration: this.resolved.maxDuration,
          label: this.recordLabel,
          onPressStart: (event) => void this.rec.onPressStart(event),
          onPressEnd: () => void this.rec.onPressEnd(),
        }),
      play: () => html`
        <button
          class="icon play"
          ?disabled=${!reviewing || sending}
          title=${this.playing ? "Pause" : "Play"}
          aria-label=${this.playing ? "Pause" : "Play"}
          @click=${() => this.togglePlay()}
        >
          ${this.playing ? pauseIcon : playIcon}
        </button>
      `,
      // Keyed on the clip, so each new clip gets fresh bars and its draw-in
      // plays exactly once rather than on every re-render.
      waveform: (className) => html`${keyed(
          this.clip?.url ?? "none",
          visualizer({
            bars: this.clip?.peaks.length ? this.clip.peaks : silence(BAR_COUNT),
            progress: this.clip ? this.position / (this.clip.duration || 1) : undefined,
            seekable: reviewing && !sending,
            recording: false,
            onSeek: (fraction) => this.seek(fraction),
            className: `${className} reveal`,
          }),
        )}`,
      clipLength: formatClock(this.clip?.duration ?? 0),
      discard: () => html`
        <button
          class="icon discard"
          ?disabled=${!reviewing || sending}
          title="Discard"
          aria-label="Discard"
          @click=${() => this.clearClip()}
        >
          ${closeIcon}
        </button>
      `,
      send: (variant) => {
        const count = this.targets.length;
        const label = count > 1 ? `Send to ${count}` : "Send";
        return html`
          <div class="send-wrap send-wrap-${variant}">
            <button
              class="send send-${variant}"
              ?disabled=${!this.canBroadcast}
              data-sending=${sending}
              title=${label}
              aria-label=${sending ? "Broadcasting" : label}
              @click=${() => void this.broadcast()}
            >
              ${sending ? html`<span class="spinner" aria-hidden="true"></span>` : sendIcon}
              ${variant === "pill" ? html`<span>Send</span>` : nothing}
            </button>
            ${variant === "round" ? html`<span class="caption">${label}</span>` : nothing}
          </div>
        `;
      },
      save: (variant) => {
        const clip = this.clip;
        if (config.keepMessages || !clip) {
          return nothing;
        }
        // "Saved" stays focusable and announced, hence aria-disabled rather
        // than disabled; its click is a no-op. The box is the same in both
        // states, so the swap moves nothing.
        const saved = clip.source.kind === "stored";
        const label = saved ? "Saved to history" : "Save to history";
        return html`
          <button
            class="save save-${variant}"
            ?disabled=${!saved && (this.saving || sending)}
            aria-disabled=${saved ? "true" : "false"}
            data-saved=${saved}
            title=${label}
            aria-label=${label}
            @click=${() => {
              if (!saved) {
                void this.saveClip();
              }
            }}
          >
            ${saved ? bookmarkIcon : bookmarkOutlineIcon}
            ${variant === "pill" ? html`<span>${saved ? "Saved" : "Save"}</span>` : nothing}
          </button>
        `;
      },
      speakers: () =>
        targetList({
          players: this.players.map((entityId) => ({
            entityId,
            name:
              this.hass?.states?.[entityId]?.attributes?.friendly_name ?? entityId,
            available: this.hass?.states?.[entityId]?.state !== "unavailable",
          })),
          selected: this.selected,
          style: config.speakerPicker,
          open: this.pickerOpen,
          onToggle: (entityId) => this.toggleTarget(entityId),
          onOpenChange: (open) => {
            this.pickerOpen = open;
          },
        }),
      // The dialog is rendered once, by historyDialog below, whichever style
      // opened it.
      historyList: () => historySection({ ...this.historyProps(), dialogOpen: false }),
      historyButton: () => html`
        <button
          class="icon"
          title="Recent messages"
          aria-label="Recent messages"
          @click=${() => {
            this.historyOpen = true;
          }}
        >
          ${historyIcon}
        </button>
      `,
      volumeButton: () =>
        volumeButton({
          ...volumeProps,
          open: this.volumeOpen,
          onOpenChange: (open) => {
            this.volumeOpen = open;
          },
        }),
      volumePanel: () => volumeControl(volumeProps),
      historyDialog: () =>
        this.historyOpen ? historyDialog(this.historyProps()) : nothing,
      menuOpen: this.menuOpen,
      onMenuOpenChange: (open) => {
        this.menuOpen = open;
      },
      onOpenHistory: () => {
        this.historyOpen = true;
      },
    };
  }

  render() {
    const parts = this.parts;
    return html`
      <ha-card>
        ${this.resolved.layout === "compact" ? compactLayout(parts) : fullLayout(parts)}
        <div class="sr-only" aria-live="polite">${this.status?.text ?? ""}</div>
      </ha-card>
    `;
  }
}

(window as any).customCards = (window as any).customCards ?? [];
(window as any).customCards.push({
  type: "hass-broadcast-card",
  name: "Voice Broadcast",
  description: "Record a voice message and play it on your speakers.",
  preview: true,
});

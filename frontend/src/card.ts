import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

import {
  BroadcastMessage,
  BroadcastMode,
  deleteMessage,
  listMessages,
} from "./api";
import { INSECURE_CONTEXT_MESSAGE } from "./errors";
import { allowedTargets, discoverPlayers, visiblePlayers } from "./players";
import { clampMaxDuration } from "./editor-fields";
import "./editor";
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
import {
  Layout,
  Section,
  findSection,
  resolveLayout,
  resolveSections,
} from "./sections";
import { cardStyles } from "./styles";
import { compactLayout } from "./layouts/compact";
import { fullLayout } from "./layouts/full";
import { CardParts, View } from "./layouts/parts";
import { historyDialog, historySection } from "./ui/history";
import { closeIcon, historyIcon, pauseIcon, playIcon, sendIcon } from "./ui/icons";
import { mic } from "./ui/mic";
import { targetList } from "./ui/targets";
import { visualizer } from "./ui/visualizer";
import { volumeButton, volumeControl } from "./ui/volume";

const DEFAULT_TITLE = "Voice Broadcast";

/** How long a non-sticky status message holds its slot. */
export const STATUS_MS = 4000;

/** The timer warns for the last this-many seconds of a take… */
const WARN_SECONDS = 10;
/** …or the last quarter of it, whichever is shorter. */
const WARN_FRACTION = 0.25;

export interface CardConfig {
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
  noise_suppression?: boolean;
  /** How the record button behaves. Absent means push-to-talk. */
  record_mode?: RecordMode;
  /** Absent means full. */
  layout?: Layout;
  /** What the card shows around its record core. See sections.ts. */
  sections?: { type: string; style?: string }[];
  /** Legacy, read only when `sections` is absent. */
  show_history?: boolean;
  /** Legacy, read only when `sections` is absent. */
  player_list?: "rows" | "chips" | "dropdown";
}

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

  private audio?: HTMLAudioElement;
  private statusTimer?: number;

  private rec = new RecordingController(this, {
    recordMode: () => this.recordMode,
    maxDuration: () => clampMaxDuration(this.config.max_duration),
    noiseSuppression: () => this.config.noise_suppression === true,
    onStart: () => this.setStatus(undefined),
    onError: (text, sticky) => this.fail(text, sticky),
    onTake: (take) => {
      this.setClip(freshClip(take.blob, take.duration, take.peaks));
    },
  });

  static styles = cardStyles;

  setConfig(config: CardConfig): void {
    this.config = config;
    this.selected = config.targets ? [...config.targets] : [];
  }

  // Not `layout`: Lovelace assigns `layout` ("grid", "masonry", "panel") to
  // every card it hosts, and a getter-only property by that name throws, so
  // the card is never created.
  private get cardLayout(): Layout {
    return resolveLayout(this.config);
  }

  private get sections(): Section[] {
    return resolveSections(this.config);
  }

  getCardSize(): number {
    // Lovelace counts in 50px units. Compact is two rows by design; full is
    // header + strip + core + a speaker pill, plus whatever stacks below.
    if (this.cardLayout === "compact") {
      return 2;
    }
    let size = 5;
    for (const section of this.sections) {
      if (section.type === "speakers") {
        size += section.style === "rows" ? 4 : section.style === "chips" ? 1 : 0;
      } else if (section.type === "history" && section.style === "list") {
        size += 3;
      }
    }
    return size;
  }

  getGridOptions() {
    // No `rows`: the sections view then sizes the card to its content, which
    // is what a card whose height depends on its sections needs.
    return { columns: 12, min_columns: 6 };
  }

  static getConfigElement() {
    return document.createElement("hass-broadcast-card-editor");
  }

  static getStubConfig(): CardConfig {
    return {
      type: "custom:hass-broadcast-card",
      targets: [],
      mode: "plain",
      record_mode: "push_to_talk",
      layout: "full",
      sections: [
        { type: "speakers", style: "pill" },
        { type: "history", style: "icon" },
        { type: "volume", style: "icon" },
      ],
    };
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (!this.rec.supported) {
      this.status = { kind: "error", text: INSECURE_CONTEXT_MESSAGE, sticky: true };
    }
    void this.refreshHistory();
  }

  protected updated(): void {
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
    this.menuOpen = false;
    this.volumeOpen = false;
  }

  private async refreshHistory(): Promise<void> {
    if (!this.hass || !findSection(this.sections, "history")) {
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

  private get recordMode(): RecordMode {
    return this.config.record_mode === "start_stop"
      ? "start_stop"
      : "push_to_talk";
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
      this.rec.phase === "idle"
    );
  }

  private async broadcast(): Promise<void> {
    // Send is only ever enabled at phase === "idle" (see canBroadcast), but
    // broadcast() is also reachable directly (tests, and any stale event
    // still in flight), so re-check here too: sending mid-take would flip
    // phase to "sending" and then "idle" while the recorder is still active,
    // and every stop path is gated on phase === "recording" — the recorder
    // would never be told to stop.
    if (this.rec.phase !== "idle") {
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
        mode: this.config.mode ?? "plain",
        volume: this.volumeOverride ? this.volume : undefined,
        onStored: (id) => {
          // The upload can outlive the clip it was for: a Discard tap
          // mid-upload runs clearClip() before this resolves. Only rewrite
          // the source if this is still the clip the card is holding, or a
          // cleared clip comes back holding an already-revoked object URL.
          if (this.clip === clip) {
            this.clip = { ...clip, source: { kind: "stored", id } };
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
      this.fail(`Could not send: ${err?.message ?? err}`);
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
    if (this.rec.phase === "recording") {
      return "recording";
    }
    if (this.status) {
      return "status";
    }
    return this.clip ? "review" : "idle";
  }

  private get timerWarning(): boolean {
    const limit = clampMaxDuration(this.config.max_duration);
    const window = Math.min(WARN_SECONDS, limit * WARN_FRACTION);
    return this.rec.phase === "recording" && limit - this.rec.elapsed <= window;
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
    const reviewing = this.clip !== undefined && !recording;
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
    return {
      title: this.config.title?.trim() || DEFAULT_TITLE,
      view: this.view,
      sections: this.sections,
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
          maxDuration: clampMaxDuration(this.config.max_duration),
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
      speakers: (section) =>
        targetList({
          players: this.players.map((entityId) => ({
            entityId,
            name:
              this.hass?.states?.[entityId]?.attributes?.friendly_name ?? entityId,
            available: this.hass?.states?.[entityId]?.state !== "unavailable",
          })),
          selected: this.selected,
          style: section.style,
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
        ${this.cardLayout === "compact" ? compactLayout(parts) : fullLayout(parts)}
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
  preview: false,
});

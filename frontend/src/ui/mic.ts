import { TemplateResult, html } from "lit";

import { RecordMode } from "../recording";
import { micIcon, stopIcon } from "./icons";

export interface MicProps {
  /**
   * Button diameter: px, or any CSS length (the tile's grows with its cell).
   * The blob and arc scale from it.
   */
  size: number | string;
  recording: boolean;
  disabled: boolean;
  recordMode: RecordMode;
  /** Latest live level, 0..1. Drives the blob's scale while recording. */
  level: number;
  /** Seconds; the countdown arc takes exactly this long to close. */
  maxDuration: number;
  /** title/aria-label. Keep it static within a phase — see the card. */
  label: string;
  onPressStart: (event: Event) => void;
  /** The press ended; a pointer event says where it was let go. */
  onPressEnd: (event?: PointerEvent) => void;
  /** The held pointer moved, wherever it is on the page. */
  onPressMove?: (event: PointerEvent) => void;
}

/**
 * Keep a push-to-talk press on the button wherever the pointer goes, so only
 * letting go ends it. Touch does this by itself; a mouse otherwise left the
 * button the moment it slid off its edge, and that ended the take (on the
 * tile, sent it).
 */
function hold(event: PointerEvent): void {
  const button = event.currentTarget as Element | null;
  try {
    button?.setPointerCapture?.(event.pointerId);
  } catch {
    // A pointer the browser no longer considers active: nothing to hold.
  }
}

/** How much louder speech grows the blob, as a fraction of the button. */
const LEVEL_GAIN = 0.35;

/**
 * The record button and its recording animation.
 *
 * Two layers sit behind and on the button while a take runs: a blob whose
 * size follows the voice (`--level`, updated ~20 times a second from the
 * level envelope) and wobbles on its own, and a countdown arc on the rim that
 * closes over `max_duration`. Both are CSS: the arc's animation is attached
 * only while recording, so it restarts from zero on every take without any
 * per-frame script.
 */
export function mic(props: MicProps): TemplateResult {
  const level = Math.min(1, Math.max(0, props.level || 0));
  const size = typeof props.size === "number" ? `${props.size}px` : props.size;
  return html`
    <div
      class="mic-wrap"
      data-recording=${props.recording}
      data-mode=${props.recordMode}
      style="--mic:${size};--grow:${(1 + level * LEVEL_GAIN).toFixed(3)};--limit:${props.maxDuration}s"
    >
      <div class="mic-level" aria-hidden="true">
        <span class="blob blob-outer"></span>
        <span class="blob blob-inner"></span>
      </div>
      <button
        class="mic"
        ?disabled=${props.disabled}
        @pointerdown=${(event: PointerEvent) => {
          if (props.recordMode === "push_to_talk") {
            hold(event);
          }
          props.onPressStart(event);
        }}
        @pointermove=${(event: PointerEvent) => props.onPressMove?.(event)}
        @pointerup=${(event: PointerEvent) => props.onPressEnd(event)}
        @pointercancel=${(event: PointerEvent) => props.onPressEnd(event)}
        @contextmenu=${(event: Event) => event.preventDefault()}
        @keydown=${(event: KeyboardEvent) => {
          // Auto-repeat would otherwise restart the take ~30 times a second.
          if (!event.repeat && (event.key === " " || event.key === "Enter")) {
            props.onPressStart(event);
          }
        }}
        @keyup=${(event: KeyboardEvent) => {
          if (event.key === " " || event.key === "Enter") {
            props.onPressEnd();
          }
        }}
        title=${props.label}
        aria-label=${props.label}
      >
        <span class="mic-glyph mic-glyph-mic">${micIcon}</span>
        <span class="mic-glyph mic-glyph-stop">${stopIcon}</span>
      </button>
      <svg class="mic-arc" viewBox="0 0 100 100" aria-hidden="true">
        <circle class="mic-arc-track" cx="50" cy="50" r="46" pathLength="100" />
        <circle class="mic-arc-fill" cx="50" cy="50" r="46" pathLength="100" />
      </svg>
    </div>
  `;
}

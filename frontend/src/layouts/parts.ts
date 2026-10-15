import { TemplateResult, nothing } from "lit";

import { Status } from "../sending";
import { RecentMessages, SpeakerPicker } from "../config";

/** Which layer the state-dependent slots show. */
export type View = "idle" | "recording" | "review" | "status";

/**
 * Everything a layout arranges, rendered by the card.
 *
 * Layouts decide only *where* things go and at what size; the card owns
 * state and behaviour. Keeping the boundary here means a layout is a plain
 * template function that never touches the recorder, the clip or `hass`.
 */
export interface CardParts {
  title: string;
  view: View;
  /** Full only; compact always draws the dropdown. */
  speakerPicker: SpeakerPicker;
  recentMessages: RecentMessages;
  volumeControl: boolean;
  /** "Hold to talk" / "Tap to record". */
  hint: string;
  /** Elapsed time while recording, e.g. "0:07". */
  timer: string;
  /** The take is close to `max_duration`. */
  timerWarning: boolean;
  status?: Status;
  /** True when Discard should be offered (a clip is loaded). */
  reviewing: boolean;

  mic: (size: number) => TemplateResult;
  /** Play/pause for the loaded clip. */
  play: () => TemplateResult;
  /** The loaded clip's waveform; `className` sizes it per layout. */
  waveform: (className: string) => TemplateResult;
  /** The loaded clip's length, e.g. "0:07". */
  clipLength: string;
  discard: () => TemplateResult;
  send: (variant: "round" | "pill") => TemplateResult;

  speakers: () => TemplateResult;
  historyList: () => TemplateResult;
  historyButton: () => TemplateResult;
  volumeButton: () => TemplateResult;
  /** Volume toggle + slider, for the compact menu. */
  volumePanel: () => TemplateResult;
  /** The full-list dialog, when open; `nothing` otherwise. */
  historyDialog: () => TemplateResult | typeof nothing;

  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onOpenHistory: () => void;
}

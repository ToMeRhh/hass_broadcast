/**
 * The card's and the tile's configuration, and the one place each is
 * interpreted.
 *
 * Every key maps to exactly one field of the editor form (`forms.ts`). Nothing
 * here is ordered: the layouts decide where each part goes, so the config only
 * says whether, and in which style, it appears.
 */
import type { BroadcastMode } from "./api";
import type { RecordMode } from "./recording";

export type Layout = "full" | "compact";
export type SpeakerPicker = "dropdown" | "chips" | "list";
export type RecentMessages = "off" | "button" | "list";

export const DEFAULT_TITLE = "Voice Broadcast";

/** The card config as written in YAML or by the editor. */
export interface CardConfig {
  type: string;
  /** Card heading. Absent or blank means DEFAULT_TITLE. */
  title?: string;
  layout?: Layout;
  /** How speakers are picked in `full`; `compact` always uses the dropdown. */
  speaker_picker?: SpeakerPicker;
  recent_messages?: RecentMessages;
  volume_control?: boolean;
  /** The speakers the card offers. Absent means every speaker; [] means none. */
  speakers?: string[];
  /** Speakers ticked when the card opens. */
  selected?: string[];
  record_mode?: RecordMode;
  /** Recording time limit in seconds. */
  max_duration?: number;
  /** The browser's noise suppression on the mic. Absent means off. */
  noise_suppression?: boolean;
  /** Add every sent message to Recent messages. Absent means keep. */
  keep_messages?: boolean;
  mode?: BroadcastMode;
}

export interface ResolvedConfig {
  title: string;
  layout: Layout;
  speakerPicker: SpeakerPicker;
  recentMessages: RecentMessages;
  volumeControl: boolean;
  /** Undefined means every speaker discovery finds. */
  speakers: string[] | undefined;
  /** Already limited to `speakers`. */
  selected: string[];
  recordMode: RecordMode;
  maxDuration: number;
  noiseSuppression: boolean;
  keepMessages: boolean;
  mode: BroadcastMode;
}

/** The tile config as written in YAML or by the editor. */
export interface TileConfig {
  type: string;
  /** The tile's label. Absent or blank means DEFAULT_TITLE. */
  name?: string;
  /** The speakers every message goes to. */
  speakers?: string[];
  shape?: TileShape;
  /** Recording time limit in seconds. */
  max_duration?: number;
  /** The browser's noise suppression on the mic. Absent means off. */
  noise_suppression?: boolean;
  /** Add every sent message to Recent messages. Absent means keep. */
  keep_messages?: boolean;
  mode?: BroadcastMode;
}

export type TileShape = "square" | "horizontal";

export interface ResolvedTileConfig {
  name: string;
  /** Unlike the card's, absent means none: a tile never sends to everyone. */
  speakers: string[];
  shape: TileShape;
  maxDuration: number;
  noiseSuppression: boolean;
  keepMessages: boolean;
  mode: BroadcastMode;
}

/** `value` when it is one of `allowed`, otherwise the first of them. */
function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T {
  return allowed.includes(value as T) ? (value as T) : allowed[0];
}

/** Clamp max_duration to [5, 300] seconds, defaulting to 60 for nonsense. */
export function clampMaxDuration(value: unknown): number {
  if (value === "" || value === null || value === undefined) {
    return 60;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return 60;
  }
  return Math.min(300, Math.max(5, num));
}

export const MODES: readonly BroadcastMode[] = ["plain", "chime", "restore"];

export function resolveMode(value: unknown): BroadcastMode {
  return oneOf(value, MODES);
}

export function resolveConfig(config: CardConfig): ResolvedConfig {
  const layout = oneOf(config.layout, ["full", "compact"] as const);
  const speakers = Array.isArray(config.speakers)
    ? [...new Set(config.speakers)]
    : undefined;
  const offered = speakers ? new Set(speakers) : undefined;
  const selected = (Array.isArray(config.selected) ? config.selected : []).filter(
    (entityId) => !offered || offered.has(entityId),
  );
  return {
    title: config.title?.trim() || DEFAULT_TITLE,
    layout,
    // Chips and a list need the height compact exists to save.
    speakerPicker:
      layout === "compact"
        ? "dropdown"
        : oneOf(config.speaker_picker, ["dropdown", "chips", "list"] as const),
    recentMessages: oneOf(config.recent_messages, ["button", "off", "list"] as const),
    volumeControl: config.volume_control !== false,
    speakers,
    selected,
    recordMode: oneOf(config.record_mode, ["push_to_talk", "start_stop"] as const),
    maxDuration: clampMaxDuration(config.max_duration),
    noiseSuppression: config.noise_suppression === true,
    keepMessages: config.keep_messages !== false,
    mode: resolveMode(config.mode),
  };
}

export function resolveTileConfig(config: TileConfig): ResolvedTileConfig {
  return {
    name: config.name?.trim() || DEFAULT_TITLE,
    speakers: Array.isArray(config.speakers) ? [...new Set(config.speakers)] : [],
    shape: oneOf(config.shape, ["square", "horizontal"] as const),
    maxDuration: clampMaxDuration(config.max_duration),
    noiseSuppression: config.noise_suppression === true,
    keepMessages: config.keep_messages !== false,
    mode: resolveMode(config.mode),
  };
}

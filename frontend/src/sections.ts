/**
 * What the card shows around its record core, and in what order.
 *
 * The core — strip, mic, discard and send — is fixed per layout so it can
 * guarantee that nothing moves between idle, recording and review. Everything
 * else is a section the user can reorder, restyle or hide from the editor.
 */

export type Layout = "full" | "compact";

export type SpeakerStyle = "pill" | "chips" | "rows";
export type HistoryStyle = "list" | "icon";
export type VolumeStyle = "icon";

export type Section =
  | { type: "speakers"; style: SpeakerStyle }
  | { type: "history"; style: HistoryStyle }
  | { type: "volume"; style: VolumeStyle };

export type SectionType = Section["type"];

/** Every section type, in the order the editor lists hidden ones. */
export const SECTION_TYPES: SectionType[] = ["speakers", "history", "volume"];

/** The style a section gets when the config names none. */
export const DEFAULT_STYLES = {
  speakers: "pill",
  history: "list",
  volume: "icon",
} as const;

/** The styles each section type accepts. */
export const SECTION_STYLES: { [K in SectionType]: readonly string[] } = {
  speakers: ["pill", "chips", "rows"],
  history: ["list", "icon"],
  volume: ["icon"],
};

/** The slice of card config this module reads. */
export interface SectionsConfig {
  layout?: string;
  sections?: { type?: string; style?: string }[];
  /** Legacy: the speaker-list style before sections existed. */
  player_list?: string;
  /** Legacy: whether the recent-messages list showed. */
  show_history?: boolean;
}

export function resolveLayout(config: SectionsConfig): Layout {
  return config.layout === "compact" ? "compact" : "full";
}

function isSectionType(type: unknown): type is SectionType {
  return SECTION_TYPES.includes(type as SectionType);
}

function styleFor(type: SectionType, style: unknown): string {
  return SECTION_STYLES[type].includes(style as string)
    ? (style as string)
    : DEFAULT_STYLES[type];
}

/**
 * The sections a card predating the `sections` key had.
 *
 * `dropdown` becomes `pill`: the old dropdown was already a single summary
 * line that opened a panel, which is what the pill is.
 */
function legacySections(config: SectionsConfig): Section[] {
  const speakers: SpeakerStyle =
    config.player_list === "chips"
      ? "chips"
      : config.player_list === "dropdown"
        ? "pill"
        : "rows";
  const sections: Section[] = [{ type: "speakers", style: speakers }];
  if (config.show_history !== false) {
    sections.push({ type: "history", style: "list" });
  }
  sections.push({ type: "volume", style: "icon" });
  return sections;
}

/**
 * The card's sections, normalised: valid types only, one of each, valid
 * styles, speakers always present, and the layout's own constraints applied.
 */
export function resolveSections(config: SectionsConfig): Section[] {
  let sections: Section[];
  if (Array.isArray(config.sections)) {
    const seen = new Set<SectionType>();
    sections = [];
    for (const entry of config.sections) {
      const type = entry?.type;
      if (!isSectionType(type) || seen.has(type)) {
        continue;
      }
      seen.add(type);
      sections.push({ type, style: styleFor(type, entry.style) } as Section);
    }
  } else {
    sections = legacySections(config);
  }

  // Without speakers the card could only ever send to its saved targets —
  // that is what the tile is for, so the card refuses to lose its picker.
  if (!sections.some((section) => section.type === "speakers")) {
    sections.unshift({ type: "speakers", style: "pill" });
  }

  if (resolveLayout(config) === "compact") {
    // Chips and rows need the height compact exists to save.
    sections = sections.map((section) =>
      section.type === "speakers" ? { type: "speakers", style: "pill" } : section,
    );
  }
  return sections;
}

/** The resolved section of one type, if the card shows it. */
export function findSection<T extends SectionType>(
  sections: Section[],
  type: T,
): Extract<Section, { type: T }> | undefined {
  return sections.find((section) => section.type === type) as
    | Extract<Section, { type: T }>
    | undefined;
}

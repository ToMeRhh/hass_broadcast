import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import {
  PlayerOption,
  clampMaxDuration,
  editorStyles,
  maxDurationField,
  modeField,
  playerChecklist,
  segmented,
  speakerOptions,
  toggleInList,
} from "./editor-fields";
import {
  DEFAULT_STYLES,
  Layout,
  SECTION_STYLES,
  SECTION_TYPES,
  SectionType,
  resolveLayout,
  resolveSections,
} from "./sections";

export { clampMaxDuration, toggleInList };
export type { PlayerOption };

interface CardConfig {
  type: string;
  title?: string;
  targets?: string[];
  show_players?: string[];
  hide_players?: string[];
  mode?: string;
  max_duration?: number;
  /** How the record button behaves. Absent means push-to-talk. */
  record_mode?: "push_to_talk" | "start_stop";
  layout?: Layout;
  sections?: { type: string; style?: string }[];
  /** Legacy; dropped the first time the editor saves. */
  show_history?: boolean;
  /** Legacy; dropped the first time the editor saves. */
  player_list?: string;
}

/**
 * Every speaker the editor should offer: the discovered ones, plus any the
 * config still names, so a renamed or removed entity can still be unchecked.
 */
export function playerOptions(
  hass: any,
  config: Pick<CardConfig, "show_players" | "hide_players">,
): PlayerOption[] {
  return speakerOptions(hass, [config.show_players ?? [], config.hide_players ?? []]);
}

/** How many speakers a summary line names before it starts counting. */
const SUMMARY_NAMES = 3;

/**
 * The one-line description of a list, shown on its collapsed summary.
 * `emptyLabel` differs per list: an unpicked show list means every player,
 * an unpicked hide list means none.
 */
export function selectionSummary(
  chosen: string[] | undefined,
  options: PlayerOption[],
  emptyLabel: string,
): string {
  if (!chosen?.length) {
    return emptyLabel;
  }
  const names = chosen.map(
    (entityId) =>
      options.find((option) => option.entityId === entityId)?.name ?? entityId,
  );
  const shown = names.slice(0, SUMMARY_NAMES).join(", ");
  const rest = names.length - SUMMARY_NAMES;
  return rest > 0 ? `${shown} +${rest} more` : shown;
}

/** One line of the editor's section list. */
export interface SectionRow {
  type: SectionType;
  style: string;
  visible: boolean;
}

/**
 * The editor's view of the sections: the visible ones in card order, then
 * the hidden ones, so a hidden section can be switched back on.
 *
 * Resolved as `full` on purpose: compact forces the speaker pill when it
 * draws the card, but the user's chosen style must survive a round trip
 * through compact and back.
 */
export function sectionRows(config: CardConfig): SectionRow[] {
  const visible = resolveSections({ ...config, layout: "full" }).map(
    (section): SectionRow => ({ ...section, visible: true }),
  );
  const hidden = SECTION_TYPES.filter(
    (type) => !visible.some((row) => row.type === type),
  ).map((type): SectionRow => ({ type, style: DEFAULT_STYLES[type], visible: false }));
  return [...visible, ...hidden];
}

/** The `sections` key a list of rows saves as. */
export function sectionsConfig(rows: SectionRow[]): { type: string; style: string }[] {
  return rows
    .filter((row) => row.visible)
    .map((row) => ({ type: row.type, style: row.style }));
}

/**
 * Move a visible row up (-1) or down (+1) among the visible rows. Hidden rows
 * have no position on the card, so they neither move nor get swapped with.
 */
export function moveRow(rows: SectionRow[], index: number, delta: -1 | 1): SectionRow[] {
  const target = index + delta;
  if (
    !rows[index]?.visible ||
    target < 0 ||
    target >= rows.length ||
    !rows[target].visible
  ) {
    return rows;
  }
  const next = [...rows];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Show or hide a row. Speakers cannot be hidden; a shown row joins the end. */
export function toggleRow(rows: SectionRow[], index: number): SectionRow[] {
  const row = rows[index];
  if (!row || row.type === "speakers") {
    return rows;
  }
  const rest = rows.filter((_, i) => i !== index);
  const toggled = { ...row, visible: !row.visible };
  const lastVisible = rest.filter((r) => r.visible).length;
  return toggled.visible
    ? [...rest.slice(0, lastVisible), toggled, ...rest.slice(lastVisible)]
    : [...rest, toggled];
}

const SECTION_NAMES: Record<SectionType, string> = {
  speakers: "Speakers",
  history: "Recent messages",
  volume: "Volume",
};

const STYLE_NAMES: Record<string, string> = {
  pill: "Pill — one line",
  chips: "Chips",
  rows: "List — a row each",
  list: "List below",
  icon: "Icon in the header",
};

@customElement("hass-broadcast-card-editor")
export class HassBroadcastCardEditor extends LitElement {
  @property({ attribute: false }) hass?: any;
  @state() private config: CardConfig = { type: "" };

  static styles = [
    editorStyles,
    css`
      .section-list { display: flex; flex-direction: column; gap: 6px; }
      .section-row { display: grid; grid-template-columns: 1fr auto auto auto; align-items: center;
        gap: 2px 4px; padding: 4px 6px 6px 10px;
        border: 1px solid var(--divider-color, #ddd); border-radius: 8px; }
      .section-row[data-visible="false"] { opacity: 0.55; }
      .section-name { min-width: 0; }
      .section-style { grid-column: 1 / -1; }
      .section-row select { padding: 6px; }
      .section-fixed { font-size: 0.85em; color: var(--secondary-text-color); }
      .mini { width: 30px; height: 30px; padding: 0; font: inherit; border: none;
        border-radius: 6px; background: none; color: var(--primary-text-color); cursor: pointer; }
      .mini:hover:not([disabled]) { background: var(--secondary-background-color, rgba(0,0,0,.06)); }
      .mini[disabled] { opacity: 0.3; cursor: default; }
    `,
  ];

  setConfig(config: CardConfig): void {
    this.config = config;
  }

  /**
   * Apply a change and tell Lovelace. Every save also writes `layout` and
   * `sections` in full and drops the legacy keys they replace, so a card
   * migrates the first time it is edited and never carries both. A key
   * patched to undefined is removed rather than saved as empty.
   */
  private emit(patch: Partial<CardConfig>): void {
    const next: any = { ...this.config, ...patch };
    next.layout = resolveLayout(next);
    if (!("sections" in patch)) {
      next.sections = sectionsConfig(sectionRows(next));
    }
    delete next.player_list;
    delete next.show_history;
    for (const key of Object.keys(next)) {
      if (next[key] === undefined) {
        delete next[key];
      }
    }
    this.config = next;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this.config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** The mode the card behaves as, with the key absent meaning push-to-talk. */
  private get currentRecordMode(): "push_to_talk" | "start_stop" {
    return this.config.record_mode === "start_stop"
      ? "start_stop"
      : "push_to_talk";
  }

  private setRecordMode(mode: "push_to_talk" | "start_stop"): void {
    this.emit({ record_mode: mode });
  }

  private setRows(rows: SectionRow[]): void {
    this.emit({ sections: sectionsConfig(rows) });
  }

  /**
   * One collapsed speaker list, writing the entity ids it selects into `key`.
   * `emptyLabel` says what an unpicked list means — the two lists disagree.
   */
  private playerSection(
    key: "show_players" | "hide_players",
    label: string,
    emptyLabel: string,
    options: PlayerOption[],
  ) {
    const chosen = this.config[key] ?? [];
    return html`
      <details class="players">
        <summary>
          ${label} — ${selectionSummary(chosen, options, emptyLabel)}
        </summary>
        ${options.length === 0
          ? html`<div class="hint">No media players found.</div>`
          : playerChecklist(options, chosen, (entityId, checked) =>
              this.emit({ [key]: toggleInList(this.config[key], entityId, checked) }),
            )}
      </details>
    `;
  }

  private sectionList() {
    const compact = resolveLayout(this.config) === "compact";
    const rows = sectionRows(this.config);
    const visibleCount = rows.filter((row) => row.visible).length;
    return html`
      <div class="section-list">
        ${rows.map((row, index) => {
          const styles = SECTION_STYLES[row.type];
          // In compact the speakers are always a pill and the rest live in
          // the ⋮ menu, so no style choice would change anything there.
          const choosable = styles.length > 1 && !compact;
          return html`
            <div class="section-row" data-visible=${row.visible}>
              <span class="section-name">${SECTION_NAMES[row.type]}</span>
              <button
                class="mini"
                title="Move up"
                aria-label="Move ${SECTION_NAMES[row.type]} up"
                ?disabled=${!row.visible || index === 0}
                @click=${() => this.setRows(moveRow(rows, index, -1))}
              >
                ↑
              </button>
              <button
                class="mini"
                title="Move down"
                aria-label="Move ${SECTION_NAMES[row.type]} down"
                ?disabled=${!row.visible || index >= visibleCount - 1}
                @click=${() => this.setRows(moveRow(rows, index, 1))}
              >
                ↓
              </button>
              <button
                class="mini"
                title=${row.type === "speakers"
                  ? "The card needs a way to pick speakers"
                  : row.visible
                    ? "Hide"
                    : "Show"}
                aria-label="${row.visible ? "Hide" : "Show"} ${SECTION_NAMES[row.type]}"
                aria-pressed=${row.visible}
                ?disabled=${row.type === "speakers"}
                @click=${() => this.setRows(toggleRow(rows, index))}
              >
                ${row.visible ? "◉" : "○"}
              </button>
              ${choosable && row.visible
                ? html`
                    <!-- The chosen option is marked with ?selected rather than
                         the select's .value: with mapped options, .value is
                         set before the options exist and silently falls back
                         to the first one. -->
                    <select
                      class="section-style"
                      aria-label="${SECTION_NAMES[row.type]} style"
                      @change=${(e: Event) => {
                        const style = (e.target as HTMLSelectElement).value;
                        this.setRows(
                          rows.map((r, i) => (i === index ? { ...r, style } : r)),
                        );
                      }}
                    >
                      ${styles.map(
                        (style) =>
                          html`<option value=${style} ?selected=${style === row.style}>
                            ${STYLE_NAMES[style]}
                          </option>`,
                      )}
                    </select>
                  `
                : row.visible && !compact
                  ? html`<span class="section-style section-fixed">${STYLE_NAMES[row.style]}</span>`
                  : nothing}
            </div>
          `;
        })}
      </div>
      <div class="hint">
        ${compact
          ? "In Compact the speakers are a single pill, and the other sections are in the ⋮ menu, in this order."
          : "Icon sections sit in the header; the rest stack below the record button, in this order."}
      </div>
    `;
  }

  render() {
    const options = playerOptions(this.hass, this.config);
    return html`
      <div class="field">
        <label for="title">Card name</label>
        <input
          id="title"
          type="text"
          placeholder="Voice Broadcast"
          .value=${this.config.title ?? ""}
          @change=${(e: Event) =>
            this.emit({
              // Blank means "no custom name" — drop the key so the card falls
              // back to its default heading instead of rendering an empty one.
              title: (e.target as HTMLInputElement).value.trim() || undefined,
            })}
        />
      </div>

      <div class="field">
        <label>Layout</label>
        ${segmented(
          resolveLayout(this.config),
          [
            ["full", "Full"],
            ["compact", "Compact"],
          ] as const,
          (layout) => this.emit({ layout }),
        )}
      </div>

      <div class="field">
        <label>Card sections</label>
        ${this.sectionList()}
      </div>

      <div class="field">
        <label>Recording</label>
        ${segmented(
          this.currentRecordMode,
          [
            ["push_to_talk", "Push to talk"],
            ["start_stop", "Tap to start and stop"],
          ] as const,
          (mode) => this.setRecordMode(mode),
        )}
        <div class="hint">
          Push to talk records only while the button is held.
        </div>
      </div>

      ${modeField(this.config.mode, (mode) => this.emit({ mode }))}

      <div class="field">
        ${this.playerSection(
          "show_players",
          "Players to show",
          "every player",
          options,
        )}
        <div class="hint">
          With nothing selected, the card offers every media player that
          supports playback.
        </div>
      </div>

      <div class="field">
        ${this.playerSection(
          "hide_players",
          "Players to hide",
          "none",
          options,
        )}
        <div class="hint">Removed after the list above.</div>
      </div>

      ${maxDurationField(this.config.max_duration, (max_duration) =>
        this.emit({ max_duration }),
      )}
    `;
  }
}

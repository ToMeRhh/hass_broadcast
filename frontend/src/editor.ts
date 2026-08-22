import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { discoverPlayers } from "./players";

interface CardConfig {
  type: string;
  title?: string;
  targets?: string[];
  show_players?: string[];
  hide_players?: string[];
  mode?: string;
  max_duration?: number;
  show_history?: boolean;
}

/** One row of a speaker checkbox list. */
export interface PlayerOption {
  entityId: string;
  name: string;
  /** False for an entity named in the config that discovery no longer finds. */
  available: boolean;
}

/**
 * Every speaker the editor should offer: the discovered ones, plus any the
 * config still names. A renamed or removed entity stays on screen so it can
 * be unchecked, instead of quietly persisting in a config nobody can see.
 */
export function playerOptions(
  hass: any,
  config: Pick<CardConfig, "show_players" | "hide_players">,
): PlayerOption[] {
  const name = (entityId: string) =>
    hass?.states?.[entityId]?.attributes?.friendly_name ?? entityId;
  const discovered = discoverPlayers(hass);
  const known = new Set(discovered);
  const orphans = [
    ...new Set([...(config.show_players ?? []), ...(config.hide_players ?? [])]),
  ]
    .filter((entityId) => !known.has(entityId))
    .sort();
  return [...discovered, ...orphans].map((entityId) => ({
    entityId,
    name: name(entityId),
    available: known.has(entityId),
  }));
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

/**
 * Add or remove one entity from a configured list. An emptied list comes back
 * as undefined so the key is dropped: an empty list and a missing one mean the
 * same thing to the card, and only one of them survives a round trip.
 */
export function toggleInList(
  list: string[] | undefined,
  entityId: string,
  checked: boolean,
): string[] | undefined {
  const current = list ?? [];
  if (checked) {
    return current.includes(entityId) ? current : [...current, entityId];
  }
  const next = current.filter((id) => id !== entityId);
  return next.length ? next : undefined;
}

/** Clamp max_duration to valid range [5, 300], defaulting to 60 for invalid input. */
export function clampMaxDuration(value: any): number {
  // Handle nullish and empty values
  if (value === "" || value === null || value === undefined) {
    return 60;
  }
  const num = Number(value);
  // If NaN (truly unparseable), default to 60
  if (isNaN(num)) return 60;
  // Otherwise clamp to [5, 300]
  return Math.min(300, Math.max(5, num));
}

@customElement("hass-broadcast-card-editor")
export class HassBroadcastCardEditor extends LitElement {
  @property({ attribute: false }) hass?: any;
  @state() private config: CardConfig = { type: "" };

  static styles = css`
    .field { display: block; margin-bottom: 12px; }
    label { display: block; margin-bottom: 4px; font-weight: 500; }
    .hint { font-size: 0.85em; color: var(--secondary-text-color); margin-top: 4px; }
    input[type="text"], input[type="number"], select { width: 100%; box-sizing: border-box;
      padding: 8px; border-radius: 4px; border: 1px solid var(--divider-color, #ddd);
      background: var(--card-background-color, #fff); color: var(--primary-text-color);
      font: inherit; }
    .players { border: 1px solid var(--divider-color, #ddd); border-radius: 4px;
      padding: 8px; }
    summary { cursor: pointer; font-weight: 500; }
    .rows { max-height: 220px; overflow-y: auto; margin-top: 8px;
      border-top: 1px solid var(--divider-color, #ddd); padding-top: 4px; }
    .players label { display: flex; align-items: center; gap: 8px; font-weight: normal;
      margin: 0; padding: 4px 0; }
    .missing { color: var(--secondary-text-color); }
  `;

  setConfig(config: CardConfig): void {
    this.config = config;
  }

  private emit(patch: Partial<CardConfig>): void {
    this.config = { ...this.config, ...patch };
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this.config },
        bubbles: true,
        composed: true,
      }),
    );
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
          : this.playerList(key, options)}
      </details>
    `;
  }

  /** The selectable rows inside one section. */
  private playerList(
    key: "show_players" | "hide_players",
    options: PlayerOption[],
  ) {
    const chosen = this.config[key] ?? [];
    return html`
      <div class="rows">
        ${options.map(
          (option) => html`
            <label>
              <input
                type="checkbox"
                .checked=${chosen.includes(option.entityId)}
                @change=${(e: Event) =>
                  this.emit({
                    [key]: toggleInList(
                      this.config[key],
                      option.entityId,
                      (e.target as HTMLInputElement).checked,
                    ),
                  })}
              />
              <span class=${option.available ? "" : "missing"}>
                ${option.name}${option.available ? "" : " (not available)"}
              </span>
            </label>
          `,
        )}
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
        <label for="mode">Playback mode</label>
        <select
          id="mode"
          .value=${this.config.mode ?? "plain"}
          @change=${(e: Event) =>
            this.emit({ mode: (e.target as HTMLSelectElement).value })}
        >
          <option value="plain">Plain — just play the message</option>
          <option value="restore">Restore — put back volume afterwards</option>
          <option value="chime">Chime — attention tone, then the message</option>
        </select>
        <div class="hint">
          Restore uses a speaker's native announce support when it has any, which
          ducks and resumes whatever was playing. Speakers without it — Google Cast
          among them — get volume restored, but an interrupted Spotify or YouTube
          session may not resume.
        </div>
      </div>

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

      <div class="field">
        <label for="max">Maximum recording length (seconds)</label>
        <input
          id="max"
          type="number"
          min="5"
          max="300"
          .value=${String(this.config.max_duration ?? 60)}
          @change=${(e: Event) =>
            this.emit({
              max_duration: clampMaxDuration((e.target as HTMLInputElement).value),
            })}
        />
      </div>

      <div class="field">
        <label>
          <input
            type="checkbox"
            .checked=${this.config.show_history !== false}
            @change=${(e: Event) =>
              this.emit({
                show_history: (e.target as HTMLInputElement).checked,
              })}
          />
          Show recent recordings
        </label>
      </div>
    `;
  }
}

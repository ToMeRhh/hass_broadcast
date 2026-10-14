import { TemplateResult, css, html } from "lit";

import { discoverPlayers } from "./players";

/** One row of a speaker checkbox list. */
export interface PlayerOption {
  entityId: string;
  name: string;
  /** False for an entity named in the config that discovery no longer finds. */
  available: boolean;
}

/**
 * Every speaker an editor should offer: the discovered ones, plus any the
 * config still names. A renamed or removed entity stays on screen so it can
 * be unchecked, instead of quietly persisting in a config nobody can see.
 */
export function speakerOptions(hass: any, configured: string[][]): PlayerOption[] {
  const name = (entityId: string) =>
    hass?.states?.[entityId]?.attributes?.friendly_name ?? entityId;
  const discovered = discoverPlayers(hass);
  const known = new Set(discovered);
  const orphans = [...new Set(configured.flat())]
    .filter((entityId) => !known.has(entityId))
    .sort();
  return [...discovered, ...orphans].map((entityId) => ({
    entityId,
    name: name(entityId),
    available: known.has(entityId),
  }));
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

/** A row of mutually exclusive buttons. */
export function segmented<T extends string>(
  current: T,
  choices: readonly (readonly [T, string])[],
  onPick: (value: T) => void,
): TemplateResult {
  return html`
    <div class="segmented">
      ${choices.map(
        ([value, label]) => html`
          <button
            type="button"
            data-on=${current === value}
            aria-pressed=${current === value}
            @click=${() => onPick(value)}
          >
            ${label}
          </button>
        `,
      )}
    </div>
  `;
}

/** A checkbox per speaker. */
export function playerChecklist(
  options: PlayerOption[],
  chosen: string[],
  onToggle: (entityId: string, checked: boolean) => void,
): TemplateResult {
  return html`
    <div class="rows">
      ${options.map(
        (option) => html`
          <label>
            <input
              type="checkbox"
              .checked=${chosen.includes(option.entityId)}
              @change=${(e: Event) =>
                onToggle(option.entityId, (e.target as HTMLInputElement).checked)}
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

export function modeField(
  mode: string | undefined,
  onChange: (mode: string) => void,
): TemplateResult {
  return html`
    <div class="field">
      <label for="mode">Playback mode</label>
      <select
        id="mode"
        .value=${mode ?? "plain"}
        @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value)}
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
  `;
}

export function maxDurationField(
  value: number | undefined,
  onChange: (value: number) => void,
): TemplateResult {
  return html`
    <div class="field">
      <label for="max">Maximum recording length (seconds)</label>
      <input
        id="max"
        type="number"
        min="5"
        max="300"
        .value=${String(value ?? 60)}
        @change=${(e: Event) =>
          onChange(clampMaxDuration((e.target as HTMLInputElement).value))}
      />
    </div>
  `;
}

export const editorStyles = css`
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
  .rows label { display: flex; align-items: center; gap: 8px; font-weight: normal;
    margin: 0; padding: 4px 0; }
  .missing { color: var(--secondary-text-color); }
  .segmented { display: flex; gap: 6px; }
  .segmented button { flex: 1; padding: 8px; font: inherit; cursor: pointer;
    border: 1px solid var(--divider-color, #ddd); border-radius: 6px;
    background: none; color: var(--primary-text-color); }
  .segmented button[data-on="true"] { background: var(--primary-color);
    color: var(--text-primary-color, #fff); border-color: var(--primary-color); }
`;

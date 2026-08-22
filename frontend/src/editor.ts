import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

interface CardConfig {
  type: string;
  title?: string;
  targets?: string[];
  mode?: string;
  max_duration?: number;
  show_history?: boolean;
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

  render() {
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
          Google Cast has no native announce support, so Restore cannot reliably
          resume an interrupted Spotify or YouTube session. It does restore volume.
        </div>
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

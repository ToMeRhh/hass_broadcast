import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import {
  editorStyles,
  maxDurationField,
  modeField,
  playerChecklist,
  segmented,
  speakerOptions,
  toggleInList,
} from "./editor-fields";

interface TileConfig {
  type: string;
  name?: string;
  targets?: string[];
  shape?: "square" | "horizontal";
  mode?: string;
  max_duration?: number;
}

@customElement("hass-broadcast-tile-editor")
export class HassBroadcastTileEditor extends LitElement {
  @property({ attribute: false }) hass?: any;
  @state() private config: TileConfig = { type: "" };

  static styles = editorStyles;

  setConfig(config: TileConfig): void {
    this.config = config;
  }

  /** Apply a change and tell Lovelace; a key patched to undefined is dropped. */
  private emit(patch: Partial<TileConfig>): void {
    const next: any = { ...this.config, ...patch };
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

  render() {
    const targets = this.config.targets ?? [];
    const options = speakerOptions(this.hass, [targets]);
    return html`
      <div class="field">
        <label for="name">Name</label>
        <input
          id="name"
          type="text"
          placeholder="Intercom"
          .value=${this.config.name ?? ""}
          @change=${(e: Event) =>
            this.emit({ name: (e.target as HTMLInputElement).value.trim() || undefined })}
        />
      </div>

      <div class="field">
        <label>Speakers</label>
        ${options.length === 0
          ? html`<div class="hint">No media players found.</div>`
          : playerChecklist(options, targets, (entityId, checked) =>
              this.emit({ targets: toggleInList(targets, entityId, checked) ?? [] }),
            )}
        <div class="hint">
          Every message from this tile goes to all of these, as soon as you
          let go of the button.
        </div>
      </div>

      <div class="field">
        <label>Shape</label>
        ${segmented(
          this.config.shape === "horizontal" ? "horizontal" : "square",
          [
            ["square", "Square"],
            ["horizontal", "Horizontal"],
          ] as const,
          (shape) => this.emit({ shape }),
        )}
      </div>

      ${modeField(this.config.mode, (mode) => this.emit({ mode }))}
      ${maxDurationField(this.config.max_duration, (max_duration) =>
        this.emit({ max_duration }),
      )}
    `;
  }
}

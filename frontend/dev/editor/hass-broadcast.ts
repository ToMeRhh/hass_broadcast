/**
 * A Home Assistant design-gallery page showing our cards' editors as Home
 * Assistant draws them. `npm run dev:editor` copies this file to
 * gallery/src/pages/misc/ in a pinned checkout of home-assistant/frontend, so
 * the imports below are relative to that location, not to this repo.
 *
 * The cards come from our real bundle, built by the script into the gallery's
 * static files and imported at runtime: the editors are each card's own
 * `getConfigForm()`, rendered by HA's `hui-card-element-editor`, exactly as the
 * Edit card dialog does.
 */
import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators";
import { mockAreaRegistry } from "../../../../demo/src/stubs/area_registry";
import { mockConfigEntries } from "../../../../demo/src/stubs/config_entries";
import { mockDeviceRegistry } from "../../../../demo/src/stubs/device_registry";
import { mockEntityRegistry } from "../../../../demo/src/stubs/entity_registry";
import { provideHass } from "../../../../src/fake_data/provide_hass";
import "../../../../src/components/ha-card";
import "../../../../src/panels/lovelace/editor/card-editor/hui-card-element-editor";
import type { HomeAssistant } from "../../../../src/types";
import "../../components/demo-black-white-row";

/** PLAY_MEDIA plus the usual player features, as a real speaker reports. */
const SPEAKER_FEATURES = 152463;

const SPEAKERS = [
  ["kitchen", "Kitchen", "playing"],
  ["bedroom", "Bedroom", "idle"],
  ["living_room", "Living Room", "idle"],
  ["garage", "Garage", "idle"],
  ["office", "Office Desk Speaker", "paused"],
  ["kids_room", "Kids' Room Nest Mini", "idle"],
].map(([id, name, state]) => ({
  entity_id: `media_player.${id}`,
  state,
  attributes: { friendly_name: name, supported_features: SPEAKER_FEATURES },
}));

const CARDS = [
  { key: "card", tag: "hass-broadcast-card", title: "Voice Broadcast card" },
  { key: "tile", tag: "hass-broadcast-tile", title: "Broadcast tile" },
] as const;

@customElement("demo-misc-hass-broadcast")
export class DemoHassBroadcast extends LitElement {
  @state() private hass!: HomeAssistant;

  @state() private loaded = false;

  @state() private error?: string;

  @state() private configs: Record<string, any> = {};

  constructor() {
    super();
    const hass = provideHass(this);
    hass.updateTranslations(null, "en");
    hass.updateTranslations("lovelace", "en");
    hass.addEntities(SPEAKERS);
    mockEntityRegistry(hass);
    mockDeviceRegistry(hass);
    mockConfigEntries(hass);
    mockAreaRegistry(hass);
    hass.mockWS("hass_broadcast/list", () => ({ messages: [] }));
  }

  async firstUpdated() {
    try {
      // Built by `npm run dev:editor`; ignored by the gallery's own bundler.
      await import(/* webpackIgnore: true */ "/hass-broadcast/card.js" as string);
      for (const { key, tag } of CARDS) {
        const cls: any = customElements.get(tag);
        const stub = cls.getStubConfig(this.hass);
        this.configs = {
          ...this.configs,
          // The card as a user would first see it, with one speaker picked.
          [key]: key === "card" ? { ...stub, selected: ["media_player.kitchen"] } : stub,
        };
      }
      this.loaded = true;
    } catch (err: any) {
      this.error = String(err?.message ?? err);
    }
  }

  /**
   * Picture options pick `src` or `src_dark` from one page-wide UI context,
   * so both columns show the light pictures. The screenshot step calls this
   * between its light and dark shots.
   */
  public showDarkThumbnails(dark: boolean): void {
    (this.hass as any).updateHass({ themes: { ...this.hass.themes, darkMode: dark } });
  }

  private previews = new Map<string, any>();

  /** One live card per card type and theme, re-configured as the form changes. */
  private preview(tag: string, slot: string, config: any, hass: HomeAssistant) {
    let element = this.previews.get(`${tag}-${slot}`);
    if (!element) {
      element = document.createElement(tag);
      this.previews.set(`${tag}-${slot}`, element);
    }
    if (element.config !== config) {
      element.setConfig(config);
    }
    element.hass = hass;
    return element;
  }

  protected render() {
    if (this.error) {
      return html`<p class="error">Could not load the card bundle: ${this.error}</p>`;
    }
    if (!this.loaded) {
      return nothing;
    }
    return CARDS.map(
      ({ key, tag, title }) => html`
        <demo-black-white-row .title=${title}>
          ${["light", "dark"].map(
            (slot) => html`
              <div slot=${slot} class="pair">
                <hui-card-element-editor
                  class=${`editor editor-${key}`}
                  .hass=${this.hass}
                  .value=${this.configs[key]}
                  @config-changed=${(ev: CustomEvent) => {
                    this.configs = { ...this.configs, [key]: ev.detail.config };
                  }}
                ></hui-card-element-editor>
                <div class=${`preview preview-${key}`}>
                  ${this.preview(tag, slot, this.configs[key], this.hass)}
                </div>
              </div>
            `
          )}
        </demo-black-white-row>
      `
    );
  }

  static styles = css`
    .pair {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .preview {
      max-width: 400px;
    }
    .preview-tile {
      width: 120px;
      height: 120px;
    }
    .error {
      color: var(--error-color);
      padding: 16px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-misc-hass-broadcast": DemoHassBroadcast;
  }
}

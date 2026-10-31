/**
 * Dev harness entry point: mounts the real card and tile against a mocked
 * Home Assistant, next to controls for their config and for the states that
 * are tedious to reproduce on a live install.
 *
 * The editors are Home Assistant's own forms (`getConfigForm()`), which only
 * Home Assistant can draw; `npm run dev:editor` shows those.
 */
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";

import "../src/card";
import { installMicMock, installRecorderMock } from "./fake-recorder";
import { applyTheme } from "./ha-stubs";
import { LOVELACE_ASSIGNS } from "../test/helpers";
import {
  DEFAULT_SCENARIO,
  MockBackend,
  Scenario,
  createMockHass,
  installFetchMock,
} from "./mock-hass";

/** Widths worth checking: HA companion app, tablet column, desktop sidebar view. */
const WIDTHS = [
  { label: "Phone", value: 360 },
  { label: "Tablet", value: 480 },
  { label: "Desktop", value: 620 },
];

/**
 * Tile sizes as sections-view grid cells, columns × rows: each shape's
 * default first, then the larger sizes a user can drag it to.
 */
const TILE_GRIDS: Record<string, [columns: number, rows: number][]> = {
  square: [[3, 2], [4, 3], [6, 4], [12, 4]],
  horizontal: [[6, 1], [12, 1]],
};

/**
 * Off localhost the browser hides getUserMedia, so there is no real recording
 * to be had and the fake is the only way to see the recording UI at all.
 */
const INSECURE = !window.isSecureContext;

const scenario: Scenario = { ...DEFAULT_SCENARIO, fakeRecorder: INSECURE };
const backend = new MockBackend(scenario);
const hass = createMockHass(backend);
installFetchMock(backend, scenario);
installMicMock(() => scenario.micDenied);
installRecorderMock({
  useFake: () => INSECURE || scenario.fakeRecorder,
  micDenied: () => scenario.micDenied,
});

@customElement("dev-app")
export class DevApp extends LitElement {
  @state() private theme: "light" | "dark" = "light";
  @state() private width = 360;
  @state() private scenario: Scenario = scenario;
  @state() private config: any = {
    type: "custom:hass-broadcast-card",
    layout: "full",
    speaker_picker: "dropdown",
    recent_messages: "button",
    volume_control: true,
    selected: ["media_player.kitchen"],
    record_mode: "push_to_talk",
    max_duration: 60,
    mode: "plain",
  };
  /** The JSON box's text while it does not parse, so typing is not lost. */
  @state() private draft?: string;
  @state() private generation = 0;
  /** Outline every fixed slot, to eyeball that nothing moves between states. */
  @state() private showSlots = false;

  private card?: HTMLElement & { setConfig(config: any): void; hass: any };
  @state() private tileConfig: any = {
    type: "custom:hass-broadcast-tile",
    name: "Kids' rooms",
    speakers: ["media_player.kids_room", "media_player.bedroom"],
    shape: "square",
    mode: "plain",
    max_duration: 30,
  };
  private tile?: HTMLElement & { setConfig(config: any): void; hass: any };
  /** The tile's sections-view grid cell, columns × rows. */
  @state() private tileGrid: [columns: number, rows: number] = [3, 2];

  static styles = css`
    :host {
      display: grid;
      grid-template-columns: 1fr 320px;
      min-height: 100vh;
      font-family: Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .stage {
      display: flex;
      justify-content: center;
      padding: 32px 24px 64px;
      background: var(--primary-background-color, #fafafa);
      overflow: auto;
    }
    .frame { width: 100%; }
    .tile-label {
      margin: 28px 0 8px; font-size: 11px; letter-spacing: 0.09em;
      text-transform: uppercase; color: var(--secondary-text-color, #888);
    }
    .tile-frame > * { display: block; height: 100%; }
    .panel {
      background: #1f2430;
      color: #e6e6e6;
      padding: 16px;
      font-size: 13px;
      overflow: auto;
      border-left: 1px solid #000;
    }
    .panel h2 {
      font-size: 11px;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: #8f9bb3;
      margin: 20px 0 8px;
      font-weight: 600;
    }
    .panel h2:first-child { margin-top: 0; }
    .panel label { display: flex; align-items: center; gap: 8px; padding: 4px 0; cursor: pointer; }
    .panel select, .panel input[type="range"] { width: 100%; }
    .panel select {
      background: #2b3242; color: #e6e6e6; border: 1px solid #3c465c;
      border-radius: 6px; padding: 6px; font: inherit;
    }
    .seg { display: flex; gap: 4px; }
    .seg button {
      flex: 1; background: #2b3242; color: #b8c2d8; border: 1px solid #3c465c;
      border-radius: 6px; padding: 6px 4px; font: inherit; cursor: pointer;
    }
    .seg button[data-on="true"] { background: #3d7dff; color: #fff; border-color: #3d7dff; }
    .panel button.wide {
      width: 100%; margin-top: 8px; background: #2b3242; color: #e6e6e6;
      border: 1px solid #3c465c; border-radius: 6px; padding: 8px; font: inherit; cursor: pointer;
    }
    .panel textarea {
      width: 100%; box-sizing: border-box; min-height: 180px; margin-top: 8px;
      background: #2b3242; color: #e6e6e6; border: 1px solid #3c465c;
      border-radius: 6px; padding: 8px; font: 12px/1.4 ui-monospace, monospace;
    }
    .panel textarea[data-invalid="true"] { border-color: #e5534b; }
    .seg + .seg { margin-top: 6px; }
    .note { color: #8f9bb3; line-height: 1.5; margin-top: 8px; }
    code { background: #2b3242; padding: 1px 4px; border-radius: 3px; }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    applyTheme(this.theme);
  }

  /** Rebuilds the card element, so connectedCallback and its history fetch rerun. */
  private remount(): void {
    this.card = undefined;
    this.tile = undefined;
    this.generation += 1;
  }

  private patchScenario(patch: Partial<Scenario>): void {
    Object.assign(scenario, patch);
    backend.setScenario(scenario);
    this.scenario = { ...scenario };
    if (patch.history !== undefined) {
      backend.reseed();
      this.remount();
    }
  }

  private get tileElement(): HTMLElement {
    if (!this.tile) {
      const element = document.createElement("hass-broadcast-tile") as any;
      // As Lovelace does, so a property clash breaks here and not on a dashboard.
      Object.assign(element, LOVELACE_ASSIGNS);
      element.setConfig(this.tileConfig);
      element.hass = hass;
      this.tile = element;
    }
    return this.tile!;
  }

  /** Apply a card config, as Lovelace does when its editor saves. */
  private setCardConfig(config: any): void {
    this.config = config;
    this.draft = undefined;
    const card = this.cardElement as any;
    card.setConfig(config);
    card.requestUpdate();
  }

  private setTileConfig(config: any): void {
    this.tileConfig = config;
    const tile = this.tileElement as any;
    tile.setConfig(config);
    tile.requestUpdate();
  }

  /** A row of buttons that writes one config key. */
  private choice(
    current: unknown,
    options: [value: unknown, label: string][],
    pick: (value: any) => void,
  ) {
    return html`
      <div class="seg">
        ${options.map(
          ([value, label]) => html`
            <button data-on=${current === value} @click=${() => pick(value)}>${label}</button>
          `,
        )}
      </div>
    `;
  }

  private get cardElement(): HTMLElement {
    if (!this.card) {
      const element = document.createElement("hass-broadcast-card") as any;
      Object.assign(element, LOVELACE_ASSIGNS);
      element.setConfig(this.config);
      element.hass = hass;
      this.card = element;
    }
    return this.card!;
  }

  private toggle(key: keyof Scenario, label: string) {
    return html`
      <label>
        <input
          type="checkbox"
          .checked=${Boolean(this.scenario[key])}
          @change=${(e: Event) =>
            this.patchScenario({ [key]: (e.target as HTMLInputElement).checked } as any)}
        />
        ${label}
      </label>
    `;
  }

  render() {
    // Read `generation` so a remount invalidates this render; the value itself
    // is unused — the point is that the getter then builds a fresh element.
    void this.generation;
    const card = this.cardElement;
    card.toggleAttribute("data-show-slots", this.showSlots);
    this.tileElement.toggleAttribute("data-show-slots", this.showSlots);
    return html`
      <div class="stage">
        <div class="frame" style="max-width:${this.width}px">
          ${card}
          <div class="tile-label">Tile</div>
          <!-- Sized like its sections-view grid cell: a column pitch of
               128/3px and a row pitch of 64px, less the 8px gap. -->
          <div
            class="tile-frame"
            style="width:${(this.tileGrid[0] * 128) / 3 - 8}px;height:${this.tileGrid[1] * 64 - 8}px"
          >
            ${this.tileElement}
          </div>
        </div>
      </div>

      <div class="panel">
        <h2>Appearance</h2>
        <div class="seg">
          ${(["light", "dark"] as const).map(
            (theme) => html`
              <button
                data-on=${this.theme === theme}
                @click=${() => {
                  this.theme = theme;
                  applyTheme(theme);
                }}
              >
                ${theme}
              </button>
            `,
          )}
        </div>
        <div class="seg" style="margin-top:6px">
          ${WIDTHS.map(
            (width) => html`
              <button data-on=${this.width === width.value} @click=${() => (this.width = width.value)}>
                ${width.label}
              </button>
            `,
          )}
        </div>
        <label style="margin-top:6px">
          <input
            type="checkbox"
            id="show-slots"
            .checked=${this.showSlots}
            @change=${(e: Event) => {
              this.showSlots = (e.target as HTMLInputElement).checked;
            }}
          />
          Show slots
        </label>

        <h2>Microphone</h2>
        <label>
          <input
            type="checkbox"
            ?disabled=${INSECURE}
            .checked=${INSECURE || this.scenario.fakeRecorder}
            @change=${(e: Event) =>
              this.patchScenario({ fakeRecorder: (e.target as HTMLInputElement).checked })}
          />
          Simulated recording
        </label>
        <div class="note">
          <a href="/lab" style="color:#8fb4ff">Sound lab →</a> compare capture settings by ear.
        </div>
        ${INSECURE
          ? html`<div class="note">
              Forced on: <code>${location.host}</code> is not a secure context, so
              the browser hides the microphone. Recordings are synthetic but go
              through upload, history and playback for real.
            </div>`
          : nothing}

        <h2>Failure modes</h2>
        ${this.toggle("micDenied", "Recording refused (permission denied)")}
        ${this.toggle("uploadFails", "Upload fails (500)")}
        ${this.toggle("sendThrows", "Broadcast call throws")}
        ${this.toggle("deleteForbidden", "Delete not authorized")}
        ${this.toggle("mediaFails", "Loading a recent message fails")}

        <h2>Broadcast result</h2>
        <select
          .value=${this.scenario.broadcast}
          @change=${(e: Event) =>
            this.patchScenario({ broadcast: (e.target as HTMLSelectElement).value as any })}
        >
          <option value="ok">All speakers played it</option>
          <option value="partial">Some speakers failed</option>
          <option value="all-fail">No speaker played it</option>
        </select>

        <h2>History</h2>
        <select
          .value=${this.scenario.history}
          @change=${(e: Event) =>
            this.patchScenario({ history: (e.target as HTMLSelectElement).value as any })}
        >
          <option value="seeded">3 recordings</option>
          <option value="empty">No recordings</option>
          <option value="many">12 recordings</option>
        </select>

        <h2>Latency — ${this.scenario.latency} ms</h2>
        <input
          type="range"
          min="0"
          max="2000"
          step="50"
          .value=${String(this.scenario.latency)}
          @input=${(e: Event) =>
            this.patchScenario({ latency: Number((e.target as HTMLInputElement).value) })}
        />

        <button class="wide" @click=${() => this.remount()}>Remount card</button>

        <h2>Card config</h2>
        <div id="card-config">
          ${this.choice(this.config.layout ?? "full", [["full", "Full"], ["compact", "Compact"]], (layout) =>
            this.setCardConfig({ ...this.config, layout }),
          )}
          ${this.choice(
            this.config.speaker_picker ?? "dropdown",
            [["dropdown", "Dropdown"], ["chips", "Chips"], ["list", "List"]],
            (speaker_picker) => this.setCardConfig({ ...this.config, speaker_picker }),
          )}
          ${this.choice(
            this.config.recent_messages ?? "button",
            [["off", "No history"], ["button", "Button"], ["list", "History list"]],
            (recent_messages) => this.setCardConfig({ ...this.config, recent_messages }),
          )}
          ${this.choice(
            this.config.volume_control !== false,
            [[true, "Volume"], [false, "No volume"]],
            (volume_control) => this.setCardConfig({ ...this.config, volume_control }),
          )}
          ${this.choice(
            this.config.record_mode ?? "push_to_talk",
            [["push_to_talk", "Hold to talk"], ["start_stop", "Tap start/stop"]],
            (record_mode) => this.setCardConfig({ ...this.config, record_mode }),
          )}
          ${this.choice(
            this.config.keep_messages !== false,
            [[true, "Keep sent"], [false, "Temporary"]],
            (keep_messages) => this.setCardConfig({ ...this.config, keep_messages }),
          )}
        </div>
        <textarea
          aria-label="Card config (JSON)"
          spellcheck="false"
          data-invalid=${this.draft !== undefined}
          .value=${this.draft ?? JSON.stringify(this.config, null, 2)}
          @change=${(e: Event) => {
            const text = (e.target as HTMLTextAreaElement).value;
            try {
              this.setCardConfig(JSON.parse(text));
            } catch {
              this.draft = text;
            }
          }}
        ></textarea>

        <h2>Tile config</h2>
        <div id="tile-config">
          ${this.choice(
            this.tileConfig.shape ?? "square",
            [["square", "Square"], ["horizontal", "Horizontal"]],
            (shape) => {
              this.tileGrid = TILE_GRIDS[shape][0];
              this.setTileConfig({ ...this.tileConfig, shape });
            },
          )}
          <div style="margin-top:6px">
            ${this.choice(
              this.tileGrid.join("×"),
              TILE_GRIDS[this.tileConfig.shape ?? "square"].map((grid) => [
                grid.join("×"),
                grid.join("×"),
              ]),
              (size: string) => (this.tileGrid = size.split("×").map(Number) as [number, number]),
            )}
          </div>
        </div>

        <div class="note">
          The editors are Home Assistant's own forms; see them with
          <code>npm run dev:editor</code>.
        </div>
      </div>
    `;
  }
}

// Live reload, driven by the dev server after each successful rebuild.
new EventSource("/esbuild-reload").addEventListener("message", () => location.reload());

document.body.appendChild(document.createElement("dev-app"));

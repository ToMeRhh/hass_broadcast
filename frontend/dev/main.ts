/**
 * Dev harness entry point: mounts the real card and the real card editor
 * against a mocked Home Assistant, next to controls for the states that are
 * tedious to reproduce on a live install.
 */
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";

import "../src/card";
import "../src/editor";
import { installMicMock, installRecorderMock } from "./fake-recorder";
import { applyTheme } from "./ha-stubs";
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
 * Off localhost the browser hides getUserMedia, so there is no real recording
 * to be had and the fake is the only way to see the recording UI at all.
 */
const INSECURE = !window.isSecureContext;

const scenario: Scenario = { ...DEFAULT_SCENARIO, fakeRecorder: INSECURE };
const backend = new MockBackend(scenario);
const hass = createMockHass(backend);
installFetchMock(backend);
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
    targets: ["media_player.kitchen"],
    mode: "plain",
    max_duration: 60,
    show_history: true,
  };
  @state() private generation = 0;

  private card?: HTMLElement & { setConfig(config: any): void; hass: any };
  private editor?: HTMLElement & { setConfig(config: any): void; hass: any };

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
    .editor-host {
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      border-radius: 8px; padding: 12px; margin-top: 8px;
    }
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
    this.editor = undefined;
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

  private get cardElement(): HTMLElement {
    if (!this.card) {
      const element = document.createElement("hass-broadcast-card") as any;
      element.setConfig(this.config);
      element.hass = hass;
      this.card = element;
    }
    return this.card!;
  }

  private get editorElement(): HTMLElement {
    if (!this.editor) {
      const element = document.createElement("hass-broadcast-card-editor") as any;
      element.hass = hass;
      element.setConfig(this.config);
      element.addEventListener("config-changed", (event: any) => {
        this.config = event.detail.config;
        const card = this.cardElement as any;
        card.setConfig(this.config);
        card.requestUpdate();
      });
      this.editor = element;
    }
    return this.editor!;
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
    return html`
      <div class="stage">
        <div class="frame" style="max-width:${this.width}px">${card}</div>
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
        <div class="editor-host">${this.editorElement}</div>

        <div class="note">
          This is the real editor element. Changes apply to the card on the left
          immediately.
        </div>
      </div>
    `;
  }
}

// Live reload, driven by the dev server after each successful rebuild.
new EventSource("/esbuild-reload").addEventListener("message", () => location.reload());

document.body.appendChild(document.createElement("dev-app"));

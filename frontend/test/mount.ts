/**
 * Mount the card or the tile into the page, the way Lovelace hosts it, against
 * the dev harness's fakes: `mock-hass.ts` for Home Assistant and the backend,
 * `fake-recorder.ts` for the microphone. For browser-mode tests only.
 *
 * The fakes are installed once per test file and share one scenario, which
 * each mount resets. Latency defaults to zero here (the harness's 250ms is
 * for a human watching pending states), and the level meter holds still.
 */
import { vi } from "vitest";

import "../src/card";
import { installRecorderMock } from "../dev/fake-recorder";
import { applyTheme } from "../dev/ha-stubs";
import {
  DEFAULT_SCENARIO,
  MockBackend,
  Scenario,
  createMockHass,
  installFetchMock,
} from "../dev/mock-hass";
import { Recorder } from "../src/recorder";
import { LOVELACE_ASSIGNS } from "./helpers";

/** The clock every mount starts from, so relative history times hold still. */
export const NOW = new Date("2026-10-26T12:00:00Z");

const scenario: Scenario = { ...DEFAULT_SCENARIO };
const backend = new MockBackend(scenario);
installFetchMock(backend, scenario);
installRecorderMock({
  useFake: () => true,
  micDenied: () => scenario.micDenied,
  level: () => 0.6,
});

export interface MountOptions {
  scenario?: Partial<Scenario>;
  theme?: "light" | "dark";
  /** The element's width in px: 360 is a phone in the companion app. */
  width?: number;
  /** Its height in px, for the tile, which fills a fixed grid cell. */
  height?: number;
  /** False renders it as off localhost, where there is no microphone. */
  secure?: boolean;
}

export type Mounted = HTMLElement & {
  setConfig(config: unknown): void;
  hass: unknown;
  updateComplete: Promise<boolean>;
  shadowRoot: ShadowRoot;
};

async function mount(
  tag: "hass-broadcast-card" | "hass-broadcast-tile",
  config: Record<string, unknown>,
  options: MountOptions,
): Promise<Mounted> {
  vi.setSystemTime(NOW);
  Object.assign(scenario, DEFAULT_SCENARIO, { latency: 0 }, options.scenario);
  backend.reseed();
  if (options.secure === false) {
    vi.spyOn(Recorder, "isSupported").mockReturnValue(false);
  }
  applyTheme(options.theme ?? "light");

  const element = document.createElement(tag) as Mounted;
  Object.assign(element, LOVELACE_ASSIGNS);
  element.setConfig({ type: `custom:${tag}`, ...config });
  element.hass = createMockHass(backend);
  element.style.display = "block";
  element.style.width = `${options.width ?? 360}px`;
  if (options.height !== undefined) {
    element.style.height = `${options.height}px`;
  }
  document.body.append(element);
  await settle(element);
  return element;
}

export function mountCard(
  config: Record<string, unknown> = {},
  options: MountOptions = {},
): Promise<Mounted> {
  return mount("hass-broadcast-card", config, options);
}

export function mountTile(
  config: Record<string, unknown> = {},
  options: MountOptions = {},
): Promise<Mounted> {
  return mount("hass-broadcast-tile", config, options);
}

/**
 * Let the fakes answer and the element re-render: the history list, a send,
 * a decoded take. Under fake timers it advances them instead of waiting.
 */
export async function settle(element: Mounted, ms = 0): Promise<void> {
  for (let i = 0; i < 5; i++) {
    if (vi.isFakeTimers()) {
      await vi.advanceTimersByTimeAsync(i === 0 ? ms : 0);
    } else {
      await new Promise((resolve) => setTimeout(resolve, i === 0 ? ms : 0));
    }
    await element.updateComplete;
  }
}

/** Change the fakes' behaviour mid-test, e.g. to hold a send in flight. */
export function updateScenario(patch: Partial<Scenario>): void {
  Object.assign(scenario, patch);
}

/** Settle until `done` holds; fails rather than waiting forever. */
export async function settleUntil(element: Mounted, done: () => boolean): Promise<void> {
  for (let i = 0; i < 50 && !done(); i++) {
    await settle(element, 10);
  }
  if (!done()) {
    throw new Error("the element never reached the expected state");
  }
}

/** Remove every mounted element and undo what a mount changed. */
export function unmountAll(): void {
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
}

/** A button in the element's shadow root, by its accessible label. */
export function button(element: Mounted, label: string): HTMLButtonElement {
  const found = [...element.shadowRoot.querySelectorAll("button")].find(
    (candidate) => candidate.getAttribute("aria-label") === label,
  );
  if (!found) {
    throw new Error(`no button labelled "${label}"`);
  }
  return found;
}

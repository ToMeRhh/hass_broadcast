import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

import {
  Mounted,
  NOW,
  button,
  mountCard,
  mountTile,
  settle,
  settleUntil,
  unmountAll,
  updateScenario,
} from "./mount";

// Accessibility over the rendered card and tile: axe in each state, both
// themes, and the record controls driven from the keyboard alone.

afterEach(unmountAll);

const SPEAKERS = ["media_player.kitchen", "media_player.living_room", "media_player.bedroom"];
const BASE = { title: "Broadcast", speakers: SPEAKERS };
/** Two of them picked, so Send is live and says how many. */
const PICKED = { ...BASE, selected: SPEAKERS.slice(0, 2) };
const TILE = { name: "Kitchen", speakers: ["media_player.kitchen"] };

/**
 * Violations that are known, each with the issue that decides it. Matched by
 * rule and by the failing element's selector, so the same rule failing on
 * anything else still fails the test.
 */
const KNOWN: { rule: string; target: RegExp; issue: string }[] = [
  // Text in Home Assistant's own theme colours: --error-color on the
  // recording timer and error statuses, --primary-color on picked chips and
  // "Show all". Whether to be stricter than HA here is #70's question.
  { rule: "color-contrast", target: /^hass-broadcast-(card|tile),\.timer$/, issue: "#70" },
  { rule: "color-contrast", target: /^hass-broadcast-tile,\.layer-timer > \.timer/, issue: "#70" },
  { rule: "color-contrast", target: /^hass-broadcast-card,\.status$/, issue: "#70" },
  {
    rule: "color-contrast",
    target: /^hass-broadcast-card,\.chip\[role="checkbox"\]\[data-on="true"\]/,
    issue: "#70",
  },
  { rule: "color-contrast", target: /^hass-broadcast-card,\.history-all$/, issue: "#70" },
  // The tile's Discard label on its own tint, 4.14:1.
  { rule: "color-contrast", target: /^hass-broadcast-tile,\.bin > span$/, issue: "#70" },
];

/**
 * End every transition, as the card does under prefers-reduced-motion:
 * otherwise axe measures a layer mid-fade, at whatever contrast its opacity
 * happens to give at that instant.
 */
function stopTransitions(element: Mounted): void {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync("*, *::before, *::after { transition: none !important; }");
  element.shadowRoot.adoptedStyleSheets = [...element.shadowRoot.adoptedStyleSheets, sheet];
}

/** The serious and critical violations axe finds that are not KNOWN. */
async function violations(element: Mounted): Promise<string[]> {
  stopTransitions(element);
  for (const animation of element.shadowRoot.getAnimations()) {
    animation.pause();
  }
  const run = axe.run(element, { resultTypes: ["violations"] });
  // axe schedules its own work on timers: under fake ones, move them along.
  if (vi.isFakeTimers()) {
    let done = false;
    void run.finally(() => (done = true));
    while (!done) {
      await vi.advanceTimersByTimeAsync(10);
    }
  }
  const results = await run;
  return results.violations
    .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
    .flatMap((violation) =>
      violation.nodes
        .filter((node) => {
          const target = node.target.join(" ");
          return !KNOWN.some((known) => known.rule === violation.id && known.target.test(target));
        })
        .map((node) => {
          // The check's own message says what it measured, e.g. the ratio.
          const detail = [...node.any, ...node.all, ...node.none][0]?.message ?? violation.help;
          return `${violation.id} on ${node.target.join(" ")}: ${detail}`;
        }),
    );
}

/** Timers and Date under the test's control, so a take lasts long enough. */
function freezeClock(): void {
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"],
    now: NOW,
  });
}

function mic(element: Mounted): HTMLButtonElement {
  return element.shadowRoot.querySelector<HTMLButtonElement>("button.mic")!;
}

function press(element: Mounted, type: "pointerdown" | "pointerup"): void {
  mic(element).dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true }));
}

async function startTake(element: Mounted): Promise<void> {
  freezeClock();
  press(element, "pointerdown");
  await settle(element, 150); // the fake microphone takes this long to open
  await settle(element, 1000);
}

async function recordTake(card: Mounted): Promise<void> {
  await startTake(card);
  press(card, "pointerup");
  await settle(card, 400);
  // Decoding the take's waveform is the browser's own work, not a timer.
  vi.useRealTimers();
  await vi.waitUntil(() => !button(card, "Play").disabled);
  await settle(card);
}

/** The accessible name of what has focus inside the element. */
function focused(element: Mounted): string | null {
  const active = element.shadowRoot.activeElement;
  return active?.getAttribute("aria-label") ?? active?.textContent?.trim() ?? null;
}

/** Tab from before the element to past it, naming each stop on the way. */
async function tabStops(element: Mounted): Promise<string[]> {
  const before = document.createElement("button");
  document.body.prepend(before);
  before.focus();
  const stops: string[] = [];
  for (let i = 0; i < 30; i++) {
    await userEvent.tab();
    if (document.activeElement !== element) {
      break;
    }
    stops.push(focused(element) ?? "?");
  }
  return stops;
}

for (const theme of ["light", "dark"] as const) {
  describe(`axe, card, ${theme}`, () => {
    for (const config of [
      {},
      { speaker_picker: "chips" },
      { speaker_picker: "list" },
      { layout: "compact" },
      { recent_messages: "list" },
    ]) {
      it(`idle, ${JSON.stringify(config)}`, async () => {
        const card = await mountCard({ ...PICKED, ...config }, { theme });
        expect(await violations(card)).toEqual([]);
      });
    }

    it("recording", async () => {
      const card = await mountCard(PICKED, { theme });
      await startTake(card);
      expect(await violations(card)).toEqual([]);
    });

    it("review", async () => {
      const card = await mountCard(PICKED, { theme });
      await recordTake(card);
      expect(await violations(card)).toEqual([]);
    });

    it("sending", async () => {
      const card = await mountCard(PICKED, { theme });
      await recordTake(card);
      updateScenario({ latency: 60_000 }); // the upload never answers
      button(card, "Send to 2").click();
      await settleUntil(card, () => mic(card).getAttribute("aria-label") === "Broadcasting");
      expect(await violations(card)).toEqual([]);
    });

    it("partial broadcast failure", async () => {
      const card = await mountCard(PICKED, { theme, scenario: { broadcast: "partial" } });
      await recordTake(card);
      button(card, "Send to 2").click();
      await settleUntil(card, () => card.shadowRoot.querySelector(".status.error") !== null);
      expect(await violations(card)).toEqual([]);
    });

    it("microphone denied", async () => {
      const card = await mountCard(PICKED, { theme, scenario: { micDenied: true } });
      press(card, "pointerdown");
      await settleUntil(card, () => card.shadowRoot.querySelector(".status.error") !== null);
      expect(await violations(card)).toEqual([]);
    });

    it("insecure context", async () => {
      const card = await mountCard(PICKED, { theme, secure: false });
      expect(await violations(card)).toEqual([]);
    });

    it("speaker dropdown open", async () => {
      const card = await mountCard(PICKED, { theme });
      card.shadowRoot.querySelector<HTMLButtonElement>("button.pill")!.click();
      await settle(card);
      expect(await violations(card)).toEqual([]);
    });

    it("volume open", async () => {
      const card = await mountCard({ ...PICKED, volume_control: true }, { theme });
      button(card, "Broadcast volume").click();
      await settle(card);
      expect(await violations(card)).toEqual([]);
    });

    it("compact menu open", async () => {
      const card = await mountCard(
        { ...PICKED, layout: "compact", recent_messages: "button" },
        { theme },
      );
      button(card, "More").click();
      await settle(card);
      expect(await violations(card)).toEqual([]);
    });

    it("recent messages open", async () => {
      const card = await mountCard({ ...PICKED, recent_messages: "button" }, { theme });
      button(card, "Recent messages").click();
      await settle(card);
      expect(await violations(card)).toEqual([]);
    });
  });

  describe(`axe, tile, ${theme}`, () => {
    for (const shape of ["square", "horizontal"] as const) {
      const size = shape === "square" ? { width: 248, height: 248 } : { width: 248, height: 56 };

      it(`${shape}, idle`, async () => {
        const tile = await mountTile({ ...TILE, shape }, { theme, ...size });
        expect(await violations(tile)).toEqual([]);
      });

      it(`${shape}, recording`, async () => {
        const tile = await mountTile({ ...TILE, shape }, { theme, ...size });
        await startTake(tile);
        expect(await violations(tile)).toEqual([]);
      });
    }
  });
}

describe("the card from the keyboard", () => {
  it("reaches every control with Tab while reviewing", async () => {
    const card = await mountCard({ ...PICKED, volume_control: true, recent_messages: "button" });
    await recordTake(card);
    expect(await tabStops(card)).toEqual([
      "Recent messages",
      "Broadcast volume",
      "Play",
      "Discard",
      "Hold to talk",
      "Send to 2",
      "Kitchen, Living Room",
    ]);
  });

  it("reaches each speaker chip with Tab", async () => {
    const card = await mountCard({
      ...PICKED,
      speaker_picker: "chips",
      recent_messages: "off",
      volume_control: false,
    });
    expect(await tabStops(card)).toEqual(["Hold to talk", "Kitchen", "Living Room", "Bedroom"]);
  });

  it("records while Space is held, and says so in the button's name", async () => {
    const card = await mountCard(PICKED);
    mic(card).focus();
    expect(focused(card)).toBe("Hold to talk");

    freezeClock();
    await userEvent.keyboard("{Space>}");
    await settle(card, 1000);
    expect(focused(card)).toBe("Recording — release to stop");

    await userEvent.keyboard("{/Space}");
    await settle(card, 400);
    vi.useRealTimers();
    await vi.waitUntil(() => !button(card, "Play").disabled);
    expect(button(card, "Send to 2").disabled).toBe(false);
  });

  it("starts and stops a take with Enter in tap-to-record mode", async () => {
    const card = await mountCard({ ...PICKED, record_mode: "start_stop" });
    mic(card).focus();
    expect(focused(card)).toBe("Tap to record");

    freezeClock();
    await userEvent.keyboard("{Enter}");
    await settle(card, 1000);
    expect(focused(card)).toBe("Recording — tap to stop");

    await userEvent.keyboard("{Enter}");
    await settle(card, 400);
    vi.useRealTimers();
    await vi.waitUntil(() => !button(card, "Play").disabled);
  });
});

describe("the tile from the keyboard", () => {
  /** The line under the button: what happened to the last take. */
  function status(tile: Mounted): string {
    return tile.shadowRoot
      .querySelector('.tile-status .layer[data-on="true"]')!
      .textContent!.trim();
  }

  it("is one Tab stop, named for where it sends", async () => {
    const tile = await mountTile(TILE, { width: 248, height: 248 });
    expect(await tabStops(tile)).toEqual(["Hold to talk to Kitchen"]);
  });

  it("sends when Space is let go", async () => {
    const tile = await mountTile(TILE, { width: 248, height: 248 });
    mic(tile).focus();

    freezeClock();
    await userEvent.keyboard("{Space>}");
    await settle(tile, 1000);
    expect(focused(tile)).toBe("Recording — release to send, Escape to discard");

    await userEvent.keyboard("{/Space}");
    await settleUntil(tile, () => status(tile) === "Sent");
  });

  it("throws the take away on Escape", async () => {
    const tile = await mountTile(TILE, { width: 248, height: 248 });
    mic(tile).focus();

    freezeClock();
    await userEvent.keyboard("{Space>}");
    await settle(tile, 1000);
    await userEvent.keyboard("{Escape}");
    await settle(tile);
    expect(status(tile)).toBe("Discarded");

    // Letting go of Space afterwards does not send what was thrown away.
    await userEvent.keyboard("{/Space}");
    await settle(tile, 400);
    expect(status(tile)).toBe("Discarded");
  });
});

import { afterEach, describe, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import {
  Mounted,
  NOW,
  button,
  mountCard,
  settle,
  settleUntil,
  unmountAll,
  updateScenario,
} from "../mount";
import { FROZEN_AT_MS, shot } from "./shot";

// What the card looks like, state by state and config by config, in HA's
// light and dark themes at phone width. The references live in
// __screenshots__/ and are only ever written in the Playwright container:
// `npm run test:visual -- -u`, or the "Update screenshots" workflow.

const SPEAKERS = ["media_player.kitchen", "media_player.living_room", "media_player.bedroom"];
const BASE = { title: "Broadcast", speakers: SPEAKERS };
/** Two of them picked, so Send is live and says how many. */
const PICKED = { ...BASE, selected: SPEAKERS.slice(0, 2) };

afterEach(unmountAll);

/**
 * Timers and Date under the test's control from here on: a take lasts
 * exactly as long as the test says, and nothing ticks between screenshots.
 */
function freezeClock(): void {
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"],
    now: NOW,
  });
}

function press(card: Mounted, type: "pointerdown" | "pointerup"): void {
  card.shadowRoot
    .querySelector("button.mic")!
    .dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true }));
}

/** Press record and keep going for the frozen animations' length. */
async function startTake(card: Mounted): Promise<void> {
  freezeClock();
  press(card, "pointerdown");
  await settle(card, 150); // the fake microphone takes this long to open
  await settle(card, FROZEN_AT_MS);
}

/** Record a take and wait until it is loaded for review. */
async function recordTake(card: Mounted): Promise<void> {
  await startTake(card);
  press(card, "pointerup");
  await settle(card, 400);
  // Decoding the take's waveform is the browser's own work, not a timer.
  vi.useRealTimers();
  await vi.waitUntil(() => !button(card, "Play").disabled);
  await settle(card);
}

/** Record, then press Send with the clock frozen again. */
async function send(card: Mounted): Promise<void> {
  await recordTake(card);
  freezeClock();
  button(card, "Send to 2").click();
}

for (const theme of ["light", "dark"] as const) {
  describe(`card states, ${theme}`, () => {
    it("idle", async () => {
      const card = await mountCard(BASE, { theme });
      await shot(card, `card-idle-${theme}`);
    });

    it("recording, push to talk", async () => {
      const card = await mountCard(BASE, { theme });
      await startTake(card);
      await shot(card, `card-recording-push-to-talk-${theme}`);
    });

    it("recording, start/stop", async () => {
      const card = await mountCard({ ...BASE, record_mode: "start_stop" }, { theme });
      await startTake(card);
      await shot(card, `card-recording-start-stop-${theme}`);
    });

    it("review", async () => {
      const card = await mountCard(PICKED, { theme });
      await recordTake(card);
      await shot(card, `card-review-${theme}`);
    });

    it("playing back", async () => {
      // The playhead stays where the seek put it: nothing actually plays.
      vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
      const card = await mountCard(PICKED, { theme });
      await recordTake(card);
      const wave = card.shadowRoot.querySelector<HTMLElement>(".wave.seekable")!;
      const box = wave.getBoundingClientRect();
      await userEvent.click(page.elementLocator(wave), {
        position: { x: Math.round(box.width * 0.4), y: Math.round(box.height / 2) },
      });
      button(card, "Play").click();
      await settleUntil(card, () => card.shadowRoot.querySelector('[aria-label="Pause"]') !== null);
      await shot(card, `card-playing-${theme}`);
    });

    it("sending", async () => {
      const card = await mountCard(PICKED, { theme });
      updateScenario({ latency: 60_000 }); // the upload never answers
      await send(card);
      await settleUntil(card, () => card.shadowRoot.querySelector('[aria-label="Broadcasting"]') !== null);
      await shot(card, `card-sending-${theme}`);
    });

    it("partial broadcast failure", async () => {
      const card = await mountCard(PICKED, { theme, scenario: { broadcast: "partial" } });
      await send(card);
      await settleUntil(card, () => card.shadowRoot.querySelector(".status.error") !== null);
      await shot(card, `card-partial-failure-${theme}`);
    });

    it("review, not kept", async () => {
      const card = await mountCard({ ...PICKED, keep_messages: false }, { theme });
      await recordTake(card);
      await shot(card, `card-review-not-kept-${theme}`);
    });

    it("saved", async () => {
      const card = await mountCard({ ...PICKED, keep_messages: false }, { theme });
      await recordTake(card);
      button(card, "Save to history").click();
      await settleUntil(card, () => !!card.shadowRoot.querySelector('.save[data-saved="true"]'));
      await shot(card, `card-saved-${theme}`);
    });

    it("compact, not kept", async () => {
      const card = await mountCard(
        { ...PICKED, layout: "compact", keep_messages: false },
        { theme },
      );
      await recordTake(card);
      await shot(card, `card-compact-not-kept-${theme}`);
    });

    it("microphone denied", async () => {
      const card = await mountCard(BASE, { theme, scenario: { micDenied: true } });
      press(card, "pointerdown");
      await settleUntil(card, () => card.shadowRoot.querySelector(".status.error") !== null);
      await shot(card, `card-mic-denied-${theme}`);
    });

    it("insecure context", async () => {
      const card = await mountCard(BASE, { theme, secure: false });
      await shot(card, `card-insecure-${theme}`);
    });

    it("empty history", async () => {
      const card = await mountCard(
        { ...BASE, recent_messages: "list" },
        { theme, scenario: { history: "empty" } },
      );
      await shot(card, `card-history-empty-${theme}`);
    });
  });

  describe(`card config, ${theme}`, () => {
    // full + dropdown is the default, and the idle state above.
    for (const picker of ["chips", "list"] as const) {
      it(`full, ${picker}`, async () => {
        const card = await mountCard({ ...PICKED, speaker_picker: picker }, { theme });
        await shot(card, `card-full-${picker}-${theme}`);
      });
    }

    // Compact always uses the dropdown (resolveConfig, config.test.ts), so
    // one screenshot covers every speaker_picker value.
    it("compact", async () => {
      const card = await mountCard({ ...PICKED, layout: "compact" }, { theme });
      await shot(card, `card-compact-${theme}`);
    });

    it("recent messages as a list", async () => {
      const card = await mountCard({ ...PICKED, recent_messages: "list" }, { theme });
      await shot(card, `card-history-list-${theme}`);
    });

    it("no history, no volume", async () => {
      const card = await mountCard(
        { ...PICKED, recent_messages: "off", volume_control: false },
        { theme },
      );
      await shot(card, `card-minimal-${theme}`);
    });
  });
}

import { afterEach, describe, it, vi } from "vitest";

import { Mounted, NOW, mountTile, settle, unmountAll } from "../mount";
import { FROZEN_AT_MS, shot } from "./shot";

// The tile in both shapes, idle and mid-take, sized like its sections-view
// grid cell (as in the dev harness): 3×2 for square, 6×1 for horizontal, and
// a square dragged to 6×4, whose button must grow with it.

const SIZES = {
  square: { width: 120, height: 120 },
  horizontal: { width: 248, height: 56 },
  "square-6x4": { width: 248, height: 248 },
} as const;

afterEach(unmountAll);

async function startTake(tile: Mounted): Promise<void> {
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"],
    now: NOW,
  });
  tile.shadowRoot
    .querySelector("button.mic")!
    .dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
  await settle(tile, 150);
  await settle(tile, FROZEN_AT_MS);
}

for (const theme of ["light", "dark"] as const) {
  describe(`tile, ${theme}`, () => {
    for (const size of ["square", "horizontal", "square-6x4"] as const) {
      const shape = size === "horizontal" ? "horizontal" : "square";
      const config = { name: "Kitchen", speakers: ["media_player.kitchen"], shape };

      it(`${size}, idle`, async () => {
        const tile = await mountTile(config, { theme, ...SIZES[size] });
        await shot(tile, `tile-${size}-idle-${theme}`);
      });

      it(`${size}, recording`, async () => {
        const tile = await mountTile(config, { theme, ...SIZES[size] });
        await startTake(tile);
        await shot(tile, `tile-${size}-recording-${theme}`);
      });
    }
  });
}

import { afterEach, describe, expect, it, vi } from "vitest";

import { Mounted, NOW, mountCard, mountTile, settle, settleUntil, unmountAll } from "./mount";

// The push-to-talk gesture with real pointer events: a press follows the
// pointer off the button, and on the tile letting go on the bin throws the
// take away.

afterEach(unmountAll);

const SIZES = {
  square: { width: 120, height: 120 },
  horizontal: { width: 248, height: 56 },
} as const;

function mic(element: Mounted): HTMLButtonElement {
  return element.shadowRoot.querySelector<HTMLButtonElement>("button.mic")!;
}

function bin(tile: Mounted): HTMLElement {
  return tile.shadowRoot.querySelector<HTMLElement>(".bin")!;
}

function centre(element: Element): { clientX: number; clientY: number } {
  const box = element.getBoundingClientRect();
  return { clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 };
}

/** A pointer event on the button, which holds the pointer while pressed. */
function pointer(element: Mounted, type: string, at = centre(mic(element))): void {
  mic(element).dispatchEvent(
    new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, ...at }),
  );
}

function recording(element: Mounted): boolean {
  return element.shadowRoot.querySelector(".mic-wrap")!.getAttribute("data-recording") === "true";
}

async function hold(element: Mounted): Promise<void> {
  // The mount freezes Date, and the fake recorder times a take by it: fake
  // timers let the take run, so letting go is a message rather than a tap.
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"],
    now: NOW,
  });
  pointer(element, "pointerdown");
  await settleUntil(element, () => recording(element));
}

/** Hold long enough that letting go is a message, not a tap. */
async function talk(element: Mounted): Promise<void> {
  await hold(element);
  await settle(element, 1000);
}

/** What the tile's status line shows now; the other layers are hidden. */
function status(tile: Mounted): string {
  return tile.shadowRoot
    .querySelector('.tile-status .layer[data-on="true"]')!
    .textContent!.trim();
}

const AWAY = { clientX: 600, clientY: 600 };

for (const shape of ["square", "horizontal"] as const) {
  describe(`${shape} tile`, () => {
    const config = { speakers: ["media_player.kitchen"], shape };

    it("throws the take away when it is let go on the bin", async () => {
      const tile = await mountTile(config, SIZES[shape]);
      await talk(tile);

      pointer(tile, "pointermove", centre(bin(tile)));
      await settle(tile);
      expect(status(tile)).toBe("Release to discard");

      pointer(tile, "pointerup", centre(bin(tile)));
      await settle(tile, 600);
      expect(status(tile)).toBe("Discarded");
    });

    it("keeps recording when the pointer comes back off the bin", async () => {
      const tile = await mountTile(config, SIZES[shape]);
      await talk(tile);

      pointer(tile, "pointermove", centre(bin(tile)));
      await settle(tile);
      pointer(tile, "pointermove");
      await settle(tile);

      expect(status(tile)).toMatch(/^0:0\d$/);
      pointer(tile, "pointerup");
      await settleUntil(tile, () => status(tile) === "Sent");
    });

    it("sends when let go off the bin, even outside the tile", async () => {
      const tile = await mountTile(config, SIZES[shape]);
      await talk(tile);

      pointer(tile, "pointerleave", AWAY);
      pointer(tile, "pointermove", AWAY);
      await settle(tile);
      expect(recording(tile)).toBe(true);

      pointer(tile, "pointerup", AWAY);
      await settleUntil(tile, () => status(tile) === "Sent");
    });

    it("throws the take away on Escape", async () => {
      const tile = await mountTile(config, SIZES[shape]);
      await talk(tile);

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await settle(tile);

      expect(status(tile)).toBe("Discarded");
    });

    it("keeps the bin's place whether or not a take is running", async () => {
      const tile = await mountTile(config, SIZES[shape]);
      const before = bin(tile).getBoundingClientRect();
      await hold(tile);
      const during = bin(tile).getBoundingClientRect();

      expect(during.toJSON()).toEqual(before.toJSON());
    });
  });
}

describe("square tile", () => {
  it("hides the status line under the bin while recording", async () => {
    const tile = await mountTile({ speakers: ["media_player.kitchen"], shape: "square" }, SIZES.square);
    await hold(tile);
    await settle(tile, 400);

    const line = tile.shadowRoot.querySelector<HTMLElement>(".tile-status")!;
    expect(getComputedStyle(line).opacity).toBe("0");
  });

  it("shows the timer in place of the name while recording, and the bin only says Discard", async () => {
    const tile = await mountTile({ speakers: ["media_player.kitchen"], shape: "square" }, SIZES.square);
    const nameLine = () =>
      tile.shadowRoot.querySelector('.tile-name .layer[data-on="true"]')!.textContent!.trim();
    const before = nameLine();
    await talk(tile);

    expect(nameLine()).toMatch(/^0:0\d$/);
    expect(bin(tile).textContent!.trim()).toBe("Discard");

    pointer(tile, "pointerup");
    await settleUntil(tile, () => status(tile) === "Sent");
    expect(nameLine()).toBe(before);
  });

  it("centres the bin's text on the status line it covers", async () => {
    const tile = await mountTile({ speakers: ["media_player.kitchen"], shape: "square" }, SIZES.square);
    const middle = (box: DOMRect) => box.top + box.height / 2;
    const line = tile.shadowRoot.querySelector(".tile-status")!.getBoundingClientRect();

    expect(middle(bin(tile).getBoundingClientRect())).toBe(middle(line));
  });

  it("leaves room between the name and the bin's outline", async () => {
    const tile = await mountTile({ speakers: ["media_player.kitchen"], shape: "square" }, SIZES.square);
    const name = tile.shadowRoot.querySelector(".tile-name")!.getBoundingClientRect();

    expect(bin(tile).getBoundingClientRect().top).toBeGreaterThanOrEqual(name.bottom + 2);
  });
});

describe("square tile, any size", () => {
  // The outer blob is 1.22× the button and grows up to 1.35× with the voice.
  const BLOB_REACH = (1.22 * 1.35 - 1) / 2;

  for (const [columns, rows] of [
    [3, 2],
    [4, 3],
    [6, 4],
  ] as const) {
    it(`keeps the bin clear of the recording blob at ${columns}×${rows}`, async () => {
      const tile = await mountTile(
        { speakers: ["media_player.kitchen"], shape: "square" },
        { width: (columns * 128) / 3 - 8, height: rows * 64 - 8 },
      );
      const button = mic(tile).getBoundingClientRect();

      expect(bin(tile).getBoundingClientRect().top).toBeGreaterThanOrEqual(
        button.bottom + button.height * BLOB_REACH,
      );
    });
  }
});

describe("card, push-to-talk", () => {
  it("keeps recording when the pointer slides off the button", async () => {
    const card = await mountCard({
      speakers: ["media_player.kitchen"],
      record_mode: "push_to_talk",
    });
    await hold(card);

    pointer(card, "pointerleave", AWAY);
    await settle(card);

    expect(recording(card)).toBe(true);
  });
});

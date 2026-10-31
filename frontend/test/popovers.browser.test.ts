import { afterEach, describe, expect, it } from "vitest";

import { Mounted, button, mountCard, settle, unmountAll } from "./mount";

// Light dismiss: a press outside an open popover closes it, and the press
// still reaches what it landed on.

afterEach(unmountAll);

const SPEAKERS = ["media_player.kitchen", "media_player.living_room"];

/** A press as a finger makes it: pointerdown, then the click. */
async function press(card: Mounted, target: Element): Promise<void> {
  target.dispatchEvent(
    new PointerEvent("pointerdown", { bubbles: true, composed: true }),
  );
  (target as HTMLElement).click();
  await settle(card);
}

function pill(card: Mounted): HTMLButtonElement {
  return card.shadowRoot.querySelector<HTMLButtonElement>("button.pill")!;
}

function panel(card: Mounted): Element | null {
  return card.shadowRoot.querySelector(".pill-panel");
}

function popover(card: Mounted): Element | null {
  return card.shadowRoot.querySelector(".popover");
}

describe("the speaker dropdown", () => {
  it("closes on a press elsewhere on the card", async () => {
    const card = await mountCard({ speakers: SPEAKERS });
    await press(card, pill(card));
    expect(panel(card)).not.toBeNull();

    await press(card, card.shadowRoot.querySelector(".title")!);

    expect(panel(card)).toBeNull();
    expect(pill(card).getAttribute("aria-expanded")).toBe("false");
  });

  it("closes on a press outside the card", async () => {
    const card = await mountCard({ speakers: SPEAKERS });
    await press(card, pill(card));

    await press(card, document.body);

    expect(panel(card)).toBeNull();
  });

  it("stays open while speakers are ticked, and its button still closes it", async () => {
    const card = await mountCard({ speakers: SPEAKERS, selected: [] });
    await press(card, pill(card));

    await press(card, card.shadowRoot.querySelector(".target-row")!);

    expect(panel(card)).not.toBeNull();
    expect(pill(card).textContent).toContain("Kitchen");

    await press(card, pill(card));
    expect(panel(card)).toBeNull();
  });

  it("closes on Escape", async () => {
    const card = await mountCard({ speakers: SPEAKERS });
    await press(card, pill(card));

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await settle(card);

    expect(panel(card)).toBeNull();
  });

  it("lets the press through to what it landed on", async () => {
    const card = await mountCard({ speakers: SPEAKERS, volume_control: true });
    await press(card, pill(card));

    await press(card, button(card, "Broadcast volume"));

    expect(panel(card)).toBeNull();
    expect(popover(card)).not.toBeNull();
  });
});

describe("the volume popover", () => {
  it("closes on a press outside it but not inside it", async () => {
    const card = await mountCard({ speakers: SPEAKERS, volume_control: true });
    await press(card, button(card, "Broadcast volume"));

    await press(card, popover(card)!.querySelector("button, input")!);
    expect(popover(card)).not.toBeNull();

    await press(card, card.shadowRoot.querySelector(".title")!);
    expect(popover(card)).toBeNull();
  });
});

describe("the compact ⋮ menu", () => {
  it("closes on a press outside it, which goes on to what it hit", async () => {
    const card = await mountCard({
      layout: "compact",
      speakers: SPEAKERS,
      recent_messages: "button",
    });
    await press(card, button(card, "More"));
    expect(card.shadowRoot.querySelector(".menu")).not.toBeNull();

    await press(card, pill(card));

    expect(card.shadowRoot.querySelector(".menu")).toBeNull();
    expect(panel(card)).not.toBeNull();
  });
});

describe("the recent messages dialog", () => {
  it("closes on a click on its backdrop, not on its padding", async () => {
    const card = await mountCard({ speakers: SPEAKERS, recent_messages: "button" });
    await press(card, button(card, "Recent messages"));
    const dialog = card.shadowRoot.querySelector("dialog")!;
    expect(dialog.open).toBe(true);
    const box = dialog.getBoundingClientRect();

    dialog.dispatchEvent(
      new MouseEvent("click", { bubbles: true, clientX: box.left + 2, clientY: box.top + 2 }),
    );
    await settle(card);
    expect(card.shadowRoot.querySelector("dialog")).not.toBeNull();

    dialog.dispatchEvent(
      new MouseEvent("click", { bubbles: true, clientX: box.left - 5, clientY: box.top - 5 }),
    );
    await settle(card);
    expect(card.shadowRoot.querySelector("dialog")).toBeNull();
  });
});

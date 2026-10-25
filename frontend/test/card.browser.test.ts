import { afterEach, describe, expect, it } from "vitest";

import "../src/card";
import { DEFAULT_SCENARIO, MockBackend, createMockHass } from "../dev/mock-hass";
import { LOVELACE_ASSIGNS } from "./helpers";

// The card as Lovelace hosts it: a real element in a real document, rendered
// by lit-html into its shadow root with its styles adopted. The Node tests
// cannot see any of that; they read the template strings.

type Card = HTMLElement & { setConfig(config: unknown): void; hass: unknown };

async function mount(config: Record<string, unknown>): Promise<Card> {
  const card = document.createElement("hass-broadcast-card") as Card;
  Object.assign(card, LOVELACE_ASSIGNS);
  card.setConfig({ type: "custom:hass-broadcast-card", ...config });
  card.hass = createMockHass(new MockBackend({ ...DEFAULT_SCENARIO, latency: 0 }));
  document.body.append(card);
  await (card as any).updateComplete;
  return card;
}

afterEach(() => {
  document.body.replaceChildren();
});

it("runs in UTC, like the unit project", () => {
  // formatWhen buckets by local calendar day against UTC fixtures; the page's
  // clock comes from Playwright's timezoneId, not from test.env.
  expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe("UTC");
});

describe("hass-broadcast-card in a browser", () => {
  it("renders an enabled, laid-out record button", async () => {
    const card = await mount({ speakers: ["media_player.kitchen"] });

    // The test page is served from localhost, a secure context, so the
    // recording UI is offered rather than the insecure-context error.
    expect(window.isSecureContext).toBe(true);

    const mic = card.shadowRoot!.querySelector<HTMLButtonElement>("button.mic");
    expect(mic).not.toBeNull();
    expect(mic!.disabled).toBe(false);
    expect(mic!.getAttribute("aria-label")).toBe("Hold to talk");

    // Real layout: the stylesheet was adopted and the button has a size.
    const box = mic!.getBoundingClientRect();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  });

  it("uses the configured title", async () => {
    const card = await mount({ title: "Announce", speakers: [] });

    expect(card.shadowRoot!.textContent).toContain("Announce");
  });
});

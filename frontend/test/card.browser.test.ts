import { afterEach, describe, expect, it } from "vitest";

import { mountCard, unmountAll } from "./mount";

// The card as Lovelace hosts it: a real element in a real document, rendered
// by lit-html into its shadow root with its styles adopted. The Node tests
// cannot see any of that; they read the template strings.

afterEach(unmountAll);

it("runs in UTC, like the unit project", () => {
  // formatWhen buckets by local calendar day against UTC fixtures; the page's
  // clock comes from Playwright's timezoneId, not from test.env.
  expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe("UTC");
});

describe("hass-broadcast-card in a browser", () => {
  it("renders an enabled, laid-out record button", async () => {
    const card = await mountCard({ speakers: ["media_player.kitchen"] });

    // The test page is served from localhost, a secure context, so the
    // recording UI is offered rather than the insecure-context error.
    expect(window.isSecureContext).toBe(true);

    const mic = card.shadowRoot.querySelector<HTMLButtonElement>("button.mic");
    expect(mic).not.toBeNull();
    expect(mic!.disabled).toBe(false);
    expect(mic!.getAttribute("aria-label")).toBe("Hold to talk");

    // Real layout: the stylesheet was adopted and the button has a size.
    const box = mic!.getBoundingClientRect();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  });

  for (const layout of ["full", "compact"]) {
    it(`keeps Save in place when a status replaces the review (${layout})`, async () => {
      const card = (await mountCard({
        layout,
        keep_messages: false,
        speakers: ["media_player.kitchen"],
        selected: ["media_player.kitchen"],
      })) as any;
      card.clip = {
        source: { kind: "temporary", id: "tmp", blob: new Blob(["x"]) },
        url: "blob:none",
        duration: 3,
        peaks: [],
      };
      await card.updateComplete;

      // Every layer is always rendered, so the button is drawn in both; what
      // matters is that the one on screen does not move when the view flips.
      const box = (view: string) => {
        const button = card.shadowRoot!.querySelector(`.layer-${view} button.save`);
        expect(button, `Save in .layer-${view}`).not.toBeNull();
        const { x, y, width, height } = button!.getBoundingClientRect();
        return { x, y, width, height };
      };
      expect(card.view).toBe("review");
      const review = box("review");
      expect(review.width).toBeGreaterThan(0);

      card.status = { kind: "info", text: "Sent to Kitchen", sticky: true };
      await card.updateComplete;
      expect(card.view).toBe("status");

      expect(box("status")).toEqual(review);
      expect(box("review")).toEqual(review);
    });
  }

  it("uses the configured title", async () => {
    const card = await mountCard({ title: "Announce", speakers: [] });

    expect(card.shadowRoot.textContent).toContain("Announce");
  });
});

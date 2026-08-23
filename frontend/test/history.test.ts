import { describe, expect, it } from "vitest";

import { renderedText } from "./helpers";
import { historySection } from "../src/ui/history";

const now = new Date("2026-08-22T14:30:00Z");

const messages = [
  {
    id: "one",
    created: "2026-08-22T14:00:00Z",
    duration: 3,
    can_delete: true,
    extension: "wav",
  },
  {
    id: "two",
    created: "2026-08-21T09:00:00Z",
    duration: 65,
    can_delete: false,
    extension: "mp3",
  },
];

const base = { messages, onLoad: () => {}, onDelete: () => {}, now };

describe("historySection", () => {
  it("names each message by when it was left and how long it runs", () => {
    const html = renderedText(historySection(base));

    expect(html).toContain("Recent messages");
    expect(html).toContain("30 minutes ago");
    expect(html).toContain("0:03");
    expect(html).toContain("1:05");
  });

  it("offers a delete control only where the server allows it", () => {
    const html = renderedText(historySection(base));

    // One row of two can be deleted, and the other row is still shown.
    // Match the aria-label alone: the button also carries a `title="Delete"`.
    expect(html.match(/aria-label="Delete"/g)).toHaveLength(1);
    expect(html).toContain("Yesterday");
  });

  it("marks the row whose message is loaded into the card", () => {
    const html = renderedText(historySection({ ...base, loadedId: "two" }));

    expect(html).toContain('data-loaded="true"');
    expect(html.match(/data-loaded="true"/g)).toHaveLength(1);
  });

  it("marks the row being fetched", () => {
    const html = renderedText(historySection({ ...base, loadingId: "one" }));

    expect(html).toContain('data-loading="true"');
  });

  it("keeps its height with nothing recorded yet", () => {
    const html = renderedText(historySection({ ...base, messages: [] }));

    expect(html).toContain("Recent messages");
    expect(html).toContain("Nothing recorded yet");
  });
});

/** `count` messages, newest first, every other one deletable. */
function manyMessages(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `id-${index}`,
    created: new Date(
      Date.parse("2026-08-22T14:00:00Z") - index * 60_000,
    ).toISOString(),
    duration: index,
    can_delete: index % 2 === 0,
    extension: "wav",
  }));
}

const slots = (html: string) => html.match(/class="history-slot"/g)?.length ?? 0;
const rows = (html: string) => html.match(/class="history-row"/g)?.length ?? 0;

describe("historySection body height", () => {
  it("shows at most three rows however long the list is", () => {
    const html = renderedText(historySection({ ...base, messages: manyMessages(20) }));

    expect(rows(html)).toBe(3);
  });

  it("reserves the same three row slots whatever the list length", () => {
    for (const length of [0, 1, 3, 20]) {
      const html = renderedText(
        historySection({ ...base, messages: manyMessages(length) }),
      );
      expect(slots(html)).toBe(3);
    }
  });

  it("keeps the fourth message and beyond out of the body", () => {
    const html = renderedText(historySection({ ...base, messages: manyMessages(5) }));

    // Durations stand in for identity: 0:00..0:02 are the newest three.
    expect(html).toContain("0:02");
    expect(html).not.toContain("0:03");
  });
});

describe("historySection dialog", () => {
  it("counts the whole list on the control that opens it", () => {
    const html = renderedText(historySection({ ...base, messages: manyMessages(7) }));

    expect(html).toContain("Show all · 7");
  });

  it("offers nothing to open with nothing recorded yet", () => {
    expect(renderedText(historySection({ ...base, messages: [] }))).toContain(
      'data-disabled="true"',
    );
    expect(renderedText(historySection(base))).toContain('data-disabled="false"');
  });

  it("holds the rest of the list back until it is open", () => {
    const props = { ...base, messages: manyMessages(5) };

    expect(renderedText(historySection(props))).not.toContain("0:04");
    expect(renderedText(historySection({ ...props, dialogOpen: true }))).toContain(
      "0:04",
    );
  });

  it("carries a delete control into the dialog where the server allows it", () => {
    const html = renderedText(
      historySection({ ...base, messages: manyMessages(5), dialogOpen: true }),
    );

    // Three of five are deletable; the body's three rows repeat two of them.
    expect(html.match(/aria-label="Delete"/g)).toHaveLength(3 + 2);
  });
});

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

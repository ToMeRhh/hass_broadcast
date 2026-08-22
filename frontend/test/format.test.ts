import { describe, expect, it } from "vitest";

import { formatClock, formatWhen } from "../src/format";

describe("formatClock", () => {
  it("renders seconds as m:ss", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(3.4)).toBe("0:03");
    expect(formatClock(62)).toBe("1:02");
    expect(formatClock(600)).toBe("10:00");
  });

  it("reads nonsense as zero rather than rendering NaN", () => {
    // The player shows this before any clip is loaded, where duration is
    // undefined-ish; "NaN:NaN" on a card is worse than an honest 0:00.
    expect(formatClock(Number.NaN)).toBe("0:00");
    expect(formatClock(-5)).toBe("0:00");
    expect(formatClock(Infinity)).toBe("0:00");
  });
});

describe("formatWhen", () => {
  const now = new Date("2026-08-22T14:30:00Z");

  it("names the recent past in words", () => {
    expect(formatWhen("2026-08-22T14:29:30Z", now)).toBe("Just now");
    expect(formatWhen("2026-08-22T14:29:00Z", now)).toBe("1 minute ago");
    expect(formatWhen("2026-08-22T14:00:00Z", now)).toBe("30 minutes ago");
  });

  it("switches to a clock time for today and yesterday", () => {
    // The time itself is locale- and timezone-dependent, so assert only the
    // prefix; the point is which bucket the timestamp fell into.
    expect(formatWhen("2026-08-22T09:00:00Z", now)).toMatch(/^Today /);
    expect(formatWhen("2026-08-21T09:00:00Z", now)).toMatch(/^Yesterday /);
  });

  it("falls back to a date further back", () => {
    const older = formatWhen("2026-08-01T09:00:00Z", now);
    expect(older).not.toMatch(/^(Today|Yesterday|Just now)/);
    expect(older).not.toBe("");
  });

  it("does not throw on an unparseable timestamp", () => {
    expect(formatWhen("not a date", now)).toBe("Unknown time");
  });
});

import { describe, expect, it } from "vitest";

import { renderedText } from "./helpers";
import { summarize, targetList } from "../src/ui/targets";

const players = [
  { entityId: "media_player.kitchen", name: "Kitchen", available: true },
  { entityId: "media_player.attic", name: "Attic", available: true },
  { entityId: "media_player.bath", name: "Bathroom", available: false },
];

const base = {
  players,
  selected: ["media_player.kitchen"],
  open: false,
  onToggle: () => {},
  onOpenChange: () => {},
};

describe("targetList", () => {
  it("names every player and counts the selection in all three styles", () => {
    for (const style of ["rows", "chips", "pill"] as const) {
      const html = renderedText(targetList({ ...base, style, open: true }));
      expect(html).toContain("Kitchen");
      expect(html).toContain("Attic");
      expect(html).toContain("1 of 3");
    }
  });

  it("marks an unavailable speaker rather than hiding it", () => {
    const html = renderedText(targetList({ ...base, style: "rows" }));
    expect(html).toContain("Bathroom");
    expect(html).toContain("unavailable");
  });

  it("keeps a closed pill's rows out of the markup", () => {
    const closed = renderedText(targetList({ ...base, style: "pill" }));
    const open = renderedText(targetList({ ...base, style: "pill", open: true }));

    expect(closed).not.toContain("Attic");
    expect(open).toContain("Attic");
  });

  it("says so when no speaker was found at all", () => {
    const html = renderedText(
      targetList({ ...base, players: [], selected: [], style: "rows" }),
    );
    expect(html).toContain("No speakers found");
  });
});

describe("summarize", () => {
  it("names a short selection and counts a long one", () => {
    expect(summarize(players, [])).toBe("No speakers selected");
    expect(summarize(players, ["media_player.kitchen"])).toBe("Kitchen");
    expect(
      summarize(players, ["media_player.kitchen", "media_player.attic"]),
    ).toBe("Kitchen, Attic");
    expect(
      summarize(players, [
        "media_player.kitchen",
        "media_player.attic",
        "media_player.bath",
      ]),
    ).toBe("Kitchen, Attic +1");
  });
});

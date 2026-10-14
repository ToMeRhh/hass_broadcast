import { describe, expect, it } from "vitest";

import { resolveLayout, resolveSections } from "../src/sections";

describe("resolveLayout", () => {
  it("is full unless compact is asked for", () => {
    expect(resolveLayout({})).toBe("full");
    expect(resolveLayout({ layout: "compact" })).toBe("compact");
    expect(resolveLayout({ layout: "nonsense" })).toBe("full");
  });
});

describe("resolveSections for cards predating the sections key", () => {
  it.each([
    [undefined, "rows"],
    ["rows", "rows"],
    ["chips", "chips"],
    ["dropdown", "pill"],
  ])("maps player_list %s to a %s speaker list", (playerList, style) => {
    expect(resolveSections({ player_list: playerList })[0]).toEqual({
      type: "speakers",
      style,
    });
  });

  it("keeps recent messages as a list and volume as an icon", () => {
    expect(resolveSections({})).toEqual([
      { type: "speakers", style: "rows" },
      { type: "history", style: "list" },
      { type: "volume", style: "icon" },
    ]);
  });

  it("leaves recent messages out when show_history was false", () => {
    expect(resolveSections({ show_history: false }).map((s) => s.type)).toEqual([
      "speakers",
      "volume",
    ]);
  });
});

describe("resolveSections with a sections list", () => {
  it("keeps the configured order and styles", () => {
    expect(
      resolveSections({
        sections: [
          { type: "volume" },
          { type: "history", style: "icon" },
          { type: "speakers", style: "chips" },
        ],
      }),
    ).toEqual([
      { type: "volume", style: "icon" },
      { type: "history", style: "icon" },
      { type: "speakers", style: "chips" },
    ]);
  });

  it("hides what the list leaves out, and ignores the legacy keys", () => {
    expect(
      resolveSections({
        sections: [{ type: "speakers", style: "pill" }],
        player_list: "chips",
        show_history: true,
      }),
    ).toEqual([{ type: "speakers", style: "pill" }]);
  });

  it("cannot hide the speakers", () => {
    expect(resolveSections({ sections: [{ type: "history" }] })).toEqual([
      { type: "speakers", style: "pill" },
      { type: "history", style: "list" },
    ]);
    expect(resolveSections({ sections: [] })).toEqual([
      { type: "speakers", style: "pill" },
    ]);
  });

  it("drops unknown types and duplicates, and defaults unknown styles", () => {
    expect(
      resolveSections({
        sections: [
          { type: "weather" },
          { type: "history", style: "carousel" },
          { type: "history", style: "icon" },
          { type: "speakers", style: "rows" },
          null as any,
        ],
      }),
    ).toEqual([
      { type: "history", style: "list" },
      { type: "speakers", style: "rows" },
    ]);
  });

  it("forces the speaker pill in compact, which has no room for the others", () => {
    expect(
      resolveSections({
        layout: "compact",
        sections: [{ type: "speakers", style: "rows" }, { type: "volume" }],
      }),
    ).toEqual([
      { type: "speakers", style: "pill" },
      { type: "volume", style: "icon" },
    ]);
  });
});

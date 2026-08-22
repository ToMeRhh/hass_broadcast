import { describe, it, expect } from "vitest";
import {
  allowedTargets,
  discoverPlayers,
  visiblePlayers,
} from "../src/players";

/** A hass stub whose entities carry the given supported_features bitmask. */
function hassWith(states: Record<string, number>): any {
  return {
    states: Object.fromEntries(
      Object.entries(states).map(([entityId, features]) => [
        entityId,
        { attributes: { supported_features: features } },
      ]),
    ),
  };
}

describe("discoverPlayers", () => {
  it("returns media players that support play_media, sorted", () => {
    const hass = hassWith({
      "media_player.zone": 512,
      "media_player.attic": 512 | 4,
    });

    expect(discoverPlayers(hass)).toEqual([
      "media_player.attic",
      "media_player.zone",
    ]);
  });

  it("skips media players without the play_media feature", () => {
    const hass = hassWith({ "media_player.tv": 4, "media_player.attic": 512 });

    expect(discoverPlayers(hass)).toEqual(["media_player.attic"]);
  });

  it("skips entities outside the media_player domain", () => {
    const hass = hassWith({ "light.attic": 512, "media_player.attic": 512 });

    expect(discoverPlayers(hass)).toEqual(["media_player.attic"]);
  });

  it("returns nothing when hass is not available yet", () => {
    expect(discoverPlayers(undefined)).toEqual([]);
  });
});

describe("visiblePlayers", () => {
  const discovered = ["media_player.attic", "media_player.kitchen"];

  it("shows everything discovered when neither list is configured", () => {
    expect(visiblePlayers(discovered)).toEqual(discovered);
  });

  it("shows exactly the configured list, in its own order", () => {
    expect(
      visiblePlayers(discovered, ["media_player.kitchen", "media_player.attic"]),
    ).toEqual(["media_player.kitchen", "media_player.attic"]);
  });

  it("keeps a shown player that discovery missed", () => {
    // An entity that is unavailable, or that under-reports supported_features,
    // still belongs on the card if the user asked for it by name.
    expect(visiblePlayers(discovered, ["media_player.garage"])).toEqual([
      "media_player.garage",
    ]);
  });

  it("removes hidden players from discovery", () => {
    expect(
      visiblePlayers(discovered, undefined, ["media_player.attic"]),
    ).toEqual(["media_player.kitchen"]);
  });

  it("applies the hide list after the show list", () => {
    expect(
      visiblePlayers(discovered, discovered, ["media_player.attic"]),
    ).toEqual(["media_player.kitchen"]);
  });

  it("falls back to discovery when the show list is empty", () => {
    expect(visiblePlayers(discovered, [])).toEqual(discovered);
  });

  it("drops duplicates from the show list", () => {
    expect(
      visiblePlayers(discovered, ["media_player.attic", "media_player.attic"]),
    ).toEqual(["media_player.attic"]);
  });

  it("ignores a hidden player that is not on the card anyway", () => {
    expect(
      visiblePlayers(discovered, undefined, ["media_player.shed"]),
    ).toEqual(discovered);
  });
});

describe("allowedTargets", () => {
  const selected = ["media_player.attic", "media_player.kitchen"];

  it("keeps the whole selection when no filter is configured", () => {
    expect(allowedTargets(selected)).toEqual(selected);
  });

  it("drops a preselected target that the hide list removed", () => {
    expect(allowedTargets(selected, undefined, ["media_player.attic"])).toEqual(
      ["media_player.kitchen"],
    );
  });

  it("drops a preselected target that the show list leaves out", () => {
    expect(allowedTargets(selected, ["media_player.kitchen"])).toEqual([
      "media_player.kitchen",
    ]);
  });

  it("keeps the selection's own order", () => {
    expect(
      allowedTargets(["media_player.kitchen", "media_player.attic"], [
        "media_player.attic",
        "media_player.kitchen",
      ]),
    ).toEqual(["media_player.kitchen", "media_player.attic"]);
  });
});

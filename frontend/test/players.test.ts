import { describe, it, expect } from "vitest";
import {
  allowedTargets,
  discoverPlayers,
  speakerName,
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

  it("offers everything discovered when the card names no speakers", () => {
    expect(visiblePlayers(discovered)).toEqual(discovered);
  });

  it("offers exactly the configured list, in its own order", () => {
    expect(
      visiblePlayers(discovered, ["media_player.kitchen", "media_player.attic"]),
    ).toEqual(["media_player.kitchen", "media_player.attic"]);
  });

  it("keeps a configured speaker that discovery missed", () => {
    // An entity that is unavailable, or that under-reports supported_features,
    // still belongs on the card if the user asked for it by name.
    expect(visiblePlayers(discovered, ["media_player.garage"])).toEqual([
      "media_player.garage",
    ]);
  });

  it("offers nothing for an empty list", () => {
    // Absent means every speaker; an emptied list is what the editor saves
    // when the last speaker is removed, and must not mean every speaker.
    expect(visiblePlayers(discovered, [])).toEqual([]);
  });

  it("drops duplicates from the list", () => {
    expect(
      visiblePlayers(discovered, ["media_player.attic", "media_player.attic"]),
    ).toEqual(["media_player.attic"]);
  });
});

describe("allowedTargets", () => {
  const selected = ["media_player.attic", "media_player.kitchen"];

  it("keeps the whole selection when the card offers every speaker", () => {
    expect(allowedTargets(selected)).toEqual(selected);
  });

  it("drops a selected speaker the card does not offer", () => {
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

describe("speakerName", () => {
  /**
   * A hass stub with registries: the area on the entity or on its device, as
   * Home Assistant lets either carry it, the entity's own winning.
   */
  function named(
    friendlyName: string | undefined,
    where: { entityArea?: string; deviceArea?: string } = {},
  ): any {
    return {
      states: {
        "media_player.x": {
          attributes: friendlyName === undefined ? {} : { friendly_name: friendlyName },
        },
      },
      entities: {
        "media_player.x": {
          entity_id: "media_player.x",
          device_id: "dev",
          area_id: where.entityArea ?? null,
        },
      },
      devices: { dev: { id: "dev", area_id: where.deviceArea ?? null } },
      areas: {
        kitchen: { area_id: "kitchen", name: "Kitchen" },
        living: { area_id: "living", name: "Living room" },
        kids: { area_id: "kids", name: "Kids' Room" },
        salon: { area_id: "salon", name: "Salón" },
      },
    };
  }

  it("puts the device's area before a name that leaves it out", () => {
    expect(speakerName(named("Chromecast", { deviceArea: "kitchen" }), "media_player.x")).toBe(
      "Kitchen Chromecast",
    );
  });

  it("prefers the entity's own area over its device's", () => {
    expect(
      speakerName(
        named("Chromecast", { entityArea: "living", deviceArea: "kitchen" }),
        "media_player.x",
      ),
    ).toBe("Living room Chromecast");
  });

  it("leaves a name that already says the area, wherever and however cased", () => {
    for (const name of ["Kitchen", "kitchen speaker", "Nest (Kitchen)", "Upstairs KITCHEN"]) {
      expect(speakerName(named(name, { deviceArea: "kitchen" }), "media_player.x")).toBe(name);
    }
    expect(
      speakerName(named("Kids' Room Nest Mini", { deviceArea: "kids" }), "media_player.x"),
    ).toBe("Kids' Room Nest Mini");
    expect(speakerName(named("Salón Sonos", { deviceArea: "salon" }), "media_player.x")).toBe(
      "Salón Sonos",
    );
  });

  it("matches the area as a whole word, not inside another", () => {
    expect(speakerName(named("Kitchenette", { deviceArea: "kitchen" }), "media_player.x")).toBe(
      "Kitchen Kitchenette",
    );
  });

  it("keeps the friendly name when there is no area", () => {
    expect(speakerName(named("Chromecast"), "media_player.x")).toBe("Chromecast");
  });

  it("keeps the friendly name before the registries have loaded", () => {
    const hass = {
      states: { "media_player.x": { attributes: { friendly_name: "Chromecast" } } },
    };
    expect(speakerName(hass, "media_player.x")).toBe("Chromecast");
  });

  it("falls back to the bare entity id, without an area, when there is no name", () => {
    expect(speakerName(named(undefined, { deviceArea: "kitchen" }), "media_player.x")).toBe(
      "media_player.x",
    );
    expect(speakerName({}, "media_player.gone")).toBe("media_player.gone");
    expect(speakerName(undefined, "media_player.gone")).toBe("media_player.gone");
  });
});

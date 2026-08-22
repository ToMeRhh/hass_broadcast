import { describe, it, expect } from "vitest";

import {
  HassBroadcastCardEditor,
  clampMaxDuration,
  playerOptions,
  selectionSummary,
  toggleInList,
} from "../src/editor";
import { renderedText } from "./helpers";

describe("clampMaxDuration", () => {
  it("returns the value when within valid range", () => {
    expect(clampMaxDuration(60)).toBe(60);
    expect(clampMaxDuration(5)).toBe(5);
    expect(clampMaxDuration(300)).toBe(300);
    expect(clampMaxDuration(150)).toBe(150);
  });

  it("clamps values below the minimum to 5", () => {
    expect(clampMaxDuration(0)).toBe(5);
    expect(clampMaxDuration(1)).toBe(5);
    expect(clampMaxDuration(-10)).toBe(5);
  });

  it("clamps values above the maximum to 300", () => {
    expect(clampMaxDuration(301)).toBe(300);
    expect(clampMaxDuration(1000)).toBe(300);
  });

  it("defaults to 60 when given empty string or NaN", () => {
    expect(clampMaxDuration("")).toBe(60);
    expect(clampMaxDuration(NaN)).toBe(60);
    expect(clampMaxDuration(null)).toBe(60);
    expect(clampMaxDuration(undefined)).toBe(60);
  });

  it("parses numeric strings correctly", () => {
    expect(clampMaxDuration("30")).toBe(30);
    expect(clampMaxDuration("300")).toBe(300);
    expect(clampMaxDuration("0")).toBe(5);
  });
});

describe("toggleInList", () => {
  it("starts a list when the first box is checked", () => {
    expect(toggleInList(undefined, "media_player.attic", true)).toEqual([
      "media_player.attic",
    ]);
  });

  it("appends in the order the boxes were checked", () => {
    expect(
      toggleInList(["media_player.attic"], "media_player.kitchen", true),
    ).toEqual(["media_player.attic", "media_player.kitchen"]);
  });

  it("does not add an entity that is already on the list", () => {
    expect(
      toggleInList(["media_player.attic"], "media_player.attic", true),
    ).toEqual(["media_player.attic"]);
  });

  it("removes an entity when its box is unchecked", () => {
    expect(
      toggleInList(
        ["media_player.attic", "media_player.kitchen"],
        "media_player.attic",
        false,
      ),
    ).toEqual(["media_player.kitchen"]);
  });

  it("drops the key entirely once the last entity is unchecked", () => {
    // Undefined rather than [], so the card falls back to "show everything"
    // instead of storing an empty list that means the same thing.
    expect(
      toggleInList(["media_player.attic"], "media_player.attic", false),
    ).toBeUndefined();
  });
});

describe("selectionSummary", () => {
  const options = [
    { entityId: "media_player.attic", name: "Attic", available: true },
    { entityId: "media_player.kitchen", name: "Kitchen", available: true },
    { entityId: "media_player.bedroom", name: "Bedroom", available: true },
    { entityId: "media_player.shed", name: "Shed", available: true },
  ];

  it("uses the given wording when nothing is picked", () => {
    expect(selectionSummary(undefined, options, "every player")).toBe(
      "every player",
    );
    expect(selectionSummary([], options, "none")).toBe("none");
  });

  it("names the picked speakers", () => {
    expect(
      selectionSummary(
        ["media_player.attic", "media_player.kitchen"],
        options,
        "none",
      ),
    ).toBe("Attic, Kitchen");
  });

  it("counts the rest once the line would get long", () => {
    expect(
      selectionSummary(
        options.map((option) => option.entityId),
        options,
        "none",
      ),
    ).toBe("Attic, Kitchen, Bedroom +1 more");
  });

  it("falls back to the entity id for a speaker it cannot name", () => {
    expect(selectionSummary(["media_player.gone"], options, "none")).toBe(
      "media_player.gone",
    );
  });
});

describe("playerOptions", () => {
  const hass = {
    states: {
      "media_player.attic": {
        attributes: { supported_features: 512, friendly_name: "Attic" },
      },
      "media_player.tv": {
        attributes: { supported_features: 4, friendly_name: "TV" },
      },
    },
  };

  it("offers each playable speaker under its friendly name", () => {
    expect(playerOptions(hass, {})).toEqual([
      { entityId: "media_player.attic", name: "Attic", available: true },
    ]);
  });

  it("falls back to the entity id when there is no friendly name", () => {
    const nameless = {
      states: { "media_player.attic": { attributes: { supported_features: 512 } } },
    };

    expect(playerOptions(nameless, {})[0].name).toBe("media_player.attic");
  });

  it("keeps offering a configured speaker that discovery no longer finds", () => {
    // A renamed or removed entity must stay visible and uncheckable rather
    // than vanishing from the editor while staying in the saved config.
    const options = playerOptions(hass, {
      hide_players: ["media_player.gone"],
    });

    expect(options).toContainEqual({
      entityId: "media_player.gone",
      name: "media_player.gone",
      available: false,
    });
  });

  it("does not list a configured speaker twice", () => {
    const options = playerOptions(hass, {
      show_players: ["media_player.attic"],
      hide_players: ["media_player.attic"],
    });

    expect(options).toHaveLength(1);
  });

  it("offers nothing when hass has not arrived yet", () => {
    expect(playerOptions(undefined, {})).toEqual([]);
  });
});

describe("editor rendering", () => {
  function newEditor(hass?: any): any {
    const editor: any = new HassBroadcastCardEditor();
    editor.createRenderRoot = () => editor;
    editor.performUpdate = () => {};
    editor.setConfig({ type: "custom:hass-broadcast-card" });
    editor.hass = hass;
    return editor;
  }

  const hass = {
    states: {
      "media_player.attic": {
        attributes: { supported_features: 512, friendly_name: "Attic" },
      },
    },
  };

  it("lists the discovered speakers under both sections", () => {
    const text = renderedText(newEditor(hass).render());

    expect(text).toContain("Players to show");
    expect(text).toContain("Players to hide");
    expect(text.match(/Attic/g)).toHaveLength(2);
  });

  it("collapses each list into a summary of what is picked", () => {
    const editor = newEditor(hass);
    editor.setConfig({
      type: "custom:hass-broadcast-card",
      show_players: ["media_player.attic"],
    });
    const text = renderedText(editor.render());

    // Closed by default: a <details> with no open attribute.
    expect(text).toContain("<details");
    expect(text).not.toContain("<details open");
    expect(text).toContain("Players to show — Attic");
    expect(text).toContain("Players to hide — none");
  });

  it("says the card shows everything while the show list is empty", () => {
    const text = renderedText(newEditor(hass).render());

    expect(text).toContain("Players to show — every player");
  });

  it("says so when there are no speakers to pick from", () => {
    const text = renderedText(newEditor({ states: {} }).render());

    expect(text).toMatch(/No media players found/);
  });

  it("marks a configured speaker that is no longer available", () => {
    const editor = newEditor(hass);
    editor.setConfig({
      type: "custom:hass-broadcast-card",
      show_players: ["media_player.gone"],
    });

    expect(renderedText(editor.render())).toMatch(/not available/);
  });
});

describe("editor record mode", () => {
  /**
   * An editor whose emitted configs are captured. Overriding dispatchEvent
   * rather than listening keeps this independent of what event plumbing
   * Lit's SSR DOM shim happens to provide outside a browser.
   */
  function newEditor(config: any = { type: "custom:hass-broadcast-card" }): {
    editor: any;
    configs: any[];
  } {
    const editor: any = new HassBroadcastCardEditor();
    editor.createRenderRoot = () => editor;
    editor.performUpdate = () => {};
    editor.setConfig(config);
    const configs: any[] = [];
    editor.dispatchEvent = (event: any) => configs.push(event.detail.config);
    return { editor, configs };
  }

  it("writes record_mode when a mode is picked", () => {
    const { editor, configs } = newEditor();

    editor.setRecordMode("start_stop");

    expect(configs[configs.length - 1].record_mode).toBe("start_stop");
  });

  it("shows push-to-talk as the current mode when the key is absent", () => {
    const { editor } = newEditor();

    expect(renderedText(editor.render())).toContain("Push to talk");
    expect(editor.currentRecordMode).toBe("push_to_talk");
  });
});

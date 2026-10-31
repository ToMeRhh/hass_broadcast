import { describe, expect, it } from "vitest";

import { clampMaxDuration, resolveConfig, resolveTileConfig } from "../src/config";

describe("resolveConfig defaults", () => {
  it("fills in every key a bare card leaves out", () => {
    expect(resolveConfig({ type: "custom:hass-broadcast-card" })).toEqual({
      title: "Voice Broadcast",
      layout: "full",
      speakerPicker: "dropdown",
      recentMessages: "button",
      volumeControl: true,
      speakers: undefined,
      selected: [],
      recordMode: "push_to_talk",
      maxDuration: 60,
      noiseSuppression: false,
      keepMessages: true,
      mode: "plain",
    });
  });

  it("keeps what is configured", () => {
    expect(
      resolveConfig({
        type: "custom:hass-broadcast-card",
        title: "Kitchen",
        layout: "full",
        speaker_picker: "list",
        recent_messages: "list",
        volume_control: false,
        speakers: ["media_player.a", "media_player.b"],
        selected: ["media_player.b"],
        record_mode: "start_stop",
        max_duration: 120,
        noise_suppression: true,
        keep_messages: false,
        mode: "restore",
      }),
    ).toEqual({
      title: "Kitchen",
      layout: "full",
      speakerPicker: "list",
      recentMessages: "list",
      volumeControl: false,
      speakers: ["media_player.a", "media_player.b"],
      selected: ["media_player.b"],
      recordMode: "start_stop",
      maxDuration: 120,
      noiseSuppression: true,
      keepMessages: false,
      mode: "restore",
    });
  });

  it("falls back to the default for values it does not know", () => {
    const resolved = resolveConfig({
      type: "x",
      layout: "nonsense",
      speaker_picker: "pill",
      recent_messages: "icon",
      record_mode: "hold",
      mode: "loud",
    } as any);

    expect(resolved.layout).toBe("full");
    expect(resolved.speakerPicker).toBe("dropdown");
    expect(resolved.recentMessages).toBe("button");
    expect(resolved.recordMode).toBe("push_to_talk");
    expect(resolved.mode).toBe("plain");
  });

  it("uses the default title for a blank one", () => {
    expect(resolveConfig({ type: "x", title: "   " }).title).toBe("Voice Broadcast");
  });
});

describe("resolveConfig speakers", () => {
  it("tells an absent list (every speaker) from an empty one (none)", () => {
    expect(resolveConfig({ type: "x" }).speakers).toBeUndefined();
    expect(resolveConfig({ type: "x", speakers: [] }).speakers).toEqual([]);
  });

  it("drops duplicates, keeping the first", () => {
    expect(
      resolveConfig({ type: "x", speakers: ["media_player.a", "media_player.b", "media_player.a"] })
        .speakers,
    ).toEqual(["media_player.a", "media_player.b"]);
  });

  it("keeps only selected speakers the card offers", () => {
    expect(
      resolveConfig({
        type: "x",
        speakers: ["media_player.a"],
        selected: ["media_player.b", "media_player.a"],
      }).selected,
    ).toEqual(["media_player.a"]);
  });

  it("keeps every selected speaker when the card offers every speaker", () => {
    expect(resolveConfig({ type: "x", selected: ["media_player.b"] }).selected).toEqual([
      "media_player.b",
    ]);
  });
});

describe("resolveConfig in compact", () => {
  it("always uses the dropdown, but keeps the other choices", () => {
    const resolved = resolveConfig({
      type: "x",
      layout: "compact",
      speaker_picker: "list",
      recent_messages: "list",
    });

    expect(resolved.speakerPicker).toBe("dropdown");
    expect(resolved.recentMessages).toBe("list");
  });
});

describe("resolveTileConfig", () => {
  it("fills in every key a bare tile leaves out", () => {
    expect(resolveTileConfig({ type: "custom:hass-broadcast-tile" })).toEqual({
      name: "Voice Broadcast",
      speakers: [],
      shape: "square",
      maxDuration: 60,
      noiseSuppression: false,
      keepMessages: true,
      mode: "plain",
    });
  });

  it("keeps what is configured", () => {
    expect(
      resolveTileConfig({
        type: "custom:hass-broadcast-tile",
        name: "Kids",
        speakers: ["media_player.a"],
        shape: "horizontal",
        max_duration: 30,
        noise_suppression: true,
        keep_messages: false,
        mode: "chime",
      }),
    ).toEqual({
      name: "Kids",
      speakers: ["media_player.a"],
      shape: "horizontal",
      maxDuration: 30,
      noiseSuppression: true,
      keepMessages: false,
      mode: "chime",
    });
  });

  it("treats a blank name as no name", () => {
    expect(resolveTileConfig({ type: "x", name: "  " }).name).toBe("Voice Broadcast");
  });

  it("sends to each speaker once", () => {
    expect(
      resolveTileConfig({ type: "x", speakers: ["media_player.a", "media_player.a"] }).speakers,
    ).toEqual(["media_player.a"]);
  });
});

describe("clampMaxDuration", () => {
  it.each([
    [undefined, 60],
    ["", 60],
    ["abc", 60],
    [1, 5],
    [42, 42],
    [999, 300],
  ])("clamps %s to %s", (value, expected) => {
    expect(clampMaxDuration(value)).toBe(expected);
  });
});

describe.each([
  ["card", (c: object) => resolveConfig({ type: "custom:hass-broadcast-card", ...c })],
  ["tile", (c: object) => resolveTileConfig({ type: "custom:hass-broadcast-tile", ...c })],
])("keep_messages on the %s", (_, resolve) => {
  it("keeps unless it is explicitly false", () => {
    expect(resolve({}).keepMessages).toBe(true);
    expect(resolve({ keep_messages: true }).keepMessages).toBe(true);
    expect(resolve({ keep_messages: false }).keepMessages).toBe(false);
  });
});

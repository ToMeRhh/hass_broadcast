import { afterEach, describe, expect, it, vi } from "vitest";

import { outcomeStatus, sendClip } from "../src/sending";

const hass = (failed: string[], calls: any[] = []) => ({
  auth: { data: { access_token: "tok" } },
  states: {
    "media_player.garage": { attributes: { friendly_name: "Garage" } },
    "media_player.kitchen": { attributes: { friendly_name: "Kitchen" } },
  },
  connection: {
    sendMessagePromise: async (message: any) => {
      calls.push(message);
      return { failed };
    },
  },
});

const fresh = () => ({
  source: { kind: "fresh" as const, blob: new Blob(["x"]) },
  url: "blob:x",
  duration: 2,
  peaks: [],
});

describe("sendClip", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uploads a fresh clip, reports its id, then sends that id", async () => {
    vi.stubGlobal("fetch", async () => ({
      ok: true,
      json: async () => ({ message_id: "abc" }),
    }));
    const calls: any[] = [];
    const stored: string[] = [];

    const outcome = await sendClip({
      hass: hass([], calls),
      clip: fresh(),
      targets: ["media_player.kitchen"],
      mode: "plain",
      onStored: (id) => stored.push(id),
    });

    expect(stored).toEqual(["abc"]);
    expect(calls[0].message_id).toBe("abc");
    expect(outcome).toEqual({ kind: "sent", targets: ["media_player.kitchen"] });
  });

  it("sends a stored clip without uploading", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const calls: any[] = [];

    await sendClip({
      hass: hass([], calls),
      clip: { ...fresh(), source: { kind: "stored", id: "old" } },
      targets: ["media_player.kitchen"],
      mode: "chime",
      volume: 0.5,
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(calls[0]).toMatchObject({ message_id: "old", mode: "chime", volume: 0.5 });
  });

  it("tells a partial failure from a total one", async () => {
    const clip = { ...fresh(), source: { kind: "stored" as const, id: "x" } };
    const targets = ["media_player.kitchen", "media_player.garage"];

    expect(
      await sendClip({ hass: hass(["media_player.garage"]), clip, targets, mode: "plain" }),
    ).toEqual({ kind: "partial", failed: ["media_player.garage"] });
    expect(await sendClip({ hass: hass(targets), clip, targets, mode: "plain" })).toEqual({
      kind: "failed",
      failed: targets,
    });
  });
});

describe("outcomeStatus", () => {
  it("names speakers by their friendly names", () => {
    const h = hass([]);
    expect(outcomeStatus(h, { kind: "sent", targets: ["media_player.kitchen"] })).toEqual({
      kind: "info",
      text: "Sent to Kitchen",
    });
    expect(outcomeStatus(h, { kind: "partial", failed: ["media_player.garage"] }).text).toBe(
      "Played, but not on Garage.",
    );
    expect(outcomeStatus(h, { kind: "failed", failed: ["media_player.x"] }).text).toMatch(
      /Could not play on any speaker: media_player.x/,
    );
  });
});

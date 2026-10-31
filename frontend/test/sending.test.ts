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
    const stored: any[] = [];

    const outcome = await sendClip({
      hass: hass([], calls),
      clip: fresh(),
      targets: ["media_player.kitchen"],
      mode: "plain",
      keep: true,
      onStored: (source) => stored.push(source),
    });

    expect(stored).toEqual([{ kind: "stored", id: "abc" }]);
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
      keep: true,
      volume: 0.5,
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(calls[0]).toMatchObject({ message_id: "old", mode: "chime", volume: 0.5 });
  });

  it("tells a partial failure from a total one", async () => {
    const clip = { ...fresh(), source: { kind: "stored" as const, id: "x" } };
    const targets = ["media_player.kitchen", "media_player.garage"];

    expect(
      await sendClip({ hass: hass(["media_player.garage"]), clip, targets, mode: "plain", keep: true }),
    ).toEqual({ kind: "partial", failed: ["media_player.garage"] });
    expect(await sendClip({ hass: hass(targets), clip, targets, mode: "plain", keep: true })).toEqual({
      kind: "failed",
      failed: targets,
    });
  });

  describe("when not keeping", () => {
    const uploadBodies: FormData[] = [];
    const stubUpload = (ids: string[]) => {
      uploadBodies.length = 0;
      vi.stubGlobal("fetch", async (_url: string, init: any) => {
        uploadBodies.push(init.body);
        return { ok: true, json: async () => ({ message_id: ids.shift() }) };
      });
    };

    it("uploads temporarily and reports the temporary source", async () => {
      stubUpload(["abc"]);
      const clip = fresh();
      const reported: any[] = [];

      await sendClip({
        hass: hass([]),
        clip,
        targets: ["media_player.kitchen"],
        mode: "plain",
        keep: false,
        onStored: (source) => reported.push(source),
      });

      expect(uploadBodies[0].get("temporary")).toBe("1");
      expect(reported).toEqual([
        { kind: "temporary", id: "abc", blob: (clip.source as any).blob },
      ]);
    });

    it("does not mark an upload temporary when keeping", async () => {
      stubUpload(["abc"]);
      await sendClip({
        hass: hass([]),
        clip: fresh(),
        targets: ["media_player.kitchen"],
        mode: "plain",
        keep: true,
      });
      expect(uploadBodies[0].get("temporary")).toBeNull();
    });

    it("re-uploads a temporary clip the server has forgotten, once", async () => {
      stubUpload(["new"]);
      const blob = new Blob(["x"]);
      const calls: any[] = [];
      const reported: any[] = [];
      const h = hass([], calls);
      let first = true;
      h.connection.sendMessagePromise = async (message: any) => {
        calls.push(message);
        if (first) {
          first = false;
          throw { code: "not_found" };
        }
        return { failed: [] };
      };

      const outcome = await sendClip({
        hass: h,
        clip: { ...fresh(), source: { kind: "temporary", id: "old", blob } },
        targets: ["media_player.kitchen"],
        mode: "plain",
        keep: false,
        onStored: (source) => reported.push(source),
      });

      expect(uploadBodies).toHaveLength(1);
      expect(uploadBodies[0].get("temporary")).toBe("1");
      expect(reported).toEqual([{ kind: "temporary", id: "new", blob }]);
      expect(calls.map((c) => c.message_id)).toEqual(["old", "new"]);
      expect(outcome).toEqual({ kind: "sent", targets: ["media_player.kitchen"] });
    });

    it("still rejects when a stored clip is not found", async () => {
      stubUpload([]);
      const h = hass([]);
      h.connection.sendMessagePromise = async () => {
        throw { code: "not_found" };
      };
      await expect(
        sendClip({
          hass: h,
          clip: { ...fresh(), source: { kind: "stored", id: "gone" } },
          targets: ["media_player.kitchen"],
          mode: "plain",
          keep: false,
        }),
      ).rejects.toEqual({ code: "not_found" });
      expect(uploadBodies).toHaveLength(0);
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

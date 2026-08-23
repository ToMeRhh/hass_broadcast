import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BAR_COUNT } from "../src/levels";
import {
  Clip,
  freshClip,
  loadStoredClip,
  revokeClip,
  storedId,
} from "../src/clip";

const message = {
  id: "abc123",
  created: "2026-08-22T10:00:00Z",
  duration: 4,
  can_delete: true,
  extension: "mp3",
};

const hass = { auth: { data: { access_token: "tok" } } };

describe("freshClip", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", { createObjectURL: () => "blob:fresh", revokeObjectURL: () => {} });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("carries its own audio, so broadcasting it has to upload first", () => {
    const blob = new Blob(["x"]);
    const clip = freshClip(blob, 3, [0.2, 0.8]);

    expect(clip.source).toEqual({ kind: "fresh", blob });
    expect(clip.duration).toBe(3);
    expect(clip.url).toBe("blob:fresh");
    expect(storedId(clip)).toBeUndefined();
    // Peaks are fitted to the strip and scaled up, so a quiet take still draws.
    expect(clip.peaks).toHaveLength(BAR_COUNT);
    expect(Math.max(...clip.peaks)).toBe(1);
  });
});

describe("storedId", () => {
  it("names the id a stored clip broadcasts directly", () => {
    const clip: Clip = {
      source: { kind: "stored", id: "abc123" },
      url: "blob:x",
      duration: 4,
      peaks: [],
    };
    expect(storedId(clip)).toBe("abc123");
  });
});

describe("loadStoredClip", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", { createObjectURL: () => "blob:stored", revokeObjectURL: () => {} });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("fetches the recording with the bearer token and keeps its id", async () => {
    const calls: any[] = [];
    vi.stubGlobal("fetch", async (url: string, init: any) => {
      calls.push([url, init]);
      return { ok: true, blob: async () => new Blob(["audio"]) };
    });

    const clip = await loadStoredClip(hass, message, async () => [0.5, 1]);

    // The media view is requires_auth, so a bare <audio src> would 401.
    expect(calls[0][0]).toBe("/api/hass_broadcast/media/abc123.mp3");
    expect(calls[0][1].headers.Authorization).toBe("Bearer tok");
    expect(clip.source).toEqual({ kind: "stored", id: "abc123" });
    expect(clip.duration).toBe(4);
    expect(clip.url).toBe("blob:stored");
    expect(clip.peaks).toEqual([0.5, 1]);
  });

  it("throws a message worth showing when the fetch fails", async () => {
    vi.stubGlobal("fetch", async () => ({ ok: false, status: 404 }));

    await expect(loadStoredClip(hass, message, async () => [])).rejects.toThrow(
      /404/,
    );
  });

  it("still loads a playable clip when the audio cannot be decoded", async () => {
    vi.stubGlobal("fetch", async () => ({
      ok: true,
      blob: async () => new Blob(["audio"]),
    }));

    const clip = await loadStoredClip(hass, message, async () => {
      throw new Error("unsupported codec");
    });

    // No waveform, but playback and seeking still work — losing the drawing
    // must not lose the message.
    expect(clip.peaks).toEqual([]);
    expect(clip.url).toBe("blob:stored");
  });
});

describe("revokeClip", () => {
  it("releases the object URL, and tolerates having nothing to release", () => {
    const revoked: string[] = [];
    vi.stubGlobal("URL", {
      createObjectURL: () => "blob:x",
      revokeObjectURL: (url: string) => revoked.push(url),
    });

    revokeClip(undefined);
    revokeClip({ source: { kind: "stored", id: "a" }, url: "blob:x", duration: 1, peaks: [] });

    expect(revoked).toEqual(["blob:x"]);
    vi.unstubAllGlobals();
  });
});

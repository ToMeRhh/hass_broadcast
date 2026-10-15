import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LOVELACE_ASSIGNS, renderedText } from "./helpers";

// Same Node-only setup as card.test.ts: the module registers itself on
// `window`, and nothing here needs a real DOM.
(globalThis as any).window = globalThis;

const { HassBroadcastTile, RESULT_MS } = await import("../src/tile");

class FakeRecorder {
  started = 0;
  stopped = 0;
  stopImpl: () => Promise<{ blob: Blob; duration: number }> = async () => ({
    blob: new Blob(["x"]),
    duration: 2,
  });
  onLevel(): void {}
  async start(): Promise<void> {
    this.started += 1;
  }
  async stop(): Promise<{ blob: Blob; duration: number }> {
    this.stopped += 1;
    return this.stopImpl();
  }
}

const press = { preventDefault: () => {} } as any;

function makeTile(config: any = {}, failed: string[] = []) {
  (globalThis as any).isSecureContext = true;
  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: async () => ({}) } });
  vi.stubGlobal("AudioWorkletNode", class {});
  const uploads: any[] = [];
  vi.stubGlobal("fetch", async () => {
    uploads.push(1);
    return { ok: true, json: async () => ({ message_id: "abc" }) };
  });
  const tile: any = new HassBroadcastTile();
  tile.createRenderRoot = () => tile;
  tile.performUpdate = () => {};
  tile.setConfig({
    type: "custom:hass-broadcast-tile",
    name: "Kids",
    speakers: ["media_player.kids", "media_player.garage"],
    ...config,
  });
  const calls: any[] = [];
  tile.hass = {
    auth: { data: { access_token: "tok" } },
    states: {
      "media_player.garage": { attributes: { friendly_name: "Garage" } },
    },
    connection: {
      sendMessagePromise: async (message: any) => {
        calls.push(message);
        return { failed };
      },
    },
  };
  const recorder = new FakeRecorder();
  tile.rec.recorder = recorder;
  tile.connectedCallback();
  return { tile, recorder, calls, uploads };
}

describe("broadcast tile", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    (globalThis as any).isSecureContext = undefined;
  });

  it("sends to its speakers the moment the button is released", async () => {
    const { tile, calls, uploads } = makeTile({ mode: "chime" });

    await tile.rec.onPressStart(press);
    expect(tile.rec.phase).toBe("recording");
    await tile.rec.onPressEnd();

    expect(uploads).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      type: "hass_broadcast/send",
      message_id: "abc",
      targets: ["media_player.kids", "media_player.garage"],
      mode: "chime",
    });
    expect(tile.result.kind).toBe("sent");
    expect(tile.rec.phase).toBe("idle");
  });

  it("goes back to ready once the result has been shown", async () => {
    const { tile } = makeTile();
    await tile.rec.onPressStart(press);
    await tile.rec.onPressEnd();

    vi.advanceTimersByTime(RESULT_MS);

    expect(tile.result).toBeUndefined();
  });

  it("names the speakers that missed a partly sent message", async () => {
    const { tile } = makeTile({}, ["media_player.garage"]);
    await tile.rec.onPressStart(press);
    await tile.rec.onPressEnd();

    expect(tile.result).toMatchObject({ kind: "partial", text: "Not on Garage" });
    expect(tile.result.detail).toMatch(/Played, but not on Garage/);
  });

  it("says so when the upload fails, and is ready again afterwards", async () => {
    const { tile } = makeTile();
    vi.stubGlobal("fetch", async () => ({ ok: false, status: 500 }));

    await tile.rec.onPressStart(press);
    await tile.rec.onPressEnd();

    expect(tile.result).toMatchObject({ kind: "failed", text: "Not sent" });
    expect(tile.result.detail).toMatch(/500/);
    expect(tile.rec.phase).toBe("idle");
  });

  it("does not send a tap", async () => {
    const { tile, recorder, calls } = makeTile();
    recorder.stopImpl = async () => ({ blob: new Blob(["x"]), duration: 0.2 });

    await tile.rec.onPressStart(press);
    await tile.rec.onPressEnd();

    expect(calls).toHaveLength(0);
    expect(tile.result.text).toMatch(/Hold/);
  });

  it("is disabled, and says why, with no speakers chosen", async () => {
    const { tile, calls } = makeTile({ speakers: [] });

    const text = renderedText(tile.render());
    expect(text).toContain("Pick speakers in the card editor");
    expect(text).toMatch(/class="mic"\s*\?disabled=true/);

    // Even if a take reaches it, nothing is sent anywhere.
    await tile.send({ blob: new Blob(["x"]), duration: 2, peaks: [] });
    expect(calls).toHaveLength(0);
  });

  it("is always push-to-talk, whatever the config says", () => {
    const { tile } = makeTile({ record_mode: "start_stop" });

    expect(renderedText(tile.render())).toContain("data-mode=push_to_talk");
  });

  it("sizes itself by shape", () => {
    const { tile } = makeTile();
    expect(tile.getGridOptions()).toMatchObject({ rows: 2, columns: 3 });
    expect(tile.getCardSize()).toBe(3);

    tile.setConfig({ type: "custom:hass-broadcast-tile", shape: "horizontal" });
    expect(tile.getGridOptions()).toMatchObject({ rows: 1, columns: 6, max_rows: 1 });
    expect(tile.getCardSize()).toBe(1);
  });

  it("accepts every property Lovelace assigns to the cards it hosts", () => {
    const { tile } = makeTile({ shape: "horizontal" });
    expect(() => Object.assign(tile, LOVELACE_ASSIGNS)).not.toThrow();
    expect(tile.getCardSize()).toBe(1);
  });

  it("starts out aimed at the first speaker found", () => {
    const stub = HassBroadcastTile.getStubConfig({
      states: {
        "media_player.b": { attributes: { supported_features: 512 } },
        "media_player.a": { attributes: { supported_features: 512 } },
      },
    });
    expect(stub.speakers).toEqual(["media_player.a"]);
    expect(HassBroadcastTile.getStubConfig(undefined).speakers).toEqual([]);
  });
});

describe("broadcast tile editor", () => {
  it("is Home Assistant's own form, not an element of ours", () => {
    expect(HassBroadcastTile.getConfigForm().schema.length).toBeGreaterThan(0);
    expect((HassBroadcastTile as any).getConfigElement).toBeUndefined();
  });
});

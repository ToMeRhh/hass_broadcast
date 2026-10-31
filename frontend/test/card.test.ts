import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LOVELACE_ASSIGNS, renderedText } from "./helpers";

// The default vitest environment is plain Node, and that is enough: Lit ships
// @lit-labs/ssr-dom-shim, so a @customElement-decorated component constructs
// and runs its lifecycle callbacks without a DOM. The only things card.ts touches that Node lacks are the
// module-scope `window` (the customCards registration) and the object-URL
// helpers, so stub those the same hand-rolled way recorder.test.ts stubs Web
// Audio, then import the module. No jsdom, no config changes.
(globalThis as any).window = globalThis;
(globalThis as any).URL.createObjectURL = () => "blob:preview";
(globalThis as any).URL.revokeObjectURL = () => {};

const { HassBroadcastCard } = await import("../src/card");
const { INSECURE_CONTEXT_MESSAGE } = await import("../src/errors");
const { STATUS_MS } = await import("../src/card");

/** Minimal stand-in for Recorder, injected over the card's own instance. */
class FakeRecorder {
  started = 0;
  stopped = 0;
  levelCallback?: (level: number) => void;
  startImpl: () => Promise<void> = async () => {};
  stopImpl: () => Promise<{ blob: Blob; duration: number; peaks: number[] }> = async () => ({
    blob: new Blob([new Uint8Array([1, 2, 3])]),
    duration: 2,
    peaks: [],
  });

  onLevel(callback: (level: number) => void): void {
    this.levelCallback = callback;
  }
  async start(): Promise<void> {
    this.started += 1;
    return this.startImpl();
  }
  async stop(): Promise<{ blob: Blob; duration: number; peaks: number[] }> {
    this.stopped += 1;
    return this.stopImpl();
  }
}

/**
 * Make Recorder.isSupported() true. It checks window.isSecureContext,
 * navigator.mediaDevices.getUserMedia and AudioWorkletNode — none of which
 * exist in Node, which is exactly the insecure-context branch by default.
 */
function makeSupported(): void {
  (globalThis as any).isSecureContext = true;
  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: async () => ({}) } });
  vi.stubGlobal("AudioWorkletNode", class {});
}

/**
 * Build a card with Lit's rendering machinery kept out of the way: there is
 * no DOM to render into here. `createRenderRoot -> this` skips adoptStyles
 * (which wants document.createElement), and a no-op performUpdate stops the
 * update scheduled by connectedCallback from reaching lit-html. Neither
 * touches the state machine — render() is a pure function of state and is
 * still exercised directly further down.
 */
function newCard(): any {
  const card: any = new HassBroadcastCard();
  card.createRenderRoot = () => card;
  card.performUpdate = () => {};
  return card;
}

function makeCard(supported = true): { card: any; recorder: FakeRecorder } {
  if (supported) {
    makeSupported();
  }
  const card = newCard();
  const recorder = new FakeRecorder();
  card.rec.recorder = recorder;
  card.connectedCallback();
  return { card, recorder };
}

describe("card state machine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (globalThis as any).isSecureContext = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    (globalThis as any).isSecureContext = undefined;
  });

  it("goes idle -> recording -> loaded -> idle", async () => {
    const { card, recorder } = makeCard();
    expect(card.rec.phase).toBe("idle");

    await card.rec.startRecording();
    expect(card.rec.phase).toBe("recording");
    expect(recorder.started).toBe(1);
    expect(card.status).toBeUndefined();

    await card.rec.stopRecording();
    expect(card.rec.phase).toBe("idle");
    expect(card.clip.source.kind).toBe("fresh");
    expect(card.clip.duration).toBe(2);
    expect(card.clip.url).toBe("blob:preview");

    card.clearClip();
    expect(card.clip).toBeUndefined();
  });

  it("counts elapsed seconds and auto-stops at the configured maximum", async () => {
    const { card } = makeCard();
    card.setConfig({ type: "custom:hass-broadcast-card", max_duration: 5 });

    await card.rec.startRecording();
    expect(card.rec.phase).toBe("recording");

    await vi.advanceTimersByTimeAsync(5000);
    await Promise.resolve();
    expect(card.rec.elapsed).toBe(5);
    expect(card.rec.phase).toBe("idle");
    expect(card.clip).toBeDefined();
  });

  it("names the HTTPS requirement when the context is insecure", () => {
    // No makeSupported(): plain Node has no secure context and no
    // mediaDevices, which is the same shape as http:// to a LAN address.
    const card = newCard();
    card.connectedCallback();

    expect(card.status.text).toBe(INSECURE_CONTEXT_MESSAGE);
    expect(card.status.text).toMatch(/HTTPS/);
    expect(card.rec.phase).toBe("idle");
  });

  it("shows the permission message when the microphone is denied", async () => {
    const { card, recorder } = makeCard();
    recorder.startImpl = async () => {
      throw Object.assign(new Error("Permission denied"), {
        name: "NotAllowedError",
      });
    };

    await card.rec.startRecording();

    expect(card.status.text).toMatch(/Microphone permission was denied/);
    expect(card.rec.phase).toBe("idle");
    expect(card.rec.timer).toBeUndefined();
  });

  it("resets to idle instead of stranding the UI when stop() fails", async () => {
    const { card, recorder } = makeCard();
    await card.rec.startRecording();
    recorder.stopImpl = async () => {
      throw new Error("device vanished");
    };

    await card.rec.stopRecording();

    expect(card.rec.phase).toBe("idle");
    expect(card.status.text).toMatch(/Could not finish recording/);
  });

  it("releases the microphone when torn down while start() is in flight", async () => {
    const { card, recorder } = makeCard();
    let releaseStart: () => void = () => {};
    recorder.startImpl = () =>
      new Promise<void>((resolve) => {
        releaseStart = resolve;
      });

    const pending = card.rec.startRecording();
    // Navigate away mid-start: the phase is still "idle" here, which is
    // precisely why disconnectedCallback's own teardown does not fire.
    card.disconnectedCallback();
    releaseStart();
    await pending;
    await Promise.resolve();

    // No transition, no interval, and the session was actually released.
    expect(card.rec.phase).toBe("idle");
    expect(card.rec.timer).toBeUndefined();
    expect(recorder.stopped).toBe(1);
  });

  it("stops the recorder when torn down while already recording", async () => {
    const { card, recorder } = makeCard();
    await card.rec.startRecording();

    card.disconnectedCallback();
    await Promise.resolve();

    expect(card.rec.phase).toBe("idle");
    expect(card.rec.timer).toBeUndefined();
    expect(recorder.stopped).toBe(1);
  });
});

describe("card broadcasting", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /** A card holding a fresh recording, ready to send to two speakers. */
  function cardWithClip(response: any): { card: any; calls: any[]; uploads: number } {
    const calls: any[] = [];
    const counter = { uploads: 0 };
    const card = newCard();
    card.setConfig({ type: "custom:hass-broadcast-card", recent_messages: "off" });
    card.clip = {
      source: { kind: "fresh", blob: new Blob(["x"]) },
      url: "blob:preview",
      duration: 2,
      peaks: [],
    };
    card.selected = ["media_player.kitchen", "media_player.broken"];
    card.hass = {
      auth: { data: { access_token: "tok" } },
      states: {
        "media_player.broken": { attributes: { friendly_name: "Garage" } },
      },
      connection: {
        sendMessagePromise: async (message: any) => {
          calls.push(message);
          return response;
        },
      },
    };
    vi.stubGlobal("fetch", async () => {
      counter.uploads += 1;
      return { ok: true, json: async () => ({ message_id: "abc" }) };
    });
    return { card, calls, get uploads() { return counter.uploads; } } as any;
  }

  it("keeps the clip loaded after every target played", async () => {
    const { card } = cardWithClip({ failed: [] });

    await card.broadcast();

    // Discarding on success would make "send it to the bedroom too" a
    // re-record; the clip stays and Broadcast stays enabled.
    expect(card.rec.phase).toBe("idle");
    expect(card.clip).toBeDefined();
    expect(card.status.kind).toBe("info");
  });

  it("uploads a fresh clip once and reuses the id on retry", async () => {
    const state = cardWithClip({ failed: ["media_player.broken"] });

    await state.card.broadcast();
    expect(state.uploads).toBe(1);
    // The first send stored the returned id on the clip.
    expect(state.card.clip.source).toEqual({ kind: "stored", id: "abc" });

    await state.card.broadcast();
    expect(state.uploads).toBe(1);
    expect(state.calls[1].message_id).toBe("abc");
  });

  it("does not resurrect a clip cleared mid-upload", async () => {
    // Finding 9: tapping ✕ during a long upload runs clearClip(), but the
    // in-flight upload's resolution used to reassign this.clip
    // unconditionally, bringing back a clip that now holds a revoked URL.
    let resolveFetch: (value: any) => void = () => {};
    vi.stubGlobal(
      "fetch",
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );
    const card = newCard();
    card.setConfig({ type: "custom:hass-broadcast-card", selected: ["media_player.kitchen"] });
    card.hass = {
      auth: { data: { access_token: "tok" } },
      connection: { sendMessagePromise: async () => ({ failed: [] }) },
    };
    card.clip = {
      source: { kind: "fresh" as const, blob: new Blob(["x"]) },
      url: "blob:preview",
      duration: 2,
      peaks: [],
    };

    const pending = card.broadcast();
    card.clearClip();
    resolveFetch({ ok: true, json: async () => ({ message_id: "abc" }) });
    await pending;

    expect(card.clip).toBeUndefined();
  });

  it("broadcasts a stored clip without uploading anything", async () => {
    const state = cardWithClip({ failed: [] });
    state.card.clip = {
      source: { kind: "stored", id: "from-history" },
      url: "blob:preview",
      duration: 4,
      peaks: [],
    };

    await state.card.broadcast();

    expect(state.uploads).toBe(0);
    expect(state.calls[0].message_id).toBe("from-history");
  });

  it("warns about the failed targets and keeps the clip on partial failure", async () => {
    const { card } = cardWithClip({ failed: ["media_player.broken"] });

    await card.broadcast();

    // Naming the target matters: "it worked" for a message half the house
    // never heard is the failure mode this exists to prevent.
    expect(card.status.kind).toBe("error");
    expect(card.status.text).toMatch(/Garage/);
    expect(card.rec.phase).toBe("idle");
    expect(card.clip).toBeDefined();
  });

  it("treats a total failure like a send error and keeps the clip", async () => {
    const { card } = cardWithClip({
      failed: ["media_player.kitchen", "media_player.broken"],
    });

    await card.broadcast();

    expect(card.status.text).toMatch(/Could not play on any speaker/);
    expect(card.clip).toBeDefined();
  });

  it("sends no volume by default", async () => {
    const { card, calls } = cardWithClip({ failed: [] });

    await card.broadcast();

    expect(calls[0]).not.toHaveProperty("volume");
  });

  it("sends the chosen volume once the override is turned on", async () => {
    const { card, calls } = cardWithClip({ failed: [] });
    card.volumeOverride = true;
    card.volume = 0.8;

    await card.broadcast();

    expect(calls[0].volume).toBe(0.8);
  });

  it("cannot broadcast with nothing loaded or nobody selected", () => {
    const { card } = cardWithClip({ failed: [] });
    expect(card.canBroadcast).toBe(true);

    card.selected = [];
    expect(card.canBroadcast).toBe(false);

    card.selected = ["media_player.kitchen"];
    card.clip = undefined;
    expect(card.canBroadcast).toBe(false);
  });

  it("cannot broadcast mid-take, and broadcasting mid-take neither sends nor changes phase", async () => {
    // Finding 1: canBroadcast only excluded phase === "sending", so a clip
    // loaded (e.g. from history) plus an in-progress recording left
    // Broadcast live. Tapping it stranded the recorder — every stop path is
    // gated on phase === "recording", and sending flips phase away from it.
    const { card, calls } = cardWithClip({ failed: [] });
    card.rec.phase = "recording";

    expect(card.canBroadcast).toBe(false);

    await card.broadcast();

    expect(calls).toHaveLength(0);
    expect(card.rec.phase).toBe("recording");
  });
});

describe("card loading a message from history", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const stored = {
    id: "abc123",
    created: "2026-08-22T10:00:00Z",
    duration: 4,
    can_delete: true,
    extension: "wav",
  };

  function cardForLoading(): any {
    const card = newCard();
    card.setConfig({ type: "custom:hass-broadcast-card" });
    card.hass = { auth: { data: { access_token: "tok" } }, states: {} };
    return card;
  }

  it("loads it in place of an un-broadcast recording", async () => {
    const revoked: string[] = [];
    vi.stubGlobal("URL", {
      createObjectURL: () => "blob:stored",
      revokeObjectURL: (url: string) => revoked.push(url),
    });
    vi.stubGlobal("fetch", async () => ({
      ok: true,
      blob: async () => new Blob(["audio"]),
    }));
    const card = cardForLoading();
    card.clip = {
      source: { kind: "fresh", blob: new Blob(["x"]) },
      url: "blob:fresh",
      duration: 2,
      peaks: [],
    };

    await card.loadMessage(stored);

    expect(card.clip.source).toEqual({ kind: "stored", id: "abc123" });
    expect(card.clip.duration).toBe(4);
    // The replaced recording's object URL is released, not leaked.
    expect(revoked).toEqual(["blob:fresh"]);
  });

  it("keeps the current clip when loading fails", async () => {
    vi.stubGlobal("URL", { createObjectURL: () => "blob:x", revokeObjectURL: () => {} });
    vi.stubGlobal("fetch", async () => ({ ok: false, status: 404 }));
    const card = cardForLoading();
    const existing = {
      source: { kind: "fresh" as const, blob: new Blob(["x"]) },
      url: "blob:fresh",
      duration: 2,
      peaks: [],
    };
    card.clip = existing;

    await card.loadMessage(stored);

    expect(card.clip).toBe(existing);
    expect(card.status.kind).toBe("error");
    expect(card.status.text).toMatch(/404/);
  });
});

describe("card render reflects phase, not just the clip", () => {
  // Finding 3: render() derived progress/seekable/enabled from `this.clip`
  // alone. Recording a second message while one was loaded left the old
  // clip's transport live: a seekable strip that moved the old clip's
  // position, and an enabled Play/✕ over a clip that was no longer current.
  function cardWithLoadedClip(): any {
    const card = newCard();
    card.setConfig({ type: "custom:hass-broadcast-card", recent_messages: "off" });
    card.clip = {
      source: { kind: "stored", id: "x" },
      url: "blob:x",
      duration: 5,
      peaks: [0.5, 0.5],
    };
    return card;
  }

  it("stops treating the loaded clip as current while a new take records", () => {
    const card = cardWithLoadedClip();
    card.rec.phase = "recording";

    const parts = card.parts;
    const html = renderedText(card.render());

    expect(html).not.toContain("seekable");
    expect(parts.reviewing).toBe(false);
    // The strip shows the timer, not the old clip's waveform.
    expect(parts.view).toBe("recording");
  });

  it("lets go of the record button while the take finishes", () => {
    const card = cardWithLoadedClip();
    card.rec.phase = "finishing";

    const html = renderedText(card.render());

    expect(html).not.toContain("release to stop");
    expect(card.parts.reviewing).toBe(false);
    // The strip holds the stopped timer until the new take replaces it.
    expect(card.parts.view).toBe("recording");
  });

  it("restores the loaded clip's transport once idle again", () => {
    const card = cardWithLoadedClip();
    card.rec.phase = "idle";

    const html = renderedText(card.render());

    expect(html).toContain("seekable");
    expect(card.parts.reviewing).toBe(true);
    expect(card.parts.view).toBe("review");
  });
});

describe("card teardown", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    // makeCard() calls makeSupported(), which sets this directly on
    // globalThis where vi.unstubAllGlobals() cannot reach it. Left set, it
    // leaks into every later test in the file and pushes their render()
    // past isSupported()'s first short-circuit.
    (globalThis as any).isSecureContext = undefined;
  });

  it("clears the loaded clip on disconnect, not just its object URL", () => {
    // Finding 6: dashboard navigation moves the element rather than
    // recreating it, so on re-attach a clip left in place renders an
    // enabled Play/Broadcast over an already-revoked object URL.
    const { card } = makeCard();
    card.clip = {
      source: { kind: "fresh", blob: new Blob(["x"]) },
      url: "blob:x",
      duration: 2,
      peaks: [0.5],
    };

    card.disconnectedCallback();

    expect(card.clip).toBeUndefined();
    expect(card.parts.view).not.toBe("review");
  });
});

describe("card speaker filtering", () => {
  /** Three playable speakers, so show/hide have something to choose from. */
  function cardWithSpeakers(config: any): any {
    const card = newCard();
    card.setConfig({ type: "custom:hass-broadcast-card", ...config });
    card.hass = {
      states: {
        "media_player.attic": {
          attributes: { supported_features: 512, friendly_name: "Attic" },
        },
        "media_player.kitchen": {
          attributes: { supported_features: 512, friendly_name: "Kitchen" },
        },
        "media_player.tv": {
          attributes: { supported_features: 4, friendly_name: "TV" },
        },
      },
    };
    return card;
  }

  it("offers every playable speaker when the card names none", () => {
    const card = cardWithSpeakers({});

    expect(card.players).toEqual([
      "media_player.attic",
      "media_player.kitchen",
    ]);
  });

  it("offers only the speakers the card names", () => {
    const card = cardWithSpeakers({ speakers: ["media_player.kitchen"] });

    expect(card.players).toEqual(["media_player.kitchen"]);
  });

  it("offers nothing when the list was emptied", () => {
    const card = cardWithSpeakers({ speakers: [] });

    expect(card.players).toEqual([]);
  });

  it("does not broadcast to a selected speaker the card does not offer", async () => {
    const calls: any[] = [];
    const card = cardWithSpeakers({
      speakers: ["media_player.kitchen"],
      selected: ["media_player.attic", "media_player.kitchen"],
    });
    card.hass.auth = { data: { access_token: "tok" } };
    card.hass.connection = {
      sendMessagePromise: async (message: any) => {
        calls.push(message);
        return { failed: [] };
      },
    };
    card.clip = {
      source: { kind: "fresh", blob: new Blob(["x"]) },
      url: "blob:preview",
      duration: 2,
      peaks: [],
    };
    vi.stubGlobal("fetch", async () => ({
      ok: true,
      json: async () => ({ message_id: "abc" }),
    }));

    await card.broadcast();

    expect(calls[0].targets).toEqual(["media_player.kitchen"]);
    vi.unstubAllGlobals();
  });

  it("refuses to send when no selected speaker is offered", async () => {
    const card = cardWithSpeakers({
      speakers: ["media_player.kitchen"],
      selected: ["media_player.attic"],
    });
    card.clip = {
      source: { kind: "fresh", blob: new Blob(["x"]) },
      url: "blob:preview",
      duration: 2,
      peaks: [],
    };

    await card.broadcast();

    expect(card.status.text).toMatch(/Pick at least one speaker/);
  });
});

describe("card history rendering and deletion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    (globalThis as any).isSecureContext = undefined;
  });

  const message = (can_delete: boolean) => ({
    id: "abc123",
    created: "2026-08-21T10:00:00+00:00",
    duration: 2,
    can_delete,
    extension: "wav",
  });

  it("renders the configured card name, falling back to the default", () => {
    const card = newCard();

    card.setConfig({ type: "custom:hass-broadcast-card" });
    expect(renderedText(card.render())).toContain("Voice Broadcast");

    card.setConfig({
      type: "custom:hass-broadcast-card",
      title: "Kitchen intercom",
    });
    const named = renderedText(card.render());
    expect(named).toContain("Kitchen intercom");
    expect(named).not.toContain("Voice Broadcast");

    // A name of nothing but whitespace is not a name.
    card.setConfig({ type: "custom:hass-broadcast-card", title: "   " });
    expect(renderedText(card.render())).toContain("Voice Broadcast");
  });

  it("offers a delete control only when the server says can_delete", () => {
    const card = newCard();
    card.setConfig({ type: "custom:hass-broadcast-card", recent_messages: "list" });

    card.history = [message(true)];
    expect(renderedText(card.render())).toContain("Delete");

    card.history = [message(false)];
    const text = renderedText(card.render());
    expect(text).not.toContain("Delete");
    // The row itself is still there — only the control is gated.
    expect(text).toContain("0:02");
  });

  it("keeps the body at three rows and the rest behind the dialog", () => {
    const card = newCard();
    card.setConfig({ type: "custom:hass-broadcast-card", recent_messages: "list" });
    card.history = [0, 1, 2, 3, 4].map((index) => ({
      ...message(false),
      id: `id-${index}`,
      duration: index,
    }));

    const body = renderedText(card.render());
    expect(body).toContain("0:02");
    expect(body).not.toContain("0:04");

    card.historyOpen = true;
    expect(renderedText(card.render())).toContain("0:04");
  });

  it("closes the dialog once a message is loaded into the card", async () => {
    const card = newCard();
    card.setConfig({ type: "custom:hass-broadcast-card" });
    card.hass = { auth: { data: { access_token: "t" } } };
    vi.stubGlobal(
      "fetch",
      async () => new Response(new Blob([new Uint8Array([1])]), { status: 200 }),
    );
    card.historyOpen = true;

    await card.loadMessage(message(true));

    expect(card.historyOpen).toBe(false);
  });

  it("does not reopen the dialog when the dashboard reattaches the card", () => {
    const card = newCard();
    card.setConfig({ type: "custom:hass-broadcast-card" });
    card.historyOpen = true;

    card.disconnectedCallback();

    expect(card.historyOpen).toBe(false);
  });

  it("explains a not_authorized rejection from the server", async () => {
    const card = newCard();
    card.hass = {
      connection: {
        sendMessagePromise: async () => {
          throw { code: "not_authorized", message: "nope" };
        },
      },
    };

    await card.deleteRecording("abc123");

    expect(card.status.text).toBe(
      "You do not have permission to delete this recording.",
    );
  });

  it("surfaces any other delete failure verbatim", async () => {
    const card = newCard();
    card.hass = {
      connection: {
        sendMessagePromise: async () => {
          throw new Error("connection lost");
        },
      },
    };

    await card.deleteRecording("abc123");

    expect(card.status.text).toMatch(/Could not delete: connection lost/);
  });

  function cardHolding(id: string, deleted: boolean): any {
    vi.stubGlobal("URL", { createObjectURL: () => "blob:x", revokeObjectURL: () => {} });
    const card = newCard();
    card.setConfig({ type: "custom:hass-broadcast-card" });
    card.hass = {
      states: {},
      connection: {
        sendMessagePromise: async (msg: any) =>
          msg.type === "hass_broadcast/delete" ? { deleted } : [],
      },
    };
    card.clip = {
      source: { kind: "stored", id },
      url: "blob:stored",
      duration: 2,
      peaks: [],
    };
    return card;
  }

  it("unloads the recording it just deleted", async () => {
    // The clip pointed at a message the server no longer has: it still
    // played from its object URL, but Send failed with not_found.
    const card = cardHolding("abc123", true);

    await card.deleteRecording("abc123");

    expect(card.clip).toBeUndefined();
    expect(card.canBroadcast).toBe(false);
  });

  it("unloads it when the server says it was already gone", async () => {
    const card = cardHolding("abc123", false);

    await card.deleteRecording("abc123");

    expect(card.clip).toBeUndefined();
  });

  it("keeps the loaded recording when deleting a different one", async () => {
    const card = cardHolding("other", true);
    const clip = card.clip;

    await card.deleteRecording("abc123");

    expect(card.clip).toBe(clip);
  });
});

describe("card sending a recording deleted elsewhere", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("unloads it and says why instead of the raw not_found", async () => {
    vi.stubGlobal("URL", { createObjectURL: () => "blob:x", revokeObjectURL: () => {} });
    const card = newCard();
    card.setConfig({ type: "custom:hass-broadcast-card", speakers: ["media_player.a"] });
    card.hass = {
      states: { "media_player.a": { state: "idle", attributes: { supported_features: 512 } } },
      connection: {
        sendMessagePromise: async (msg: any) => {
          if (msg.type === "hass_broadcast/send") {
            throw { code: "not_found", message: "Unknown recording abc123" };
          }
          return [];
        },
      },
    };
    card.selected = ["media_player.a"];
    card.clip = {
      source: { kind: "stored", id: "abc123" },
      url: "blob:stored",
      duration: 2,
      peaks: [],
    };

    await card.broadcast();

    expect(card.clip).toBeUndefined();
    expect(card.status.text).toBe("That recording was deleted.");
    expect(card.rec.phase).toBe("idle");
  });
});

describe("push to talk", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (globalThis as any).isSecureContext = undefined;
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    (globalThis as any).isSecureContext = undefined;
  });

  const press = { preventDefault: () => {} } as any;

  it("is what a card gets with no record_mode configured", () => {
    const { card } = makeCard();
    card.setConfig({ type: "custom:hass-broadcast-card" });
    expect(card.recordMode).toBe("push_to_talk");

    card.setConfig({ type: "custom:hass-broadcast-card", record_mode: "start_stop" });
    expect(card.recordMode).toBe("start_stop");
  });

  it("records for as long as the button is held", async () => {
    const { card, recorder } = makeCard();
    card.setConfig({ type: "custom:hass-broadcast-card" });

    await card.rec.onPressStart(press);
    expect(card.rec.phase).toBe("recording");

    await card.rec.onPressEnd();
    expect(recorder.stopped).toBe(1);
    expect(card.clip).toBeDefined();
  });

  it("stops a take released before the microphone finished opening", async () => {
    const { card, recorder } = makeCard();
    card.setConfig({ type: "custom:hass-broadcast-card" });
    let releaseStart: () => void = () => {};
    recorder.startImpl = () =>
      new Promise<void>((resolve) => {
        releaseStart = resolve;
      });

    const pending = card.rec.onPressStart(press);
    // Released while getUserMedia is still pending: without the deferred
    // stop this leaves the microphone open and the card recording forever.
    await card.rec.onPressEnd();
    releaseStart();
    await pending;
    await Promise.resolve();

    expect(recorder.stopped).toBe(1);
    expect(card.rec.phase).toBe("idle");
  });

  it("discards a tap too short to be speech", async () => {
    const { card, recorder } = makeCard();
    card.setConfig({ type: "custom:hass-broadcast-card" });
    recorder.stopImpl = async () => ({ blob: new Blob(["x"]), duration: 0.2, peaks: [] });

    await card.rec.onPressStart(press);
    await card.rec.onPressEnd();

    expect(card.clip).toBeUndefined();
    expect(card.status.text).toMatch(/Hold/);
  });

  it("keeps a short recording in start-stop mode, where it was deliberate", async () => {
    const { card, recorder } = makeCard();
    card.setConfig({ type: "custom:hass-broadcast-card", record_mode: "start_stop" });
    recorder.stopImpl = async () => ({ blob: new Blob(["x"]), duration: 0.2, peaks: [] });

    await card.rec.onPressStart(press);
    await card.rec.onPressStart(press);

    expect(card.clip).toBeDefined();
  });

  it("ignores a second pointer landing while the first press's start() is still opening the mic", async () => {
    // Finding 13: onPressStart reset stopRequested on every call, including a
    // second concurrent pointer. A second finger landing mid-open cleared
    // the first finger's pending stop request, and the take ran to
    // max_duration instead of stopping when expected.
    const { card, recorder } = makeCard();
    card.setConfig({ type: "custom:hass-broadcast-card" });
    let releaseStart: () => void = () => {};
    recorder.startImpl = () =>
      new Promise<void>((resolve) => {
        releaseStart = resolve;
      });

    const firstPress = card.rec.onPressStart(press);
    // First finger releases before the mic finishes opening.
    await card.rec.onPressEnd();
    // A second finger lands while start() is still in flight.
    const secondPress = card.rec.onPressStart(press);
    releaseStart();
    await firstPress;
    await secondPress;
    await Promise.resolve();

    expect(card.rec.phase).toBe("idle");
    expect(recorder.stopped).toBe(1);
  });

  it("toggles rather than holds in start-stop mode", async () => {
    const { card, recorder } = makeCard();
    card.setConfig({ type: "custom:hass-broadcast-card", record_mode: "start_stop" });

    await card.rec.onPressStart(press);
    expect(card.rec.phase).toBe("recording");
    // A release must do nothing at all here, or the button records for
    // exactly as long as the click lasts.
    await card.rec.onPressEnd();
    expect(card.rec.phase).toBe("recording");
    expect(recorder.stopped).toBe(0);

    await card.rec.onPressStart(press);
    expect(recorder.stopped).toBe(1);
  });
});

describe("card status messages", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    (globalThis as any).isSecureContext = undefined;
  });

  it("hands the strip back once a message has been read", () => {
    const card = newCard();
    card.fail("Could not delete: nope");
    expect(card.parts.view).toBe("status");

    vi.advanceTimersByTime(STATUS_MS);

    expect(card.status).toBeUndefined();
    expect(card.parts.view).toBe("idle");
  });

  it("keeps a sticky message until the next attempt", async () => {
    const { card, recorder } = makeCard();
    recorder.startImpl = async () => {
      throw Object.assign(new Error("no"), { name: "NotAllowedError" });
    };
    await card.rec.startRecording();

    vi.advanceTimersByTime(STATUS_MS * 3);
    expect(card.status.text).toMatch(/permission was denied/);

    recorder.startImpl = async () => {};
    await card.rec.startRecording();
    expect(card.status).toBeUndefined();
  });

  it("shows the timer, not a stale message, while recording", async () => {
    const { card } = makeCard();
    card.fail("Something earlier");
    await card.rec.startRecording();

    expect(card.parts.view).toBe("recording");
  });

  it("warns as the take nears its limit", async () => {
    const { card } = makeCard();
    card.setConfig({ type: "custom:hass-broadcast-card", max_duration: 20 });
    await card.rec.startRecording();

    // 20s limit: the window is min(10s, a quarter of 20s) = 5s.
    await vi.advanceTimersByTimeAsync(14000);
    expect(card.parts.timerWarning).toBe(false);
    await vi.advanceTimersByTimeAsync(1000);
    expect(card.parts.timerWarning).toBe(true);
  });
});

describe("card layouts", () => {
  const configured = (config: any) => {
    const card = newCard();
    card.setConfig({ type: "custom:hass-broadcast-card", ...config });
    return card;
  };

  it("puts the recent-messages button and volume in the header", () => {
    const card = configured({ speaker_picker: "chips", recent_messages: "button" });

    const text = renderedText(card.render());
    expect(text).toContain("Recent messages");
    expect(text).toContain("Broadcast volume");
    // Button style: no inline list, so none of its "Show all" control.
    expect(text).not.toContain("Show all");
  });

  it("lists recent messages below the card when asked to", () => {
    const text = renderedText(configured({ recent_messages: "list" }).render());

    expect(text).toContain("Show all");
  });

  it("leaves out what is switched off", () => {
    const text = renderedText(
      configured({ recent_messages: "off", volume_control: false }).render(),
    );

    expect(text).not.toContain("Recent messages");
    expect(text).not.toContain("Broadcast volume");
  });

  it("draws compact with the speaker dropdown and the rest behind ⋮", () => {
    const card = configured({
      layout: "compact",
      speaker_picker: "list",
      recent_messages: "list",
    });

    const text = renderedText(card.render());
    expect(text).toContain('class="card compact"');
    expect(text).toContain('class="pill"');
    expect(text).toContain("More");
    expect(text).not.toContain("Show all");
  });

  it("leaves out ⋮ in compact when there is nothing to put in it", () => {
    const card = configured({
      layout: "compact",
      recent_messages: "off",
      volume_control: false,
    });

    expect(renderedText(card.render())).not.toContain("More");
  });

  it("opens the history dialog from the header button", () => {
    const card = configured({ recent_messages: "button" });
    card.history = [
      { id: "a", created: "2026-08-21T10:00:00Z", duration: 7, can_delete: false, extension: "wav" },
    ];

    expect(renderedText(card.render())).not.toContain("<dialog");
    card.historyOpen = true;
    const text = renderedText(card.render());
    expect(text).toContain("<dialog");
    expect(text).toContain("0:07");
  });

  it("sizes itself from its layout, speaker picker and recent messages", () => {
    expect(configured({ layout: "compact" }).getCardSize()).toBe(2);
    expect(configured({}).getCardSize()).toBe(5);
    expect(configured({ speaker_picker: "chips" }).getCardSize()).toBe(6);
    expect(configured({ speaker_picker: "list", recent_messages: "list" }).getCardSize()).toBe(12);
    expect(configured({}).getGridOptions()).not.toHaveProperty("rows");
  });

  it("accepts every property Lovelace assigns to the cards it hosts", () => {
    // hui-card sets these on the element; a getter-only property with any of
    // these names throws, and the dashboard section never creates the card.
    const card = configured({ layout: "compact" });
    expect(() => Object.assign(card, LOVELACE_ASSIGNS)).not.toThrow();
    // Lovelace's `layout` is where the card sits, not which layout it uses.
    expect(card.getCardSize()).toBe(2);
  });

  it("does not fetch history it will not show", async () => {
    const card = configured({ recent_messages: "off" });
    const send = vi.fn(async () => ({ messages: [] }));
    card.hass = { connection: { sendMessagePromise: send } };

    await card.refreshHistory();

    expect(send).not.toHaveBeenCalled();
  });
});

describe("card editor", () => {
  it("is Home Assistant's own form, not an element of ours", () => {
    expect(HassBroadcastCard.getConfigForm().schema.length).toBeGreaterThan(0);
    expect((HassBroadcastCard as any).getConfigElement).toBeUndefined();
  });

  it("starts a new card with every playable speaker on it, none selected", () => {
    const stub = HassBroadcastCard.getStubConfig({
      states: {
        "media_player.b": { attributes: { supported_features: 512 } },
        "media_player.a": { attributes: { supported_features: 512 } },
        "media_player.tv": { attributes: { supported_features: 4 } },
      },
    });

    expect(stub.speakers).toEqual(["media_player.a", "media_player.b"]);
    expect(stub.selected).toEqual([]);
    expect(HassBroadcastCard.getStubConfig(undefined).speakers).toEqual([]);
  });

  it("writes keep_messages so the editor shows it on", () => {
    expect(HassBroadcastCard.getStubConfig(undefined).keep_messages).toBe(true);
  });
});

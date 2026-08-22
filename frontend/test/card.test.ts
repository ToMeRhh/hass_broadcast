import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The default vitest environment is plain Node, and that is enough: Lit ships
// @lit-labs/ssr-dom-shim, so a @customElement-decorated component constructs
// and runs its lifecycle callbacks without a DOM (editor.test.ts already
// relies on this). The only things card.ts touches that Node lacks are the
// module-scope `window` (the customCards registration) and the object-URL
// helpers, so stub those the same hand-rolled way recorder.test.ts stubs Web
// Audio, then import the module. No jsdom, no config changes.
(globalThis as any).window = globalThis;
(globalThis as any).URL.createObjectURL = () => "blob:preview";
(globalThis as any).URL.revokeObjectURL = () => {};

const { HassBroadcastCard } = await import("../src/card");
const { INSECURE_CONTEXT_MESSAGE } = await import("../src/errors");

/** Minimal stand-in for Recorder, injected over the card's own instance. */
class FakeRecorder {
  started = 0;
  stopped = 0;
  levelCallback?: (level: number) => void;
  startImpl: () => Promise<void> = async () => {};
  stopImpl: () => Promise<{ blob: Blob; duration: number }> = async () => ({
    blob: new Blob([new Uint8Array([1, 2, 3])]),
    duration: 2,
  });

  onLevel(callback: (level: number) => void): void {
    this.levelCallback = callback;
  }
  async start(): Promise<void> {
    this.started += 1;
    return this.startImpl();
  }
  async stop(): Promise<{ blob: Blob; duration: number }> {
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
  card.recorder = recorder;
  card.connectedCallback();
  return { card, recorder };
}

/**
 * Flatten a Lit TemplateResult tree into its literal text. Enough to assert
 * which branches a render produced without pulling in a DOM renderer.
 */
function renderedText(node: any): string {
  if (node === null || node === undefined || typeof node === "function") {
    return "";
  }
  if (Array.isArray(node)) {
    return node.map(renderedText).join("");
  }
  if (typeof node === "object" && "strings" in node && "values" in node) {
    return (node.strings as string[])
      .map((part, index) => part + renderedText(node.values[index]))
      .join("");
  }
  if (typeof node === "symbol") {
    return "";
  }
  return String(node);
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

  it("goes idle -> recording -> preview -> idle", async () => {
    const { card, recorder } = makeCard();
    expect(card.phase).toBe("idle");

    await card.startRecording();
    expect(card.phase).toBe("recording");
    expect(recorder.started).toBe(1);
    expect(card.error).toBeUndefined();

    await card.stopRecording();
    expect(card.phase).toBe("preview");
    expect(card.blob).toBeInstanceOf(Blob);
    expect(card.duration).toBe(2);
    expect(card.previewUrl).toBe("blob:preview");

    card.discard();
    expect(card.phase).toBe("idle");
    expect(card.blob).toBeUndefined();
    expect(card.previewUrl).toBeUndefined();
  });

  it("counts elapsed seconds and auto-stops at the configured maximum", async () => {
    const { card } = makeCard();
    card.setConfig({ type: "custom:hass-broadcast-card", max_duration: 5 });

    await card.startRecording();
    expect(card.phase).toBe("recording");

    await vi.advanceTimersByTimeAsync(5000);
    await Promise.resolve();
    expect(card.elapsed).toBe(5);
    expect(card.phase).toBe("preview");
  });

  it("names the HTTPS requirement when the context is insecure", () => {
    // No makeSupported(): plain Node has no secure context and no
    // mediaDevices, which is the same shape as http:// to a LAN address.
    const card = newCard();
    card.connectedCallback();

    expect(card.error).toBe(INSECURE_CONTEXT_MESSAGE);
    expect(card.error).toMatch(/HTTPS/);
    expect(card.phase).toBe("idle");
  });

  it("shows the permission message when the microphone is denied", async () => {
    const { card, recorder } = makeCard();
    recorder.startImpl = async () => {
      throw Object.assign(new Error("Permission denied"), {
        name: "NotAllowedError",
      });
    };

    await card.startRecording();

    expect(card.error).toMatch(/Microphone permission was denied/);
    expect(card.phase).toBe("idle");
    expect(card.timer).toBeUndefined();
  });

  it("resets to idle instead of stranding the UI when stop() fails", async () => {
    const { card, recorder } = makeCard();
    await card.startRecording();
    recorder.stopImpl = async () => {
      throw new Error("device vanished");
    };

    await card.stopRecording();

    expect(card.phase).toBe("idle");
    expect(card.error).toMatch(/Could not finish recording/);
  });

  it("releases the microphone when torn down while start() is in flight", async () => {
    const { card, recorder } = makeCard();
    let releaseStart: () => void = () => {};
    recorder.startImpl = () =>
      new Promise<void>((resolve) => {
        releaseStart = resolve;
      });

    const pending = card.startRecording();
    // Navigate away mid-start: the phase is still "idle" here, which is
    // precisely why disconnectedCallback's own teardown does not fire.
    card.disconnectedCallback();
    releaseStart();
    await pending;
    await Promise.resolve();

    // No transition, no interval, and the session was actually released.
    expect(card.phase).toBe("idle");
    expect(card.timer).toBeUndefined();
    expect(recorder.stopped).toBe(1);
  });

  it("stops the recorder when torn down while already recording", async () => {
    const { card, recorder } = makeCard();
    await card.startRecording();

    card.disconnectedCallback();
    await Promise.resolve();

    expect(card.phase).toBe("idle");
    expect(card.timer).toBeUndefined();
    expect(recorder.stopped).toBe(1);
  });
});

describe("card send results", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /** A card holding a recording, ready to send to two speakers. */
  function cardWithRecording(response: any): { card: any; calls: any[] } {
    const calls: any[] = [];
    const card = newCard();
    card.setConfig({ type: "custom:hass-broadcast-card", show_history: false });
    card.blob = new Blob(["x"]);
    card.duration = 2;
    card.selected = ["media_player.kitchen", "media_player.broken"];
    card.hass = {
      auth: { data: { access_token: "tok" } },
      states: {
        "media_player.broken": { attributes: { friendly_name: "Garage" } },
      },
      callService: async (...args: any[]) => {
        calls.push(args);
        return response;
      },
    };
    vi.stubGlobal(
      "fetch",
      async () => ({ ok: true, json: async () => ({ message_id: "abc" }) }),
    );
    return { card, calls };
  }

  it("discards the recording only when every target played", async () => {
    const { card } = cardWithRecording({ response: { failed: [] } });

    await card.send();

    expect(card.phase).toBe("idle");
    expect(card.blob).toBeUndefined();
    expect(card.error).toBeUndefined();
  });

  it("warns about the failed targets and keeps the recording on partial failure", async () => {
    const { card } = cardWithRecording({
      response: { failed: ["media_player.broken"] },
    });

    await card.send();

    // Naming the target matters: "it worked" for a message half the house
    // never heard is the failure mode this exists to prevent.
    expect(card.error).toMatch(/Garage/);
    expect(card.error).toMatch(/kept/);
    expect(card.phase).toBe("preview");
    expect(card.blob).toBeInstanceOf(Blob);
  });

  it("treats a total failure like a send error and keeps the blob", async () => {
    const { card } = cardWithRecording({
      response: { failed: ["media_player.kitchen", "media_player.broken"] },
    });

    await card.send();

    expect(card.error).toMatch(/Could not play on any speaker/);
    expect(card.phase).toBe("preview");
    expect(card.blob).toBeInstanceOf(Blob);
  });

  it("reports failed targets when replaying from history", async () => {
    const { card } = cardWithRecording({
      response: { failed: ["media_player.broken"] },
    });

    await card.replay("abc123");

    expect(card.error).toMatch(/Could not play on Garage/);
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
    card.setConfig({ type: "custom:hass-broadcast-card" });

    card.history = [message(true)];
    expect(renderedText(card.render())).toContain("Delete");

    card.history = [message(false)];
    const text = renderedText(card.render());
    expect(text).not.toContain("Delete");
    // The row itself is still there — only the control is gated.
    expect(text).toContain("Play");
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

    expect(card.error).toBe(
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

    expect(card.error).toMatch(/Could not delete: connection lost/);
  });
});

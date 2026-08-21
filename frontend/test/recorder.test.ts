import { afterEach, describe, expect, it, vi } from "vitest";
import { Recorder } from "../src/recorder";

// The default vitest environment is plain Node — there is no real
// AudioWorklet/getUserMedia to run against. These are minimal hand-rolled
// stubs of just the surface Recorder touches (navigator.mediaDevices,
// AudioContext, AudioWorkletNode), stubbed onto globalThis, rather than
// pulling in a full DOM (jsdom doesn't implement Web Audio anyway).

class FakeTrack {
  stopped = false;
  stop() {
    this.stopped = true;
  }
}

class FakeStream {
  private tracks = [new FakeTrack()];
  getTracks() {
    return this.tracks;
  }
}

class FakePort {
  closed = false;
  onmessage: ((event: { data: Int16Array }) => void) | null = null;
  close() {
    this.closed = true;
  }
}

class FakeNode {
  port = new FakePort();
  disconnected = false;
  connect() {}
  disconnect() {
    this.disconnected = true;
  }
}

class FakeContext {
  closed = false;
  destination = {};
  audioWorklet: { addModule: () => Promise<void> };

  constructor(
    public sampleRate: number,
    addModuleFails: boolean,
    private closeFails: boolean = false
  ) {
    this.audioWorklet = {
      addModule: addModuleFails
        ? () => Promise.reject(new Error("worklet failed to load"))
        : () => Promise.resolve(),
    };
  }
  createMediaStreamSource() {
    return { connect: () => {} };
  }
  async close() {
    if (this.closeFails) {
      throw new Error("context.close() failed (already closed)");
    }
    this.closed = true;
  }
}

/** Stubs the browser globals Recorder touches for the duration of one test. */
function installFakes(opts: { addModuleFails?: boolean; closeFails?: boolean } = {}) {
  const stream = new FakeStream();
  let context: FakeContext | undefined;
  let node: FakeNode | undefined;

  vi.stubGlobal("navigator", {
    mediaDevices: { getUserMedia: async () => stream },
  });

  vi.stubGlobal(
    "AudioContext",
    class extends FakeContext {
      constructor(options: { sampleRate: number }) {
        super(options.sampleRate, opts.addModuleFails ?? false, opts.closeFails ?? false);
        context = this;
      }
    }
  );

  vi.stubGlobal(
    "AudioWorkletNode",
    class extends FakeNode {
      constructor() {
        super();
        node = this;
      }
    }
  );

  return { stream, getContext: () => context, getNode: () => node };
}

describe("Recorder lifecycle", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("releases the microphone and audio context when start() fails partway", async () => {
    const { stream, getContext } = installFakes({ addModuleFails: true });
    const recorder = new Recorder();

    await expect(recorder.start()).rejects.toThrow("worklet failed to load");

    // The mic must not stay open after a failed start() — that's the
    // privacy-relevant leak: browser recording indicator stuck lit with
    // no remaining handle to turn it off.
    expect(stream.getTracks().every((t) => t.stopped)).toBe(true);
    expect(getContext()?.closed).toBe(true);
  });

  it("surfaces the original acquisition error, not a teardown error, when close() also fails during cleanup", async () => {
    const { stream } = installFakes({ addModuleFails: true, closeFails: true });
    const recorder = new Recorder();

    // addModule rejection is the original failure; context.close() rejecting
    // during the resulting cleanup must not replace it or abort teardown.
    await expect(recorder.start()).rejects.toThrow("worklet failed to load");

    expect(stream.getTracks().every((t) => t.stopped)).toBe(true);

    // Teardown must have completed despite close() throwing: a retry with
    // working fakes proves the handles were actually cleared (active reset,
    // stream/context/node nulled) rather than teardown stopping halfway.
    const retry = installFakes();
    await expect(recorder.start()).resolves.toBeUndefined();
    expect(retry.getContext()?.closed).toBe(false);
  });

  it("can retry start() after a failed attempt without orphaning the prior mic handle", async () => {
    const { stream } = installFakes({ addModuleFails: true });
    const recorder = new Recorder();
    await expect(recorder.start()).rejects.toThrow();
    expect(stream.getTracks().every((t) => t.stopped)).toBe(true);

    // Re-stub with a working worklet load and retry the same instance.
    const retry = installFakes();
    await expect(recorder.start()).resolves.toBeUndefined();
    expect(retry.getContext()?.closed).toBe(false);
  });

  it("throws instead of returning a phantom recording when stop() is called before start()", async () => {
    const recorder = new Recorder();
    await expect(recorder.stop()).rejects.toThrow(/no active recording/);
  });

  it("throws on a second stop() instead of returning the same recording twice", async () => {
    const { getNode } = installFakes();
    const recorder = new Recorder();
    await recorder.start();

    getNode()?.port.onmessage?.({ data: new Int16Array([1, 2, 3]) });

    const first = await recorder.stop();
    expect(first.blob.size).toBeGreaterThanOrEqual(44);

    await expect(recorder.stop()).rejects.toThrow(/no active recording/);
  });
});

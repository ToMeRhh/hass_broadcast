import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { captureRate, normalize, Recorder } from "../src/recorder";
import { clampMaxDuration } from "../src/config";

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
  onmessage: ((event: { data: Int16Array | string }) => void) | null = null;
  /** Chunks the worklet has posted that the main thread has not handled yet. */
  inFlight: Int16Array[] = [];

  constructor(private answersFlush: boolean) {}

  /** The worklet's side: a message from the main thread arrives. */
  postMessage(message: unknown) {
    if (message !== "flush" || !this.answersFlush) {
      return;
    }
    // Port messages arrive in order, so what the worklet posted before its
    // answer is delivered before it.
    queueMicrotask(() => {
      for (const chunk of this.inFlight.splice(0)) {
        this.deliver(chunk);
      }
      this.deliver("flushed");
    });
  }

  deliver(data: Int16Array | string) {
    if (!this.closed) {
      this.onmessage?.({ data });
    }
  }

  close() {
    this.closed = true;
  }
}

class FakeNode {
  port: FakePort;
  constructor(answersFlush: boolean) {
    this.port = new FakePort(answersFlush);
  }
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
function installFakes(
  opts: { addModuleFails?: boolean; closeFails?: boolean; answersFlush?: boolean } = {}
) {
  const stream = new FakeStream();
  let context: FakeContext | undefined;
  let node: FakeNode | undefined;
  let constraints: MediaStreamConstraints | undefined;

  vi.stubGlobal("navigator", {
    mediaDevices: {
      getUserMedia: async (requested: MediaStreamConstraints) => {
        constraints = requested;
        return stream;
      },
    },
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
        super(opts.answersFlush ?? true);
        node = this;
      }
    }
  );

  return {
    stream,
    getContext: () => context,
    getNode: () => node,
    getConstraints: () => constraints,
  };
}

describe("Recorder lifecycle", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("releases the microphone and audio context when start() fails partway", async () => {
    const { stream, getContext } = installFakes({ addModuleFails: true });
    const recorder = new Recorder();

    await expect(recorder.start(60)).rejects.toThrow("worklet failed to load");

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
    await expect(recorder.start(60)).rejects.toThrow("worklet failed to load");

    expect(stream.getTracks().every((t) => t.stopped)).toBe(true);

    // Teardown must have completed despite close() throwing: a retry with
    // working fakes proves the handles were actually cleared (active reset,
    // stream/context/node nulled) rather than teardown stopping halfway.
    const retry = installFakes();
    await expect(recorder.start(60)).resolves.toBeUndefined();
    expect(retry.getContext()?.closed).toBe(false);
  });

  it("can retry start() after a failed attempt without orphaning the prior mic handle", async () => {
    const { stream } = installFakes({ addModuleFails: true });
    const recorder = new Recorder();
    await expect(recorder.start(60)).rejects.toThrow();
    expect(stream.getTracks().every((t) => t.stopped)).toBe(true);

    // Re-stub with a working worklet load and retry the same instance.
    const retry = installFakes();
    await expect(recorder.start(60)).resolves.toBeUndefined();
    expect(retry.getContext()?.closed).toBe(false);
  });

  it("throws instead of returning a phantom recording when stop() is called before start()", async () => {
    const recorder = new Recorder();
    await expect(recorder.stop()).rejects.toThrow(/no active recording/);
  });

  it("throws on a second stop() instead of returning the same recording twice", async () => {
    vi.useFakeTimers();
    const { getNode } = installFakes();
    const recorder = new Recorder();
    await recorder.start(60);

    getNode()?.port.deliver(new Int16Array([1, 2, 3]));

    const first = await finish(recorder);
    expect(first.blob.size).toBeGreaterThanOrEqual(44);

    await expect(recorder.stop()).rejects.toThrow(/no active recording/);
  });
});

/** Run stop() to completion, skipping over its timers. */
async function finish(recorder: Recorder) {
  const result = recorder.stop();
  await vi.runAllTimersAsync();
  return result;
}

describe("Recorder stop", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("keeps the speech the microphone delivers after the button is released", async () => {
    // A phone's audio input runs a few hundred milliseconds behind the
    // voice: the last word is still on its way when the finger lifts.
    const { stream, getNode } = installFakes();
    const recorder = new Recorder();
    await recorder.start(60, { sampleRate: 16000 });
    getNode()?.port.deliver(new Int16Array(1600));

    const stopping = recorder.stop();
    await vi.advanceTimersByTimeAsync(100);
    expect(stream.getTracks()[0].stopped).toBe(false);
    getNode()?.port.deliver(new Int16Array(1600));
    await vi.runAllTimersAsync();

    expect((await stopping).duration).toBeCloseTo(0.2);
  });

  it("keeps chunks the worklet posted that the page had not handled yet", async () => {
    const { getNode } = installFakes();
    const recorder = new Recorder();
    await recorder.start(60, { sampleRate: 16000 });
    getNode()?.port.deliver(new Int16Array(1600));
    getNode()?.port.inFlight.push(new Int16Array(800));

    expect((await finish(recorder)).duration).toBeCloseTo(0.15);
  });

  it("still finishes when the worklet never answers the flush", async () => {
    // A browser can hold on to a worklet from before the flush existed.
    const { stream, getNode } = installFakes({ answersFlush: false });
    const recorder = new Recorder();
    await recorder.start(60, { sampleRate: 16000 });
    getNode()?.port.deliver(new Int16Array(1600));

    expect((await finish(recorder)).duration).toBeCloseTo(0.1);
    expect(stream.getTracks()[0].stopped).toBe(true);
  });
});

describe("Recorder capture quality", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("asks for the raw microphone, not one tuned for calls", async () => {
    // Browsers default all three on. They are built for a live call:
    // noise suppression warbles, gain control pumps, and on Android echo
    // cancellation switches the mic into its narrowband voice-call mode.
    // Nothing plays while recording, so there is no echo to cancel.
    const { getConstraints } = installFakes();
    await new Recorder().start(60);

    expect(getConstraints()?.audio).toMatchObject({
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    });
  });

  it("turns on noise suppression alone when asked, leaving the rest raw", async () => {
    // The setting is for a noisy room. Gain control and echo cancellation
    // stay off: they pump and narrow the mic whether or not the room is quiet.
    const { getConstraints } = installFakes();
    await new Recorder().start(60, { noiseSuppression: true });

    expect(getConstraints()?.audio).toMatchObject({
      echoCancellation: false,
      noiseSuppression: true,
      autoGainControl: false,
    });
  });

  it("records at 48 kHz for the default 60-second limit", async () => {
    const { getContext } = installFakes();
    await new Recorder().start(60);
    expect(getContext()?.sampleRate).toBe(48000);
  });

  it("lowers the rate only as far as the longest take needs to fit the upload", () => {
    expect(captureRate(clampMaxDuration(300))).toBe(16000);
    expect(captureRate(150)).toBe(32000);
    for (let seconds = clampMaxDuration(0); seconds <= clampMaxDuration(1e9); seconds++) {
      const rate = captureRate(seconds);
      // Mirrors MAX_UPLOAD_BYTES in const.py; a take one second over the
      // limit (the stop timer ticks once a second) must still be accepted.
      expect(44 + rate * 2 * (seconds + 1)).toBeLessThanOrEqual(10 * 1024 * 1024);
    }
  });

  it("brings a quiet take up to just under full scale", () => {
    const samples = new Int16Array([0, 2500, -5000, 500]);
    normalize(samples);
    expect(Math.max(...samples.map(Math.abs))).toBeGreaterThan(28000);
    expect(Math.max(...samples.map(Math.abs))).toBeLessThan(32767);
    // Shape is kept: every sample scaled by the same gain.
    expect(samples[1] / samples[2]).toBeCloseTo(-0.5, 2);
  });

  it("caps the boost so near-silence is not blown up into hiss", () => {
    const samples = new Int16Array([10, -20]);
    normalize(samples);
    expect(samples[1]).toBe(-200);
  });

  it("leaves silence and already-loud takes alone", () => {
    const silence = new Int16Array([0, 0]);
    normalize(silence);
    expect([...silence]).toEqual([0, 0]);

    const loud = new Int16Array([32000, -30000]);
    normalize(loud);
    expect([...loud]).toEqual([32000, -30000]);
  });
});

describe("Recorder.isSupported", () => {
  /**
   * Run `body` with no global `navigator`, restoring whatever was there.
   *
   * Node 21 added `globalThis.navigator`; Node 20 — which CI runs — has
   * none, so a dev machine on 22 cannot see this failure at all.
   */
  function withoutNavigator(body: () => void): void {
    const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
    delete (globalThis as any).navigator;
    try {
      body();
    } finally {
      if (original) {
        Object.defineProperty(globalThis, "navigator", original);
      }
    }
  }

  afterEach(() => {
    delete (globalThis as any).window;
    delete (globalThis as any).isSecureContext;
  });

  it("answers false where there is no navigator, instead of throwing", () => {
    // The whole job of a feature-detection check is to report whether an API
    // is there. Throwing a ReferenceError because one of the globals it
    // probes is absent is the one thing it must not do: the card calls this
    // from render(), so it takes the entire card down with it.
    (globalThis as any).window = globalThis;
    (globalThis as any).isSecureContext = true;

    withoutNavigator(() => {
      expect(Recorder.isSupported()).toBe(false);
    });
  });
});

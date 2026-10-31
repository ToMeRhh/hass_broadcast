import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { STOP_TAIL_MS } from "../src/recorder";
import { RecordingController, RecordingOptions, Take } from "../src/recording";

/** Stand-in for Recorder; the level callback is driven by hand. */
class FakeRecorder {
  started = 0;
  stopped = 0;
  levelCallback?: (level: number) => void;
  startImpl: () => Promise<void> = async () => {};
  stopImpl: () => Promise<{ blob: Blob; duration: number; peaks: number[] }> = async () => ({
    blob: new Blob(["x"]),
    duration: 2,
    peaks: [],
  });
  onLevel(callback: (level: number) => void): void {
    this.levelCallback = callback;
  }
  startArgs: unknown[] = [];
  async start(...args: unknown[]): Promise<void> {
    this.started += 1;
    this.startArgs = args;
    return this.startImpl();
  }
  async stop(): Promise<{ blob: Blob; duration: number; peaks: number[] }> {
    this.stopped += 1;
    return this.stopImpl();
  }
}

function makeController(
  mode: "push_to_talk" | "start_stop" = "push_to_talk",
  extra: Partial<RecordingOptions> = {},
) {
  const host = { updates: 0, addController() {}, requestUpdate() { host.updates += 1; } };
  const takes: Take[] = [];
  const errors: { text: string; sticky: boolean }[] = [];
  let started = 0;
  const controller = new RecordingController(host as any, {
    recordMode: () => mode,
    maxDuration: () => 60,
    onTake: (take) => {
      takes.push(take);
    },
    onError: (text, sticky) => errors.push({ text, sticky }),
    onStart: () => {
      started += 1;
    },
    ...extra,
  });
  const recorder = new FakeRecorder();
  controller.recorder = recorder as any;
  return { controller, recorder, host, takes, errors, starts: () => started };
}

const press = { preventDefault: () => {} } as any;

describe("RecordingController", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (globalThis as any).window = globalThis;
    (globalThis as any).isSecureContext = true;
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: async () => ({}) } });
    vi.stubGlobal("AudioWorkletNode", class {});
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    (globalThis as any).isSecureContext = undefined;
  });

  it("hands a finished take to the host", async () => {
    const { controller, takes, starts } = makeController();

    await controller.onPressStart(press);
    expect(starts()).toBe(1);
    await controller.onPressEnd();

    expect(takes).toHaveLength(1);
    expect(takes[0].duration).toBe(2);
    expect(controller.phase).toBe("idle");
  });

  it("hands the recorder the length limit and the noise suppression setting", async () => {
    const { controller, recorder } = makeController("push_to_talk", {
      noiseSuppression: () => true,
    });

    await controller.onPressStart(press);

    expect(recorder.startArgs).toEqual([60, { noiseSuppression: true }]);
  });

  it("follows the live level while recording and rests at zero after", async () => {
    const { controller, recorder, host } = makeController();
    await controller.startRecording();
    const before = host.updates;

    vi.setSystemTime(1000);
    recorder.levelCallback?.(0.1);
    vi.setSystemTime(1100);
    recorder.levelCallback?.(0.8);
    vi.setSystemTime(1200);
    recorder.levelCallback?.(0.2);

    expect(controller.level).toBeCloseTo(0.8);
    expect(host.updates).toBeGreaterThan(before);

    await controller.stopRecording();
    expect(controller.level).toBe(0);
  });

  it("does not start a take while a broadcast is in flight", async () => {
    const { controller, recorder } = makeController();
    controller.setSending(true);

    await controller.onPressStart(press);
    await controller.startRecording();

    expect(recorder.started).toBe(0);
    expect(controller.phase).toBe("sending");
  });

  it("reports a denied microphone as sticky, and other failures as not", async () => {
    const { controller, recorder, errors } = makeController();
    recorder.startImpl = async () => {
      throw Object.assign(new Error("no"), { name: "NotAllowedError" });
    };
    await controller.startRecording();
    recorder.startImpl = async () => {
      throw new Error("worklet 404");
    };
    await controller.startRecording();

    expect(errors.map((error) => error.sticky)).toEqual([true, false]);
  });

  it("calls a short push-to-talk press a tap, not a take", async () => {
    const { controller, recorder, takes, errors } = makeController();
    recorder.stopImpl = async () => ({ blob: new Blob(["x"]), duration: 0.2, peaks: [] });

    await controller.onPressStart(press);
    await controller.onPressEnd();

    expect(takes).toHaveLength(0);
    expect(errors[0].text).toMatch(/Hold/);
  });

  it("calls a short press a tap even though stop() records on past the release", async () => {
    const { controller, recorder, takes, errors } = makeController();
    recorder.stopImpl = async () => ({
      blob: new Blob(["x"]),
      duration: 0.2 + STOP_TAIL_MS / 1000,
      peaks: [],
    });

    await controller.onPressStart(press);
    await controller.onPressEnd();

    expect(takes).toHaveLength(0);
    expect(errors[0].text).toMatch(/Hold/);
  });

  it("lets go of the button on release while stop() records the tail", async () => {
    const { controller, recorder, takes } = makeController();
    let finish!: (result: { blob: Blob; duration: number; peaks: number[] }) => void;
    recorder.stopImpl = () => new Promise((resolve) => (finish = resolve));

    await controller.onPressStart(press);
    const stopping = controller.onPressEnd();

    expect(controller.phase).toBe("finishing");
    recorder.levelCallback?.(0.9);
    vi.advanceTimersByTime(100);
    expect(controller.level).toBe(0);

    finish({ blob: new Blob(["x"]), duration: 2, peaks: [] });
    await stopping;
    expect(controller.phase).toBe("idle");
    expect(takes).toHaveLength(1);
  });

  it("throws a take away when the press ends in a discard", async () => {
    const onDiscard = vi.fn();
    const { controller, recorder, takes, errors } = makeController("push_to_talk", {
      onDiscard,
    });

    await controller.onPressStart(press);
    await controller.onPressEnd(true);

    expect(takes).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(controller.phase).toBe("idle");
    // The session is still closed, or the microphone stays open.
    expect(recorder.stopped).toBe(1);
  });

  it("does not wait for the tail of a take it throws away", async () => {
    const { controller, recorder } = makeController();
    recorder.stopImpl = () => new Promise(() => {});

    await controller.onPressStart(press);
    await controller.onPressEnd(true);

    expect(controller.phase).toBe("idle");
  });

  it("throws away a press discarded before the microphone opened", async () => {
    const onDiscard = vi.fn();
    const { controller, recorder, takes } = makeController("push_to_talk", { onDiscard });
    let open!: () => void;
    recorder.startImpl = () => new Promise((resolve) => (open = resolve));

    const pressing = controller.onPressStart(press);
    await controller.onPressEnd(true);
    open();
    await pressing;

    expect(takes).toHaveLength(0);
    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(recorder.stopped).toBe(1);
    expect(controller.phase).toBe("idle");
  });

  it("hands over the waveform the recorder drew from the audio", async () => {
    const { controller, recorder, takes } = makeController();
    recorder.stopImpl = async () => ({ blob: new Blob(["x"]), duration: 2, peaks: [0.25, 1] });

    await controller.startRecording();
    recorder.levelCallback?.(0.5);
    await controller.stopRecording();

    expect(takes[0].peaks).toEqual([0.25, 1]);
  });

  it("waits for the host to finish with a take before resolving", async () => {
    // The tile sends from onTake; stopRecording resolving only afterwards is
    // what lets its tests (and its own sequencing) await the whole gesture.
    const host = { addController() {}, requestUpdate() {} };
    const order: string[] = [];
    const controller = new RecordingController(host as any, {
      recordMode: () => "push_to_talk",
      maxDuration: () => 60,
      onTake: async () => {
        await Promise.resolve();
        order.push("take handled");
      },
      onError: () => {},
    });
    controller.recorder = new FakeRecorder() as any;

    await controller.startRecording();
    await controller.stopRecording();
    order.push("stop resolved");

    expect(order).toEqual(["take handled", "stop resolved"]);
  });
});

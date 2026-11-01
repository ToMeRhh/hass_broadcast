/**
 * Microphone capture for the voice lab, with the card's raw-mic constraints.
 *
 * Not the card's `Recorder`: that loads its worklet from the integration's
 * static path, and this page also has to work as a standalone file. The
 * worklet here is inlined as a blob, the way Signalsmith Stretch loads its own.
 */
import { RAW_MIC } from "../../src/recorder";
import { Audio, normalizePeak, peak } from "./dsp";

const WORKLET = `
class Tap extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) this.port.postMessage(ch.slice());
    return true;
  }
}
registerProcessor("voice-lab-tap", Tap);
`;

export class Capture {
  private context?: AudioContext;
  private stream?: MediaStream;
  private chunks: Float32Array[] = [];

  static isSupported(): boolean {
    return window.isSecureContext && !!navigator.mediaDevices?.getUserMedia;
  }

  /**
   * `noiseSuppression` is the card's `noise_suppression` setting, applied the
   * way `Recorder.start` applies it: the browser's own suppression on an
   * otherwise raw mic.
   */
  async start(onLevel: (level: number) => void, noiseSuppression = false): Promise<void> {
    this.chunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { ...RAW_MIC, noiseSuppression },
    });
    this.context = new AudioContext({ sampleRate: 48000 });
    const url = URL.createObjectURL(new Blob([WORKLET], { type: "text/javascript" }));
    await this.context.audioWorklet.addModule(url);
    URL.revokeObjectURL(url);
    const node = new AudioWorkletNode(this.context, "voice-lab-tap");
    node.port.onmessage = (event: MessageEvent<Float32Array>) => {
      this.chunks.push(event.data);
      onLevel(peak(event.data));
    };
    this.context.createMediaStreamSource(this.stream).connect(node);
    node.connect(this.context.destination);
  }

  /** What the browser granted, which may differ from what was asked. */
  get noiseSuppression(): boolean | undefined {
    return this.stream?.getAudioTracks()[0]?.getSettings().noiseSuppression;
  }

  async stop(): Promise<Audio> {
    const rate = this.context?.sampleRate ?? 48000;
    this.stream?.getTracks().forEach((t) => t.stop());
    await this.context?.close();
    const total = this.chunks.reduce((s, c) => s + c.length, 0);
    const samples = new Float32Array(total);
    let at = 0;
    for (const c of this.chunks) { samples.set(c, at); at += c.length; }
    this.chunks = [];
    return { samples: normalizePeak(samples), rate };
  }
}

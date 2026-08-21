import { encodeWav } from "./wav";

const TARGET_RATE = 16000;
const WORKLET_URL = "/api/hass_broadcast/static/recorder-worklet.js";

/** Captures microphone audio as Int16 PCM and returns it as a WAV blob. */
export class Recorder {
  private context?: AudioContext;
  private stream?: MediaStream;
  private node?: AudioWorkletNode;
  private chunks: Int16Array[] = [];
  private levelCallback?: (level: number) => void;

  /** Recording needs a secure context; browsers hide the API otherwise. */
  static isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      window.isSecureContext === true &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof AudioWorkletNode !== "undefined"
    );
  }

  onLevel(callback: (level: number) => void): void {
    this.levelCallback = callback;
  }

  async start(): Promise<void> {
    this.chunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.context = new AudioContext({ sampleRate: TARGET_RATE });
    await this.context.audioWorklet.addModule(WORKLET_URL);

    const source = this.context.createMediaStreamSource(this.stream);
    this.node = new AudioWorkletNode(this.context, "recorder-worklet");
    this.node.port.onmessage = (event: MessageEvent<Int16Array>) => {
      this.chunks.push(event.data);
      if (this.levelCallback) {
        this.levelCallback(peak(event.data));
      }
    };
    source.connect(this.node);
    this.node.connect(this.context.destination);
  }

  async stop(): Promise<{ blob: Blob; duration: number }> {
    const sampleRate = this.context?.sampleRate ?? TARGET_RATE;
    this.node?.port.close();
    this.node?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    await this.context?.close();
    this.context = undefined;
    this.stream = undefined;
    this.node = undefined;

    const total = this.chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const samples = new Int16Array(total);
    let offset = 0;
    for (const chunk of this.chunks) {
      samples.set(chunk, offset);
      offset += chunk.length;
    }

    return {
      blob: encodeWav(samples, sampleRate),
      duration: total / sampleRate,
    };
  }
}

function peak(samples: Int16Array): number {
  let max = 0;
  for (const sample of samples) {
    max = Math.max(max, Math.abs(sample));
  }
  return max / 32768;
}

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
  private active = false;

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
    try {
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
      this.active = true;
    } catch (error) {
      // Acquisition failed partway (e.g. the worklet 404s during an HA
      // restart). Release whatever was already acquired so the mic
      // indicator doesn't stay lit and a retry doesn't orphan it, then
      // rethrow the original error untouched — the card matches on it
      // (e.g. NotAllowedError) to show a specific message.
      await this.release();
      throw error;
    }
  }

  async stop(): Promise<{ blob: Blob; duration: number }> {
    if (!this.active) {
      throw new Error("Recorder.stop() called with no active recording session");
    }
    const sampleRate = this.context?.sampleRate ?? TARGET_RATE;
    const chunks = this.chunks;
    await this.release();

    const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const samples = new Int16Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      samples.set(chunk, offset);
      offset += chunk.length;
    }

    return {
      blob: encodeWav(samples, sampleRate),
      duration: total / sampleRate,
    };
  }

  /** Tears down mic/audio resources and clears session state. Safe to call from any state. */
  private async release(): Promise<void> {
    this.node?.port.close();
    this.node?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    try {
      await this.context?.close();
    } catch {
      // A context that refuses to close (usually already-closed) must not
      // abort teardown or mask the caller's original error.
    } finally {
      this.context = undefined;
      this.stream = undefined;
      this.node = undefined;
      this.chunks = [];
      this.active = false;
    }
  }
}

function peak(samples: Int16Array): number {
  let max = 0;
  for (const sample of samples) {
    max = Math.max(max, Math.abs(sample));
  }
  return max / 32768;
}

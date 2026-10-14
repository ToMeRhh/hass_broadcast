import { encodeWav } from "./wav";

/**
 * Context rates to record at, best first. Everything a speaker can reproduce
 * of a voice is under 24 kHz, so 48 kHz loses nothing; 16 kHz cuts at 8 kHz,
 * which is telephone audio and sounds it.
 */
const CAPTURE_RATES = [48000, 32000, 24000, 16000];
// MAX_UPLOAD_BYTES in const.py. The upload is uncompressed, so the rate is
// what decides whether the longest take the card allows still fits.
const UPLOAD_BUDGET = 10 * 1024 * 1024;
const WAV_HEADER_BYTES = 44;
// Headroom for the stop timer, which fires on a one-second tick.
const OVERRUN_SECONDS = 1;

// -1 dBFS, and at most +20 dB: enough to rescue a quiet mic, not so much that
// a near-silent take turns into amplified hiss.
const TARGET_PEAK = 0.89 * 32767;
const MAX_GAIN = 10;

const WORKLET_URL = "/api/hass_broadcast/static/recorder-worklet.js";

/**
 * Overrides of the shipped capture settings. The card never passes any; they
 * exist so the dev harness's sound lab (frontend/dev/lab.ts) can compare
 * alternatives through this same recorder rather than a copy of it.
 */
export interface CaptureOptions {
  sampleRate?: number;
  constraints?: MediaTrackConstraints;
  normalize?: boolean;
}

// The browser's call processing is off: noise suppression warbles, gain
// control pumps, and on Android echo cancellation puts the mic in its
// narrowband voice-call mode — for an echo that cannot happen, since nothing
// plays while recording. stop() makes up the level.
export const RAW_MIC: MediaTrackConstraints = {
  channelCount: 1,
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
};

/** Captures microphone audio as Int16 PCM and returns it as a WAV blob. */
export class Recorder {
  private context?: AudioContext;
  private stream?: MediaStream;
  private node?: AudioWorkletNode;
  private chunks: Int16Array[] = [];
  private levelCallback?: (level: number) => void;
  private active = false;
  private options: CaptureOptions = {};

  /**
   * Recording needs a secure context; browsers hide the API otherwise.
   *
   * Every global here is probed with `typeof` rather than dereferenced. A
   * bare `navigator.mediaDevices` throws a ReferenceError wherever the
   * global is absent — Node 20 among them, which is what CI runs — and the
   * card calls this from render(), so the throw takes the whole card down
   * instead of merely reporting "recording is unavailable here".
   */
  static isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      window.isSecureContext === true &&
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof AudioWorkletNode !== "undefined"
    );
  }

  onLevel(callback: (level: number) => void): void {
    this.levelCallback = callback;
  }

  /** What the browser granted for the live take, which may differ from what was asked. */
  get trackSettings(): MediaTrackSettings | undefined {
    return this.stream?.getAudioTracks()[0]?.getSettings();
  }

  /** `maxSeconds` is the longest this take may run; it caps the sample rate. */
  async start(maxSeconds: number, options: CaptureOptions = {}): Promise<void> {
    this.chunks = [];
    this.options = options;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: options.constraints ?? RAW_MIC,
      });
      this.context = new AudioContext({
        sampleRate: options.sampleRate ?? captureRate(maxSeconds),
      });
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
    const sampleRate = this.context?.sampleRate ?? CAPTURE_RATES[0];
    const chunks = this.chunks;
    const boost = this.options.normalize ?? true;
    await this.release();

    const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const samples = new Int16Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      samples.set(chunk, offset);
      offset += chunk.length;
    }
    if (boost) {
      normalize(samples);
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

/** The best rate at which a `maxSeconds` take still fits in one upload. */
export function captureRate(maxSeconds: number): number {
  const bytesPerSecond = (rate: number) => rate * 2;
  const fits = (rate: number) =>
    WAV_HEADER_BYTES + bytesPerSecond(rate) * (maxSeconds + OVERRUN_SECONDS) <=
    UPLOAD_BUDGET;
  return CAPTURE_RATES.find(fits) ?? CAPTURE_RATES[CAPTURE_RATES.length - 1];
}

/**
 * Scale a take in place so its loudest sample sits just under full scale.
 *
 * Only ever boosts: with the browser's gain control off, a quiet mic gives a
 * quiet take, and a speaker across the room has nothing to raise it with.
 */
export function normalize(samples: Int16Array): void {
  let max = 0;
  for (const sample of samples) {
    max = Math.max(max, Math.abs(sample));
  }
  if (max === 0) {
    return;
  }
  const gain = Math.min(MAX_GAIN, TARGET_PEAK / max);
  if (gain <= 1) {
    return;
  }
  for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.round(samples[i] * gain);
  }
}

function peak(samples: Int16Array): number {
  let max = 0;
  for (const sample of samples) {
    max = Math.max(max, Math.abs(sample));
  }
  return max / 32768;
}

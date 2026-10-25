/**
 * Signalsmith Stretch (MIT, WASM in an AudioWorklet): a high-quality pitch
 * shifter with formant compensation. Run offline over the whole clip.
 *
 * The package inlines its WASM and registers its worklet from a blob URL, so
 * it needs no file served beside the card — the property that makes it
 * bundleable.
 */
import SignalsmithStretch from "signalsmith-stretch";

import { Audio } from "./dsp";

export interface StretchParams {
  semitones: number;
  /** Keep the vocal tract where it was while the pitch moves. */
  formantCompensation?: boolean;
  /** Extra formant shift, semitones. */
  formantSemitones?: number;
  /** Rough F0 for the formant analysis; 0 lets it track pitch itself. */
  formantBaseHz?: number;
}

// The node's own delay, measured once per rate and trimmed off the front.
const PAD_SECONDS = 0.5;

export async function stretch(audio: Audio, p: StretchParams): Promise<Audio> {
  const { samples, rate } = audio;
  const pad = Math.round(rate * PAD_SECONDS);
  const context = new OfflineAudioContext(1, samples.length + pad, rate);
  const node = await withTimeout(
    SignalsmithStretch(context, { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [1] }),
  );
  await node.addBuffers([samples.slice()]);
  node.schedule({
    active: true,
    input: 0,
    output: 0,
    rate: 1,
    semitones: p.semitones,
    formantCompensation: p.formantCompensation ?? false,
    formantSemitones: p.formantSemitones ?? 0,
    formantBaseHz: p.formantBaseHz ?? 0,
  });
  node.connect(context.destination);
  const rendered = (await context.startRendering()).getChannelData(0);
  const lag = await latency(rate);
  return { samples: rendered.slice(lag, lag + samples.length), rate };
}

const latencies = new Map<number, number>();

/** Where an impulse comes out, so output lines up with input. */
async function latency(rate: number): Promise<number> {
  const known = latencies.get(rate);
  if (known !== undefined) return known;
  const n = Math.round(rate * PAD_SECONDS);
  const context = new OfflineAudioContext(1, n * 2, rate);
  const node = await withTimeout(
    SignalsmithStretch(context, { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [1] }),
  );
  const click = new Float32Array(n);
  click[Math.round(rate * 0.1)] = 1;
  await node.addBuffers([click]);
  node.schedule({ active: true, input: 0, output: 0, rate: 1, semitones: 0 });
  node.connect(context.destination);
  const out = (await context.startRendering()).getChannelData(0);
  let at = 0;
  for (let i = 1; i < out.length; i++) if (Math.abs(out[i]) > Math.abs(out[at])) at = i;
  const lag = Math.max(0, at - Math.round(rate * 0.1));
  latencies.set(rate, lag);
  return lag;
}

/** A worklet that fails to load never answers; say so instead of hanging. */
function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Signalsmith Stretch worklet did not start")), ms),
    ),
  ]);
}

/** Turn a clip and a preset into the clip the speakers would play. */
import { Audio, mixInto, normalizePeak, resample } from "./dsp";
import { applyFx } from "./fx";
import { Preset } from "./presets";
import { stretch } from "./stretch";
import { Analysis, analyse, synthesise } from "./vocoder";

export interface Rendered {
  audio: Audio;
  /** Wall time of this render, ms (not counting a cached analysis). */
  ms: number;
}

/** One analysis per clip, shared by every vocoder voice. */
const analyses = new WeakMap<Audio, Promise<Analysis>>();

export function analysisOf(clip: Audio): Promise<Analysis> {
  let a = analyses.get(clip);
  if (!a) {
    a = analyse(clip);
    analyses.set(clip, a);
  }
  return a;
}

export async function render(clip: Audio, preset: Preset): Promise<Rendered> {
  const e = preset.engine;
  // The analysis is shared, so a vocoder render's own cost starts after it.
  const a = e.kind === "vocoder" ? await analysisOf(clip) : undefined;
  const started = performance.now();
  let voice: Audio;
  switch (e.kind) {
    case "none":
      voice = { samples: clip.samples.slice(), rate: clip.rate };
      break;
    case "resample": {
      // Pretend the clip was recorded at a lower rate and play it at the real one.
      const ratio = 2 ** (e.semitones / 12);
      voice = { samples: resample(clip.samples, clip.rate, clip.rate / ratio), rate: clip.rate };
      break;
    }
    case "stretch":
      voice = await stretch(clip, e);
      break;
    case "vocoder": {
      const out = new Float32Array(clip.samples.length);
      for (const { params, gain } of e.voices) {
        mixInto(out, (await synthesise(a!, params)).samples, gain ?? 1);
      }
      voice = { samples: out, rate: clip.rate };
      break;
    }
  }
  const done = await finish(voice, preset);
  return { audio: done, ms: performance.now() - started };
}

async function finish(voice: Audio, preset: Preset): Promise<Audio> {
  const out = await applyFx(voice, preset.fx ?? []);
  normalizePeak(out.samples);
  return out;
}

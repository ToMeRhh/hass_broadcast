/**
 * Small DSP toolbox for the voice lab: an FFT, a band-limited resampler, and
 * WAV in/out. Dependency-free on purpose — the engines that build on it have
 * to fit in the card bundle if the exploration graduates.
 */
import { encodeWav } from "../../src/wav";

/** A mono clip as float samples in -1..1. */
export interface Audio {
  samples: Float32Array;
  rate: number;
}

// ---------------------------------------------------------------------------
// FFT

interface Plan {
  n: number;
  rev: Uint32Array;
  cos: Float64Array;
  sin: Float64Array;
}

const plans = new Map<number, Plan>();

function plan(n: number): Plan {
  let p = plans.get(n);
  if (p) return p;
  const bits = Math.log2(n);
  if (!Number.isInteger(bits)) throw new Error(`FFT size ${n} is not a power of two`);
  const rev = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    let r = 0;
    for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b);
    rev[i] = r;
  }
  const cos = new Float64Array(n / 2);
  const sin = new Float64Array(n / 2);
  for (let i = 0; i < n / 2; i++) {
    cos[i] = Math.cos((2 * Math.PI * i) / n);
    sin[i] = -Math.sin((2 * Math.PI * i) / n);
  }
  p = { n, rev, cos, sin };
  plans.set(n, p);
  return p;
}

/** In-place complex FFT. `inverse` scales by 1/n. */
export function fft(re: Float64Array, im: Float64Array, inverse = false): void {
  const n = re.length;
  const { rev, cos, sin } = plan(n);
  for (let i = 0; i < n; i++) {
    const j = rev[i];
    if (j > i) {
      let t = re[i]; re[i] = re[j]; re[j] = t;
      t = im[i]; im[i] = im[j]; im[j] = t;
    }
  }
  const sign = inverse ? -1 : 1;
  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1;
    const step = n / size;
    for (let start = 0; start < n; start += size) {
      for (let k = 0; k < half; k++) {
        const wr = cos[k * step];
        const wi = sign * sin[k * step];
        const a = start + k;
        const b = a + half;
        const xr = re[b] * wr - im[b] * wi;
        const xi = re[b] * wi + im[b] * wr;
        re[b] = re[a] - xr; im[b] = im[a] - xi;
        re[a] += xr; im[a] += xi;
      }
    }
  }
  if (inverse) {
    for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  }
}

export function nextPow2(x: number): number {
  return 2 ** Math.ceil(Math.log2(x));
}

// ---------------------------------------------------------------------------
// Resampling

/**
 * Windowed-sinc resampler. Rational ratios with a small numerator (48 → 16
 * kHz is 1/3, 44.1 → 48 is 160/147) use a precomputed polyphase table; the
 * rest evaluate the kernel per tap, which is slow but exact.
 */
export function resample(x: Float32Array, from: number, to: number, zeros = 16): Float32Array {
  if (from === to) return x.slice();
  const ratio = to / from;
  const out = new Float32Array(Math.round(x.length * ratio));
  // Below Nyquist of the lower rate, with a little room for the transition band.
  const cutoff = Math.min(1, ratio) * 0.94;
  const width = zeros / cutoff;
  const kernel = (d: number) => {
    if (Math.abs(d) >= width) return 0;
    const arg = d * cutoff;
    const sinc = arg === 0 ? 1 : Math.sin(Math.PI * arg) / (Math.PI * arg);
    return sinc * (0.5 + 0.5 * Math.cos((Math.PI * d) / width)) * cutoff;
  };
  const g = gcd(Math.round(from), Math.round(to));
  const phases = Math.round(to) / g;
  const step = Math.round(from) / g;
  if (Number.isInteger(from) && Number.isInteger(to) && phases <= 512) {
    // Output i sits at input position i·step/phases: integer part plus one of
    // `phases` fractional offsets, each with its own row of taps.
    const taps = 2 * Math.ceil(width) + 1;
    const table = new Float32Array(phases * taps);
    for (let p = 0; p < phases; p++) {
      const frac = p / phases;
      for (let t = 0; t < taps; t++) table[p * taps + t] = kernel(frac - (t - Math.ceil(width)));
    }
    const half = Math.ceil(width);
    for (let i = 0; i < out.length; i++) {
      const num = i * step;
      const base = Math.floor(num / phases);
      const p = num - base * phases;
      const row = p * taps;
      let sum = 0;
      for (let t = 0; t < taps; t++) {
        const j = base + t - half;
        if (j >= 0 && j < x.length) sum += x[j] * table[row + t];
      }
      out[i] = sum;
    }
    return out;
  }
  for (let i = 0; i < out.length; i++) {
    const t = i / ratio;
    const lo = Math.max(0, Math.ceil(t - width));
    const hi = Math.min(x.length - 1, Math.floor(t + width));
    let sum = 0;
    for (let j = lo; j <= hi; j++) sum += x[j] * kernel(t - j);
    out[i] = sum;
  }
  return out;
}

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

// ---------------------------------------------------------------------------
// Levels

export function peak(x: Float32Array): number {
  let max = 0;
  for (let i = 0; i < x.length; i++) max = Math.max(max, Math.abs(x[i]));
  return max;
}

/** Scale so the peak sits at `target` (default -1 dBFS). Boosts and cuts. */
export function normalizePeak(x: Float32Array, target = 0.89): Float32Array {
  const p = peak(x);
  if (p === 0) return x;
  const g = target / p;
  for (let i = 0; i < x.length; i++) x[i] *= g;
  return x;
}

export function rms(x: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < x.length; i++) sum += x[i] * x[i];
  return Math.sqrt(sum / Math.max(1, x.length));
}

/** Mix `b` into `a` (in place) at gain `g`, from offset `at`. */
export function mixInto(a: Float32Array, b: Float32Array, g = 1, at = 0): void {
  const n = Math.min(b.length, a.length - at);
  for (let i = 0; i < n; i++) a[at + i] += b[i] * g;
}

// ---------------------------------------------------------------------------
// WAV

/** Decode anything the browser can (WAV, MP3, the clip a card made) to mono. */
export async function decode(blob: Blob): Promise<Audio> {
  const context = new OfflineAudioContext(1, 1, 48000);
  const buffer = await context.decodeAudioData(await blob.arrayBuffer());
  // decodeAudioData resamples to the context's rate; that is fine, 48 kHz is
  // what the card records at anyway.
  const samples = new Float32Array(buffer.length);
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const ch = buffer.getChannelData(c);
    for (let i = 0; i < ch.length; i++) samples[i] += ch[i] / buffer.numberOfChannels;
  }
  return { samples, rate: buffer.sampleRate };
}

/** The card's own upload format: 16-bit mono WAV. */
export function toWav(audio: Audio): Blob {
  const pcm = new Int16Array(audio.samples.length);
  for (let i = 0; i < pcm.length; i++) {
    const s = Math.max(-1, Math.min(1, audio.samples[i]));
    pcm[i] = Math.round(s * 32767);
  }
  return encodeWav(pcm, audio.rate);
}

/** Let the page paint between chunks of a long render. */
export function yieldToUI(): Promise<void> {
  return new Promise((done) => setTimeout(done, 0));
}

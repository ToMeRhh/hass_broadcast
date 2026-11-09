/**
 * A source-filter vocoder in the manner of WORLD (Morise et al.): analyse a
 * voice into pitch (F0), a smooth spectral envelope (the vocal tract), and
 * per-band aperiodicity (breath/noise), change any of the three
 * independently, and resynthesise.
 *
 * That independence is the point. A pitch shifter moves the voice and the
 * vocal tract together, which is the chipmunk; here a deeper voice can keep
 * its formants, a whisper is the same envelope with all-noise excitation, and
 * a robot is the real envelope driven by a flat pitch.
 *
 * - F0: YIN difference function with a Viterbi path through the candidates
 *   (pYIN-flavoured), on a 16 kHz copy.
 * - Envelope: CheapTrick — pitch-adaptive window, F0-wide linear smoothing,
 *   then cepstral liftering.
 * - Aperiodicity: normalised autocorrelation at one period, per band, from the
 *   band's slice of a short power spectrum. Much simpler than WORLD's D4C.
 * - Synthesis: one minimum-phase response per pulse for the periodic part, and
 *   a period-long noise burst through a minimum-phase filter for the rest, so
 *   breath noise is modulated by the glottal cycle as it is in a real voice.
 */
import { Audio, fft, nextPow2, resample, yieldToUI } from "./dsp";

const FRAME_SECONDS = 0.005;
/**
 * Synthesis rebuilds its filters every this many frames (10 ms) and keeps
 * 12 ms of each response: the envelope moves slowly and a vocal-tract
 * response has decayed ~20 dB by then. Together they halve synthesis time.
 */
const FILTER_EVERY = 2;
const RESPONSE_SECONDS = 0.012;
const F0_FLOOR = 60;
const F0_CEIL = 800;
/** CheapTrick's stand-in pitch for unvoiced frames. */
const UNVOICED_F0 = 500;
/**
 * The band-correlation estimate reads noisier than a voice is (F0 drift inside
 * the window lowers the correlation too). Halving it made resynthesised speech
 * match its source's harmonicity (6.9 dB both, CMU ARCTIC bdl; unhalved 5.8).
 */
const AP_CALIBRATION = 0.5;
/** Aperiodicity band edges, Hz. */
const AP_EDGES = [0, 800, 1600, 2600, 4000, 6000, 9000, 24000];

export interface Analysis {
  rate: number;
  length: number;
  hop: number;
  /** FFT size of the envelope; frames hold `bins = n/2+1` values. */
  n: number;
  bins: number;
  /** Hz per frame, 0 where unvoiced. */
  f0: Float32Array;
  /** Per frame, the power spectral envelope (per-sample PSD). */
  env: Float32Array[];
  /** Per frame, one aperiodicity (0 periodic … 1 noise) per AP band. */
  ap: Float32Array[];
  /** Median F0 of voiced frames, Hz; 0 if none. */
  medianF0: number;
  /** Wall time the analysis took, ms. */
  ms: number;
}

export interface VoiceParams {
  /** Pitch ratio. 2 = an octave up. */
  pitch?: number;
  /** Formant ratio: env'(f) = env(f / formant). >1 = smaller head. */
  formant?: number;
  /** Formant wobble, as {rate Hz, depth ratio} around `formant`. */
  formantLfo?: { rate: number; depth: number };
  /** Replace the pitch contour with a constant, Hz. */
  monotone?: number;
  /** Scale deviations from the median pitch (log domain). 1 = unchanged. */
  expressive?: number;
  vibrato?: { rate: number; cents: number };
  /** Snap to a scale (pitch classes, 0 = C). strength 1 = hard tune. */
  tune?: { scale: number[]; strength: number; glideMs: number };
  /** Random period perturbation per pulse, as a fraction (0.02 = 2 %). */
  jitter?: number;
  /** Random amplitude perturbation per pulse, as a fraction. */
  shimmer?: number;
  /** Aperiodicity: 1 all noise … 0 unchanged … −1 perfectly clean buzz. */
  breath?: number;
  /** Everything unvoiced: the envelope over noise only. */
  whisper?: boolean;
  /** Alternate pulse amplitude by this much: period doubling, a growl. */
  subharmonic?: number;
  /** Spectral tilt, dB per octave above 1 kHz. Negative = darker. */
  tilt?: number;
}

// ---------------------------------------------------------------------------
// Analysis

export async function analyse(audio: Audio): Promise<Analysis> {
  const started = performance.now();
  const { samples: x, rate } = audio;
  const hop = Math.round(rate * FRAME_SECONDS);
  const frames = Math.floor(x.length / hop) + 1;

  const f0 = await trackF0(x, rate, hop, frames);

  const n = nextPow2(3 * rate / 71 + 1);
  const bins = n / 2 + 1;
  const env: Float32Array[] = [];
  const ap: Float32Array[] = [];
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  const power = new Float64Array(bins);

  let lastYield = performance.now();
  for (let i = 0; i < frames; i++) {
    const center = i * hop;
    env.push(cheapTrick(x, rate, center, f0[i] || UNVOICED_F0, n, re, im, power));
    ap.push(f0[i] ? aperiodicity(x, rate, center, f0[i]) : new Float32Array(AP_EDGES.length - 1).fill(1));
    if (performance.now() - lastYield > 40) {
      await yieldToUI();
      lastYield = performance.now();
    }
  }
  smoothAp(ap, f0);

  const voiced = Array.from(f0).filter((v) => v > 0).sort((a, b) => a - b);
  return {
    rate,
    length: x.length,
    hop,
    n,
    bins,
    f0,
    env,
    ap,
    medianF0: voiced.length ? voiced[voiced.length >> 1] : 0,
    ms: performance.now() - started,
  };
}

/** YIN candidates per frame, joined by a Viterbi path that dislikes octave jumps. */
async function trackF0(x: Float32Array, rate: number, hop: number, frames: number): Promise<Float32Array> {
  const fs = 16000;
  const y = highpass(resample(x, rate, fs), fs, 50);
  const step = (hop * fs) / rate;
  const W = Math.round(0.025 * fs);
  const tauMax = Math.ceil(fs / F0_FLOOR);
  const tauMin = Math.floor(fs / F0_CEIL);

  // Frame energies, to keep silence unvoiced whatever YIN says.
  const energies = new Float64Array(frames);
  let loudest = 0;
  for (let i = 0; i < frames; i++) {
    const c = Math.round(i * step);
    let e = 0;
    for (let j = c - W / 2; j < c + W / 2; j++) {
      const v = y[j] ?? 0;
      e += v * v;
    }
    energies[i] = e / W;
    loudest = Math.max(loudest, energies[i]);
  }
  const silence = loudest * 10 ** (-42 / 10);

  type Cand = { f: number; cost: number };
  const cands: Cand[][] = [];
  const d = new Float64Array(tauMax + 1);
  let lastYield = performance.now();
  for (let i = 0; i < frames; i++) {
    const list: Cand[] = [];
    cands.push(list);
    if (energies[i] < silence) continue;
    const start = Math.round(i * step) - Math.round((W + tauMax) / 2);
    // Difference function, then cumulative-mean normalised.
    d[0] = 1;
    let running = 0;
    for (let tau = 1; tau <= tauMax; tau++) {
      let sum = 0;
      for (let j = 0; j < W; j++) {
        const a = y[start + j] ?? 0;
        const b = y[start + j + tau] ?? 0;
        const diff = a - b;
        sum += diff * diff;
      }
      running += sum;
      d[tau] = running > 0 ? (sum * tau) / running : 1;
    }
    for (let tau = tauMin + 1; tau < tauMax; tau++) {
      if (d[tau] < d[tau - 1] && d[tau] <= d[tau + 1] && d[tau] < 0.75) {
        // Parabolic interpolation of the dip for a sub-sample period.
        const a = d[tau - 1], b = d[tau], c = d[tau + 1];
        const den = a - 2 * b + c;
        const shift = den > 0 ? (0.5 * (a - c)) / den : 0;
        list.push({ f: fs / (tau + shift), cost: b });
      }
    }
    list.sort((p, q) => p.cost - q.cost);
    list.length = Math.min(list.length, 5);
    if (performance.now() - lastYield > 40) {
      await yieldToUI();
      lastYield = performance.now();
    }
  }

  // Viterbi. State 0 is unvoiced; 1..k are that frame's candidates.
  // Creaky phrase ends score d' ≈ 0.5 and are still voice; fricatives sit near 1.
  const UNVOICED = 0.55;
  const SWITCH = 0.4;
  const OCTAVE = 1.6;
  let prevCost = [0];
  let prevF = [0];
  const back: number[][] = [];
  for (let i = 0; i < frames; i++) {
    const fs_ = [0, ...cands[i].map((c) => c.f)];
    const local = [energies[i] < silence ? 0 : UNVOICED, ...cands[i].map((c) => c.cost)];
    const cost: number[] = [];
    const from: number[] = [];
    for (let s = 0; s < fs_.length; s++) {
      let best = Infinity, arg = 0;
      for (let p = 0; p < prevF.length; p++) {
        let t = prevCost[p];
        const a = prevF[p], b = fs_[s];
        if ((a === 0) !== (b === 0)) t += SWITCH;
        else if (a > 0) t += OCTAVE * Math.abs(Math.log2(b / a));
        if (t < best) { best = t; arg = p; }
      }
      cost.push(best + local[s]);
      from.push(arg);
    }
    back.push(from);
    prevCost = cost;
    prevF = fs_;
  }
  const f0 = new Float32Array(frames);
  let s = prevCost.indexOf(Math.min(...prevCost));
  for (let i = frames - 1; i >= 0; i--) {
    f0[i] = s === 0 ? 0 : cands[i][s - 1].f;
    s = back[i][s];
  }

  // Voiced islands under 30 ms are almost always errors.
  for (let i = 0; i < frames; ) {
    if (!f0[i]) { i++; continue; }
    let j = i;
    while (j < frames && f0[j]) j++;
    if (j - i < 6) f0.fill(0, i, j);
    i = j;
  }
  // 3-point median inside voiced runs.
  const out = f0.slice();
  for (let i = 1; i < frames - 1; i++) {
    if (f0[i - 1] && f0[i] && f0[i + 1]) {
      out[i] = [f0[i - 1], f0[i], f0[i + 1]].sort((a, b) => a - b)[1];
    }
  }
  return out;
}

function highpass(x: Float32Array, fs: number, hz: number): Float32Array {
  const a = Math.exp((-2 * Math.PI * hz) / fs);
  const y = new Float32Array(x.length);
  let px = 0, py = 0;
  for (let i = 0; i < x.length; i++) {
    py = a * (py + x[i] - px);
    px = x[i];
    y[i] = py;
  }
  return y;
}

/** CheapTrick: the spectral envelope at `center`, as a per-sample PSD. */
function cheapTrick(
  x: Float32Array, fs: number, center: number, f0: number, n: number,
  re: Float64Array, im: Float64Array, power: Float64Array,
): Float32Array {
  const bins = n / 2 + 1;
  const f0floor = (3 * fs) / (n - 3);
  f0 = Math.max(f0, f0floor);
  const half = Math.round((1.5 * fs) / f0);

  // Pitch-adaptive Hann, three periods long, unit energy, DC removed.
  re.fill(0); im.fill(0);
  let wsum = 0, w2 = 0, xsum = 0;
  const win = new Float64Array(2 * half + 1);
  for (let k = -half; k <= half; k++) {
    const w = 0.5 * Math.cos((Math.PI * k) / (1.5 * fs / f0) ) + 0.5;
    win[k + half] = w;
    w2 += w * w;
  }
  const norm = 1 / Math.sqrt(w2);
  for (let k = -half; k <= half; k++) {
    const idx = Math.min(x.length - 1, Math.max(0, center + k));
    const w = win[k + half] * norm;
    win[k + half] = w;
    const v = x[idx] * w;
    re[k + half] = v;
    wsum += w;
    xsum += v;
  }
  const dc = xsum / wsum;
  for (let k = 0; k <= 2 * half; k++) re[k] -= win[k] * dc;

  fft(re, im);
  for (let k = 0; k < bins; k++) power[k] = re[k] * re[k] + im[k] * im[k];

  // DC correction: fold the mirror image below F0 back in.
  const df = fs / n;
  const limit = Math.floor(f0 / df) + 1;
  const replica = new Float64Array(limit);
  for (let k = 0; k < limit; k++) replica[k] = interp(power, (f0 - k * df) / df);
  for (let k = 0; k < limit; k++) power[k] += replica[k];

  // Linear smoothing: a rectangle 2/3·F0 wide, via a cumulative sum.
  const width = (2 * f0) / 3 / df;
  const ext = Math.ceil(width) + 2;
  const cum = new Float64Array(bins + 2 * ext + 1);
  for (let k = 0; k < bins + 2 * ext; k++) {
    const src = k - ext;
    const v = src < 0 ? power[-src] : src >= bins ? power[2 * (bins - 1) - src] : power[src];
    cum[k + 1] = cum[k] + v;
  }
  const smooth = new Float64Array(bins);
  for (let k = 0; k < bins; k++) {
    const hi = interp(cum, k + ext + width / 2 + 0.5);
    const lo = interp(cum, k + ext - width / 2 + 0.5);
    smooth[k] = (hi - lo) / width + 1e-12;
  }

  // Cepstral liftering: smooth away the harmonics, recover the peaks.
  re.fill(0); im.fill(0);
  for (let k = 0; k < bins; k++) re[k] = Math.log(smooth[k]);
  for (let k = 1; k < n / 2; k++) re[n - k] = re[k];
  fft(re, im, true);
  const q1 = -0.15;
  for (let q = 1; q <= n / 2; q++) {
    const z = (Math.PI * f0 * q) / fs;
    const lifter = (Math.sin(z) / z) * (1 - 2 * q1 + 2 * q1 * Math.cos((2 * Math.PI * q * f0) / fs));
    re[q] *= lifter;
    if (q < n / 2) re[n - q] *= lifter;
  }
  im.fill(0);
  fft(re, im);
  const out = new Float32Array(bins);
  for (let k = 0; k < bins; k++) out[k] = Math.exp(re[k]);
  return out;
}

function interp(a: ArrayLike<number>, pos: number): number {
  if (pos <= 0) return a[0];
  if (pos >= a.length - 1) return a[a.length - 1];
  const i = Math.floor(pos);
  const f = pos - i;
  return a[i] * (1 - f) + a[i + 1] * f;
}

/**
 * Per-band aperiodicity: how far each band's autocorrelation one period on
 * falls short of the window's own, from a ~3.5-period power spectrum.
 */
function aperiodicity(x: Float32Array, fs: number, center: number, f0: number): Float32Array {
  const T0 = fs / f0;
  const L = Math.round(3.5 * T0) | 1;
  const n = nextPow2(L + T0 + 1);
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  const half = (L - 1) / 2;
  let ww = 0, wlag = 0;
  const win = new Float64Array(L);
  for (let k = 0; k < L; k++) win[k] = 0.5 - 0.5 * Math.cos((2 * Math.PI * (k + 1)) / (L + 1));
  for (let k = 0; k < L; k++) {
    const idx = Math.min(x.length - 1, Math.max(0, center - half + k));
    re[k] = x[idx] * win[k];
    ww += win[k] * win[k];
  }
  // The window's own correlation at the (fractional) period, to unbias.
  const t = Math.floor(T0), frac = T0 - t;
  for (let k = 0; k < L; k++) {
    const a = k + t < L ? win[k + t] : 0;
    const b = k + t + 1 < L ? win[k + t + 1] : 0;
    wlag += win[k] * (a * (1 - frac) + b * frac);
  }
  const rho = wlag / ww;
  fft(re, im);
  const power = new Float64Array(n / 2 + 1);
  for (let k = 0; k <= n / 2; k++) power[k] = re[k] * re[k] + im[k] * im[k];
  const df = fs / n;
  const bands = AP_EDGES.length - 1;
  const out = new Float32Array(bands);
  for (let b = 0; b < bands; b++) {
    const lo = Math.max(1, Math.floor(AP_EDGES[b] / df));
    const hi = Math.min(n / 2, Math.floor(AP_EDGES[b + 1] / df));
    let den = 0;
    for (let k = lo; k <= hi; k++) den += power[k];
    // Best lag within ±4 % of the period: F0 drifts inside the window and the
    // estimate is not exact, and at the 10th harmonic either costs a lot.
    let best = 0;
    for (let s = -8; s <= 8; s++) {
      const lag = T0 * (1 + s * 0.005);
      // Σ P(k)·cos(2πk·lag/n), with the cosine from a rotating phasor.
      const w = (2 * Math.PI * lag) / n;
      const cr = Math.cos(w), ci = Math.sin(w);
      let pr = Math.cos(w * lo), pi = Math.sin(w * lo);
      let num = 0;
      for (let k = lo; k <= hi; k++) {
        num += power[k] * pr;
        const t = pr * cr - pi * ci;
        pi = pr * ci + pi * cr;
        pr = t;
      }
      best = Math.max(best, num);
    }
    const r = den > 0 ? Math.max(0, Math.min(1, best / den / rho)) : 0;
    out[b] = Math.max(0.001, (1 - r) * AP_CALIBRATION);
  }
  return out;
}

/** Three-frame average of voiced aperiodicity, in the log domain. */
function smoothAp(ap: Float32Array[], f0: Float32Array): void {
  const copy = ap.map((a) => a.slice());
  for (let i = 1; i < ap.length - 1; i++) {
    if (!f0[i]) continue;
    for (let b = 0; b < ap[i].length; b++) {
      const ns = [copy[i - 1][b], copy[i][b], copy[i + 1][b]].filter((_, j) => f0[i - 1 + j] > 0);
      ap[i][b] = Math.exp(ns.reduce((s, v) => s + Math.log(v), 0) / ns.length);
    }
  }
}

// ---------------------------------------------------------------------------
// Modification

const NOTE_A4 = 440;

/** The F0 contour after every pitch-domain effect, per frame. */
export function shapePitch(a: Analysis, p: VoiceParams): Float32Array {
  const out = new Float32Array(a.f0.length);
  const ref = a.medianF0 || 150;
  const frameRate = a.rate / a.hop;
  let glide = 0;
  for (let i = 0; i < out.length; i++) {
    const f = a.f0[i];
    if (!f || p.whisper) continue;
    let semis = 12 * Math.log2(f / ref);
    if (p.expressive !== undefined) semis *= p.expressive;
    let hz = p.monotone ?? ref * 2 ** (semis / 12);
    hz *= p.pitch ?? 1;
    if (p.tune) {
      const midi = 69 + 12 * Math.log2(hz / NOTE_A4);
      const target = nearestInScale(midi, p.tune.scale);
      // Glide toward the snapped note: notes are flat, transitions slurred.
      const alpha = 1 - Math.exp(-1 / ((p.tune.glideMs / 1000) * frameRate + 1e-9));
      glide = out[i - 1] ? glide + alpha * (target - glide) : target;
      const tuned = midi + p.tune.strength * (glide - midi);
      hz = NOTE_A4 * 2 ** ((tuned - 69) / 12);
    }
    if (p.vibrato) {
      const t = i / frameRate;
      hz *= 2 ** ((p.vibrato.cents / 1200) * Math.sin(2 * Math.PI * p.vibrato.rate * t));
    }
    out[i] = hz;
  }
  return out;
}

function nearestInScale(midi: number, scale: number[]): number {
  let best = Math.round(midi), dist = Infinity;
  for (let m = Math.floor(midi) - 2; m <= Math.ceil(midi) + 2; m++) {
    if (!scale.includes(((m % 12) + 12) % 12)) continue;
    if (Math.abs(m - midi) < dist) { dist = Math.abs(m - midi); best = m; }
  }
  return best;
}

/** The envelope as a different head would have produced it. */
function warp(env: Float32Array, alpha: number, tilt: number, df: number): Float64Array {
  const out = new Float64Array(env.length);
  for (let k = 0; k < env.length; k++) {
    let v = interp(env, k / alpha);
    if (tilt) {
      const f = k * df;
      if (f > 1000) v *= 10 ** ((tilt * Math.log2(f / 1000)) / 10);
    }
    out[k] = v;
  }
  return out;
}

/** Aperiodicity per bin from the band values (log-linear between band centres). */
function apSpectrum(bands: Float32Array, df: number, bins: number, breath: number): Float64Array {
  const centres = AP_EDGES.slice(0, -1).map((lo, i) => (lo + Math.min(AP_EDGES[i + 1], 12000)) / 2);
  const out = new Float64Array(bins);
  for (let k = 0; k < bins; k++) {
    const f = k * df;
    let v: number;
    if (f <= centres[0]) v = bands[0];
    else if (f >= centres[centres.length - 1]) v = bands[bands.length - 1];
    else {
      let b = 0;
      while (centres[b + 1] < f) b++;
      const t = (f - centres[b]) / (centres[b + 1] - centres[b]);
      v = Math.exp(Math.log(bands[b]) * (1 - t) + Math.log(bands[b + 1]) * t);
    }
    out[k] = breath >= 0 ? v + (1 - v) * breath : v * (1 + breath);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Synthesis

/** Causal minimum-phase impulse response with |H|² = `power`. */
function minPhase(power: Float64Array, n: number, re: Float64Array, im: Float64Array, keep: number): Float32Array {
  const bins = n / 2 + 1;
  re.fill(0); im.fill(0);
  for (let k = 0; k < bins; k++) re[k] = 0.5 * Math.log(power[k] + 1e-20);
  for (let k = 1; k < n / 2; k++) re[n - k] = re[k];
  fft(re, im, true);
  // Fold the cepstrum onto positive quefrencies.
  for (let q = 1; q < n / 2; q++) { re[q] *= 2; re[n - q] = 0; }
  im.fill(0);
  fft(re, im);
  for (let k = 0; k < n; k++) {
    const mag = Math.exp(re[k]);
    const ph = im[k];
    re[k] = mag * Math.cos(ph);
    im[k] = mag * Math.sin(ph);
  }
  fft(re, im, true);
  const out = new Float32Array(keep);
  const fade = Math.floor(keep / 8);
  for (let i = 0; i < keep; i++) {
    const g = i < keep - fade ? 1 : 0.5 + 0.5 * Math.cos((Math.PI * (i - (keep - fade))) / fade);
    out[i] = re[i] * g;
  }
  return out;
}

function rng(seed: number): () => number {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number): () => number {
  return () => Math.sqrt(-2 * Math.log(rand() + 1e-12)) * Math.cos(2 * Math.PI * rand());
}

export async function synthesise(a: Analysis, p: VoiceParams = {}): Promise<Audio> {
  const { rate, hop, n, bins } = a;
  const frames = a.f0.length;
  const df = rate / n;
  const f0 = shapePitch(a, p);
  const keep = Math.min(n / 2, Math.round(rate * RESPONSE_SECONDS));
  const out = new Float32Array(a.length + keep);
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  const randn = gaussian(rng(1234));

  // Per-frame filters, computed when first needed.
  const periodic: (Float32Array | undefined)[] = new Array(frames);
  const noisy: (Float32Array | undefined)[] = new Array(frames);
  const frameRate = rate / hop;
  const filters = (i: number) => {
    if (!noisy[i]) {
      let alpha = p.formant ?? 1;
      if (p.formantLfo) alpha *= 1 + p.formantLfo.depth * Math.sin((2 * Math.PI * p.formantLfo.rate * i) / frameRate);
      const env = warp(a.env[i], alpha, p.tilt ?? 0, df);
      const voiced = f0[i] > 0;
      const ap = voiced
        ? apSpectrum(a.ap[i], df, bins, p.breath ?? 0)
        : new Float64Array(bins).fill(1);
      const per = new Float64Array(bins);
      const ape = new Float64Array(bins);
      for (let k = 0; k < bins; k++) {
        per[k] = env[k] * (1 - ap[k]);
        ape[k] = env[k] * ap[k];
      }
      periodic[i] = voiced ? minPhase(per, n, re, im, keep) : undefined;
      noisy[i] = minPhase(ape, n, re, im, keep);
    }
    return { per: periodic[i], ape: noisy[i]! };
  };

  // Walk the output pulse by pulse. Unvoiced stretches still advance in
  // short segments so their noise follows the envelope.
  let pos = 0;
  let pulse = 0;
  let lastYield = performance.now();
  const noise = new Float32Array(Math.ceil(rate / F0_FLOOR) * 2);
  while (pos < a.length) {
    const i = Math.min(frames - 1, Math.round(pos / hop));
    const hz = f0[i];
    // Filters from the nearest even frame — unless that frame's voicing
    // differs, so an onset never borrows an unvoiced frame's filter.
    const j = Math.min(frames - 1, Math.round(i / FILTER_EVERY) * FILTER_EVERY);
    const fi = (f0[j] > 0) === (hz > 0) ? j : i;
    let period = hz > 0 ? rate / hz : rate / 200;
    if (hz > 0 && p.jitter) period *= 1 + p.jitter * randn();
    const T = Math.max(8, Math.round(period));
    const { per, ape } = filters(fi);

    if (per) {
      let g = Math.sqrt(T);
      if (p.shimmer) g *= Math.max(0, 1 + p.shimmer * randn());
      if (p.subharmonic) g *= pulse % 2 ? 1 - p.subharmonic : 1 + p.subharmonic;
      for (let k = 0; k < per.length && pos + k < out.length; k++) out[pos + k] += per[k] * g;
    }
    // A period of white noise, filtered: tiles into continuous coloured noise.
    for (let k = 0; k < T; k++) noise[k] = randn();
    const len = Math.min(out.length - pos, T + ape.length);
    for (let m = 0; m < len; m++) {
      let sum = 0;
      const lo = Math.max(0, m - ape.length + 1);
      const hi = Math.min(T - 1, m);
      for (let k = lo; k <= hi; k++) sum += noise[k] * ape[m - k];
      out[pos + m] += sum;
    }
    pos += T;
    pulse++;
    if (performance.now() - lastYield > 40) {
      await yieldToUI();
      lastYield = performance.now();
    }
  }
  return { samples: out.subarray(0, a.length).slice(), rate };
}

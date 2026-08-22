/** Bars drawn in the waveform strip. */
export const BAR_COUNT = 48;

/**
 * Milliseconds between appended peaks.
 *
 * `Recorder.onLevel` fires once per 128-frame render quantum — 125 times a
 * second at 16 kHz. Setting reactive state that often means 125 Lit updates a
 * second for an animation the eye reads fine at 20.
 */
export const FLUSH_MS = 50;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

/** An array of `count` zeroes — the strip at rest. */
export function silence(count: number): number[] {
  return new Array(Math.max(0, count)).fill(0);
}

/**
 * Fit a run of peaks to exactly `count` bars: bucket maximum when shrinking
 * (a peak that disappears is the one thing the eye would notice), nearest
 * neighbour when stretching, so a two-second clip fills the strip instead of
 * huddling at its left edge.
 */
export function resample(peaks: number[], count: number): number[] {
  if (count <= 0) {
    return [];
  }
  if (peaks.length === 0) {
    return silence(count);
  }
  const out: number[] = [];
  for (let bar = 0; bar < count; bar++) {
    const start = Math.floor((bar * peaks.length) / count);
    const end = Math.max(start + 1, Math.floor(((bar + 1) * peaks.length) / count));
    let max = 0;
    for (let index = start; index < end && index < peaks.length; index++) {
      max = Math.max(max, peaks[index]);
    }
    out.push(max);
  }
  return out;
}

/**
 * Scale a run so its loudest peak reaches full height. A message recorded
 * quietly is still a message; drawing it as a flat line reads as "nothing
 * recorded".
 */
export function normalize(peaks: number[]): number[] {
  const max = peaks.reduce((highest, peak) => Math.max(highest, peak), 0);
  if (max <= 0) {
    return [...peaks];
  }
  return peaks.map((peak) => peak / max);
}

/**
 * The peaks of one recording, accumulated while it runs.
 *
 * Doubles as the live view's source (its tail) and, once recording stops, as
 * the finished clip's waveform — so a fresh recording never needs decoding.
 */
export class LevelEnvelope {
  private peaks: number[] = [];
  private pending = 0;
  private windowStart?: number;

  get length(): number {
    return this.peaks.length;
  }

  /**
   * Fold one callback into the current window. Returns true when a peak was
   * appended, which is the caller's cue that the view changed — the other
   * ~5 calls in a window are absorbed silently.
   *
   * The window closes *before* the arriving level is folded in, so a peak
   * belongs to the window it happened in rather than bleeding into the one
   * that just ended.
   */
  push(level: number, now: number): boolean {
    if (this.windowStart === undefined) {
      this.windowStart = now;
      this.pending = clamp01(level);
      return false;
    }
    let appended = false;
    if (now - this.windowStart >= FLUSH_MS) {
      this.peaks.push(this.pending);
      this.pending = 0;
      this.windowStart = now;
      appended = true;
    }
    this.pending = Math.max(this.pending, clamp01(level));
    return appended;
  }

  reset(): void {
    this.peaks = [];
    this.pending = 0;
    this.windowStart = undefined;
  }

  all(): number[] {
    return [...this.peaks];
  }

  /** The newest `count` peaks, right-aligned, padded with silence. */
  tail(count: number): number[] {
    const recent = this.peaks.slice(-count);
    return [...silence(count - recent.length), ...recent];
  }

  /** The whole run fitted to `count` bars. */
  resampled(count: number): number[] {
    return resample(this.peaks, count);
  }
}

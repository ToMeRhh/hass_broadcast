# Voice Broadcast Card UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Lovelace card around a fixed, never-reflowing layout with push-to-talk recording, a waveform strip that doubles as a scrubber, in-card playback, three speaker-list styles, and history entries that load into the card instead of broadcasting immediately.

**Architecture:** The card stays a single custom element. Logic moves into small pure modules (`format.ts`, `levels.ts`, `clip.ts`) and rendering into pure functions under `src/ui/` that take props and return `TemplateResult`. The card element keeps the state machine and event wiring. A `Clip` value object replaces the loose `blob`/`duration`/`previewUrl` fields and carries where its audio came from, which is what lets a history entry behave exactly like a fresh recording.

**Tech Stack:** TypeScript, Lit 3, esbuild, vitest. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-22-card-ui-redesign-design.md`

## Global Constraints

- **No new npm dependencies.** esbuild, typescript, vitest, lit are what exist; keep it that way.
- **No Home Assistant frontend elements.** No `ha-icon`, `ha-switch`, `ha-select`. Plain HTML plus inline SVG only — the dev harness cannot render HA's elements, and the rule is what keeps the harness representative. `ha-card` is the one exception (the harness stubs it).
- **Tests run in plain Node, not jsdom.** `frontend/test/card.test.ts` stubs `window`, `URL.createObjectURL` and Web Audio by hand and renders through `renderedText()` from `frontend/test/helpers.ts`. Follow that pattern; do not add jsdom or change the vitest config.
- **The bundle is a committed build output.** Any change under `frontend/src/` requires `npm run build` and committing `custom_components/hass_broadcast/www/hass-broadcast-card.js` in the same commit. Task 11 does this once at the end; individual tasks do not rebuild.
- **Do not touch `manifest.json`.** The Release workflow owns the version bump.
- **Do not touch `custom_components/**/*.py`.** This is a frontend-only change. `.venv/bin/python -m pytest -q` must still pass untouched (54 tests).
- **Config key names, exactly:** `record_mode` with values `push_to_talk` | `start_stop`; `player_list` with values `rows` | `chips` | `dropdown`.
- **An absent `record_mode` means `push_to_talk`.** An absent `player_list` means `rows`.
- **Commit subjects follow Conventional Commits** (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
- **Every commit message ends with:**
  ```
  Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01VVZiRj3KcbJ77jnziW8u5t
  ```
- Run card tests with `npm test`. A single file: `npx vitest run frontend/test/levels.test.ts`.

---

## File Structure

| File | Status | Responsibility |
| --- | --- | --- |
| `frontend/src/format.ts` | create | `mm:ss` clock, relative history timestamps |
| `frontend/src/levels.ts` | create | peak coalescing, the recording envelope, resampling and normalising to a bar count |
| `frontend/src/clip.ts` | create | the `Clip` value object, loading a stored recording, decoding its waveform |
| `frontend/src/styles.ts` | create | the card's entire stylesheet |
| `frontend/src/ui/visualizer.ts` | create | the waveform strip (live tail, loaded waveform, playhead, seek) |
| `frontend/src/ui/player.ts` | create | the slim player row |
| `frontend/src/ui/targets.ts` | create | the three speaker-list styles |
| `frontend/src/ui/history.ts` | create | the recent-messages section |
| `frontend/src/card.ts` | modify | state machine, event wiring, composition |
| `frontend/src/editor.ts` | modify | two new config fields |
| `frontend/dev/mock-hass.ts` | modify | `mediaFails` scenario |
| `frontend/dev/main.ts` | modify | the new scenario toggle |
| `frontend/dev/README.md` | modify | document the new control |
| `frontend/test/*.test.ts` | create/modify | coverage per task |

---

### Task 1: Time formatting

**Files:**
- Create: `frontend/src/format.ts`
- Test: `frontend/test/format.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `formatClock(seconds: number): string`, `formatWhen(iso: string, now?: Date): string`.

- [ ] **Step 1: Write the failing test**

Create `frontend/test/format.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { formatClock, formatWhen } from "../src/format";

describe("formatClock", () => {
  it("renders seconds as m:ss", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(3.4)).toBe("0:03");
    expect(formatClock(62)).toBe("1:02");
    expect(formatClock(600)).toBe("10:00");
  });

  it("reads nonsense as zero rather than rendering NaN", () => {
    // The player shows this before any clip is loaded, where duration is
    // undefined-ish; "NaN:NaN" on a card is worse than an honest 0:00.
    expect(formatClock(Number.NaN)).toBe("0:00");
    expect(formatClock(-5)).toBe("0:00");
    expect(formatClock(Infinity)).toBe("0:00");
  });
});

describe("formatWhen", () => {
  const now = new Date("2026-08-22T14:30:00Z");

  it("names the recent past in words", () => {
    expect(formatWhen("2026-08-22T14:29:30Z", now)).toBe("Just now");
    expect(formatWhen("2026-08-22T14:29:00Z", now)).toBe("1 minute ago");
    expect(formatWhen("2026-08-22T14:00:00Z", now)).toBe("30 minutes ago");
  });

  it("switches to a clock time for today and yesterday", () => {
    // The time itself is locale- and timezone-dependent, so assert only the
    // prefix; the point is which bucket the timestamp fell into.
    expect(formatWhen("2026-08-22T09:00:00Z", now)).toMatch(/^Today /);
    expect(formatWhen("2026-08-21T09:00:00Z", now)).toMatch(/^Yesterday /);
  });

  it("falls back to a date further back", () => {
    const older = formatWhen("2026-08-01T09:00:00Z", now);
    expect(older).not.toMatch(/^(Today|Yesterday|Just now)/);
    expect(older).not.toBe("");
  });

  it("does not throw on an unparseable timestamp", () => {
    expect(formatWhen("not a date", now)).toBe("Unknown time");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run frontend/test/format.test.ts`
Expected: FAIL — `Failed to resolve import "../src/format"`.

- [ ] **Step 3: Write the implementation**

Create `frontend/src/format.ts`:

```ts
/** Wall-clock duration for the player and the history rows. */
export function formatClock(seconds: number): string {
  const total =
    Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, "0")}`;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function clock(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * How a history row names its timestamp. Recent entries read in words
 * because that is how someone thinks about a message they just left; older
 * ones get a time, and older still a date, because "3 days ago" stops being
 * useful once you are choosing between several.
 */
export function formatWhen(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) {
    return "Unknown time";
  }
  const seconds = (now.getTime() - then.getTime()) / 1000;
  if (seconds < 60) {
    return "Just now";
  }
  if (seconds < 3600) {
    const minutes = Math.round(seconds / 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (sameDay(then, now)) {
    return `Today ${clock(then)}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(then, yesterday)) {
    return `Yesterday ${clock(then)}`;
  }
  const date = then.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `${date} ${clock(then)}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run frontend/test/format.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/format.ts frontend/test/format.test.ts
git commit -m "$(cat <<'EOF'
feat(card): add clock and relative-time formatting

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VVZiRj3KcbJ77jnziW8u5t
EOF
)"
```

---

### Task 2: The level envelope

The recorder fires `onLevel` once per 128-frame render quantum — 125 times a second at 16 kHz, each one currently a Lit update. This module coalesces those into one peak per 50 ms and keeps the whole run, so that when recording stops the accumulated array *is* the clip's waveform and no decoding is needed.

**Files:**
- Create: `frontend/src/levels.ts`
- Test: `frontend/test/levels.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `BAR_COUNT: number` (48), `FLUSH_MS: number` (50), `class LevelEnvelope` with `push(level: number, now: number): boolean`, `reset(): void`, `all(): number[]`, `tail(count: number): number[]`, `resampled(count: number): number[]`, `get length(): number`; and free functions `resample(peaks: number[], count: number): number[]`, `normalize(peaks: number[]): number[]`, `silence(count: number): number[]`.

- [ ] **Step 1: Write the failing test**

Create `frontend/test/levels.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  BAR_COUNT,
  LevelEnvelope,
  normalize,
  resample,
  silence,
} from "../src/levels";

describe("LevelEnvelope", () => {
  it("coalesces the burst of callbacks into one peak per flush window", () => {
    const envelope = new LevelEnvelope();
    // The worklet fires every ~8ms; six of those fall inside one 50ms window.
    expect(envelope.push(0.1, 0)).toBe(false);
    expect(envelope.push(0.9, 8)).toBe(false);
    expect(envelope.push(0.3, 16)).toBe(false);
    // Crossing the window appends exactly one peak — the loudest seen.
    expect(envelope.push(0.2, 60)).toBe(true);
    expect(envelope.all()).toEqual([0.9]);
    expect(envelope.length).toBe(1);
  });

  it("starts a new window after each flush", () => {
    const envelope = new LevelEnvelope();
    envelope.push(0.5, 0);
    envelope.push(0.5, 60);
    envelope.push(0.8, 120);
    expect(envelope.all()).toEqual([0.5, 0.5]);
  });

  it("clamps levels into 0..1", () => {
    const envelope = new LevelEnvelope();
    envelope.push(4, 0);
    envelope.push(-1, 60);
    expect(envelope.all()).toEqual([1]);
  });

  it("right-aligns the live tail and pads the empty space with silence", () => {
    const envelope = new LevelEnvelope();
    [0.2, 0.4, 0.6].forEach((level, index) => envelope.push(level, index * 60));
    // Three pushes flush two peaks; the third is still pending.
    expect(envelope.tail(4)).toEqual([0, 0, 0.2, 0.4]);
  });

  it("keeps only the newest peaks when the tail is shorter than the run", () => {
    const envelope = new LevelEnvelope();
    [0.1, 0.2, 0.3, 0.4, 0.5].forEach((level, index) =>
      envelope.push(level, index * 60),
    );
    expect(envelope.tail(2)).toEqual([0.3, 0.4]);
  });

  it("empties on reset", () => {
    const envelope = new LevelEnvelope();
    envelope.push(0.5, 0);
    envelope.push(0.5, 60);
    envelope.reset();
    expect(envelope.all()).toEqual([]);
    // The window must reset too, or the first peak of the next take is eaten.
    expect(envelope.push(0.7, 1000)).toBe(false);
    expect(envelope.push(0.7, 1060)).toBe(true);
  });
});

describe("resample", () => {
  it("reduces a long run to the requested bar count, keeping the peaks", () => {
    const peaks = [0.1, 0.9, 0.2, 0.3, 0.8, 0.1];
    expect(resample(peaks, 3)).toEqual([0.9, 0.3, 0.8]);
  });

  it("stretches a short run so a one-second clip still fills the strip", () => {
    expect(resample([0.4, 0.8], 4)).toEqual([0.4, 0.4, 0.8, 0.8]);
  });

  it("returns silence for an empty run", () => {
    expect(resample([], 3)).toEqual([0, 0, 0]);
  });
});

describe("normalize", () => {
  it("scales the loudest peak to full height", () => {
    expect(normalize([0.1, 0.25, 0.05])).toEqual([0.4, 1, 0.2]);
  });

  it("leaves an all-silent run alone rather than dividing by zero", () => {
    expect(normalize([0, 0])).toEqual([0, 0]);
  });
});

describe("silence", () => {
  it("is the strip's resting state", () => {
    expect(silence(3)).toEqual([0, 0, 0]);
    expect(silence(BAR_COUNT)).toHaveLength(BAR_COUNT);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run frontend/test/levels.test.ts`
Expected: FAIL — `Failed to resolve import "../src/levels"`.

- [ ] **Step 3: Write the implementation**

Create `frontend/src/levels.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run frontend/test/levels.test.ts`
Expected: PASS, 11 tests.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/levels.ts frontend/test/levels.test.ts
git commit -m "$(cat <<'EOF'
feat(card): accumulate a level envelope for the waveform strip

Coalesces the worklet's 125 callbacks a second into one peak per 50ms, and
keeps the whole run so a finished recording needs no decoding to draw.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VVZiRj3KcbJ77jnziW8u5t
EOF
)"
```

---

### Task 3: The Clip model

**Files:**
- Create: `frontend/src/clip.ts`
- Test: `frontend/test/clip.test.ts`

**Interfaces:**
- Consumes: `BroadcastMessage` from `./api`; `BAR_COUNT`, `normalize`, `resample` from `./levels`.
- Produces:
  - `type ClipSource = { kind: "fresh"; blob: Blob } | { kind: "stored"; id: string }`
  - `interface Clip { source: ClipSource; url: string; duration: number; peaks: number[] }`
  - `freshClip(blob: Blob, duration: number, peaks: number[]): Clip`
  - `storedId(clip: Clip): string | undefined`
  - `type PeakDecoder = (blob: Blob, count: number) => Promise<number[]>`
  - `decodePeaks: PeakDecoder`
  - `loadStoredClip(hass: any, message: BroadcastMessage, decode?: PeakDecoder): Promise<Clip>`
  - `revokeClip(clip: Clip | undefined): void`

- [ ] **Step 1: Write the failing test**

Create `frontend/test/clip.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BAR_COUNT } from "../src/levels";
import {
  Clip,
  freshClip,
  loadStoredClip,
  revokeClip,
  storedId,
} from "../src/clip";

const message = {
  id: "abc123",
  created: "2026-08-22T10:00:00Z",
  duration: 4,
  can_delete: true,
  extension: "mp3",
};

const hass = { auth: { data: { access_token: "tok" } } };

describe("freshClip", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", { createObjectURL: () => "blob:fresh", revokeObjectURL: () => {} });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("carries its own audio, so broadcasting it has to upload first", () => {
    const blob = new Blob(["x"]);
    const clip = freshClip(blob, 3, [0.2, 0.8]);

    expect(clip.source).toEqual({ kind: "fresh", blob });
    expect(clip.duration).toBe(3);
    expect(clip.url).toBe("blob:fresh");
    expect(storedId(clip)).toBeUndefined();
    // Peaks are fitted to the strip and scaled up, so a quiet take still draws.
    expect(clip.peaks).toHaveLength(BAR_COUNT);
    expect(Math.max(...clip.peaks)).toBe(1);
  });
});

describe("storedId", () => {
  it("names the id a stored clip broadcasts directly", () => {
    const clip: Clip = {
      source: { kind: "stored", id: "abc123" },
      url: "blob:x",
      duration: 4,
      peaks: [],
    };
    expect(storedId(clip)).toBe("abc123");
  });
});

describe("loadStoredClip", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", { createObjectURL: () => "blob:stored", revokeObjectURL: () => {} });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("fetches the recording with the bearer token and keeps its id", async () => {
    const calls: any[] = [];
    vi.stubGlobal("fetch", async (url: string, init: any) => {
      calls.push([url, init]);
      return { ok: true, blob: async () => new Blob(["audio"]) };
    });

    const clip = await loadStoredClip(hass, message, async () => [0.5, 1]);

    // The media view is requires_auth, so a bare <audio src> would 401.
    expect(calls[0][0]).toBe("/api/hass_broadcast/media/abc123.mp3");
    expect(calls[0][1].headers.Authorization).toBe("Bearer tok");
    expect(clip.source).toEqual({ kind: "stored", id: "abc123" });
    expect(clip.duration).toBe(4);
    expect(clip.url).toBe("blob:stored");
    expect(clip.peaks).toEqual([0.5, 1]);
  });

  it("throws a message worth showing when the fetch fails", async () => {
    vi.stubGlobal("fetch", async () => ({ ok: false, status: 404 }));

    await expect(loadStoredClip(hass, message, async () => [])).rejects.toThrow(
      /404/,
    );
  });

  it("still loads a playable clip when the audio cannot be decoded", async () => {
    vi.stubGlobal("fetch", async () => ({
      ok: true,
      blob: async () => new Blob(["audio"]),
    }));

    const clip = await loadStoredClip(hass, message, async () => {
      throw new Error("unsupported codec");
    });

    // No waveform, but playback and seeking still work — losing the drawing
    // must not lose the message.
    expect(clip.peaks).toEqual([]);
    expect(clip.url).toBe("blob:stored");
  });
});

describe("revokeClip", () => {
  it("releases the object URL, and tolerates having nothing to release", () => {
    const revoked: string[] = [];
    vi.stubGlobal("URL", {
      createObjectURL: () => "blob:x",
      revokeObjectURL: (url: string) => revoked.push(url),
    });

    revokeClip(undefined);
    revokeClip({ source: { kind: "stored", id: "a" }, url: "blob:x", duration: 1, peaks: [] });

    expect(revoked).toEqual(["blob:x"]);
    vi.unstubAllGlobals();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run frontend/test/clip.test.ts`
Expected: FAIL — `Failed to resolve import "../src/clip"`.

- [ ] **Step 3: Write the implementation**

Create `frontend/src/clip.ts`:

```ts
import { BroadcastMessage } from "./api";
import { BAR_COUNT, normalize, resample } from "./levels";

/**
 * Where a loaded clip's audio came from, which is the only thing that
 * differs between a message just recorded and one picked from history: a
 * fresh one has to be uploaded before it can be broadcast, a stored one is
 * already on the server and must never be uploaded again.
 */
export type ClipSource =
  | { kind: "fresh"; blob: Blob }
  | { kind: "stored"; id: string };

/** The single recording the card currently holds. */
export interface Clip {
  source: ClipSource;
  /** Object URL for the in-card player. Revoke it when the clip is replaced. */
  url: string;
  duration: number;
  /** Waveform, one value per bar, 0..1. Empty when it could not be derived. */
  peaks: number[];
}

/** Turn a just-finished recording into a clip, using the levels we captured. */
export function freshClip(
  blob: Blob,
  duration: number,
  peaks: number[],
): Clip {
  return {
    source: { kind: "fresh", blob },
    url: URL.createObjectURL(blob),
    duration,
    peaks: normalize(resample(peaks, BAR_COUNT)),
  };
}

/** The message id a stored clip broadcasts directly, or undefined if fresh. */
export function storedId(clip: Clip): string | undefined {
  return clip.source.kind === "stored" ? clip.source.id : undefined;
}

export type PeakDecoder = (blob: Blob, count: number) => Promise<number[]>;

/**
 * Reduce encoded audio to one peak per bar.
 *
 * Used only for clips loaded from history: a fresh recording already has an
 * envelope from the level callbacks. Goes through `decodeAudioData` because
 * the integration transcodes uploads to MP3 when ffmpeg is available, so the
 * bytes are not necessarily the WAV the card produced.
 */
export const decodePeaks: PeakDecoder = async (blob, count) => {
  const Ctor =
    (globalThis as any).AudioContext ?? (globalThis as any).webkitAudioContext;
  if (!Ctor) {
    return [];
  }
  const context = new Ctor();
  try {
    const buffer = await context.decodeAudioData(await blob.arrayBuffer());
    const samples: Float32Array = buffer.getChannelData(0);
    const peaks: number[] = [];
    for (let bar = 0; bar < count; bar++) {
      const start = Math.floor((bar * samples.length) / count);
      const end = Math.floor(((bar + 1) * samples.length) / count);
      let max = 0;
      for (let index = start; index < end; index++) {
        max = Math.max(max, Math.abs(samples[index]));
      }
      peaks.push(max);
    }
    return normalize(peaks);
  } finally {
    // An AudioContext held open per history click would exhaust the browser's
    // limit after a few dozen loads.
    await context.close?.();
  }
};

/**
 * Load a stored recording into the card so it behaves like one just made.
 *
 * The media view is `requires_auth`, so pointing an `<audio>` at its URL
 * answers 401 — the bytes are fetched with the same bearer token the upload
 * uses and served to the player from an object URL.
 */
export async function loadStoredClip(
  hass: any,
  message: BroadcastMessage,
  decode: PeakDecoder = decodePeaks,
): Promise<Clip> {
  const response = await fetch(
    `/api/hass_broadcast/media/${message.id}.${message.extension}`,
    { headers: { Authorization: `Bearer ${hass.auth.data.access_token}` } },
  );
  if (!response.ok) {
    throw new Error(`Could not load that recording (${response.status})`);
  }
  const blob = await response.blob();
  let peaks: number[] = [];
  try {
    peaks = await decode(blob, BAR_COUNT);
  } catch {
    // A waveform we cannot draw is a cosmetic loss; the clip still plays and
    // still broadcasts, which is what the user asked for.
    peaks = [];
  }
  return {
    source: { kind: "stored", id: message.id },
    url: URL.createObjectURL(blob),
    duration: message.duration,
    peaks,
  };
}

/** Release a clip's object URL. Safe to call with nothing loaded. */
export function revokeClip(clip: Clip | undefined): void {
  if (clip) {
    URL.revokeObjectURL(clip.url);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run frontend/test/clip.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/clip.ts frontend/test/clip.test.ts
git commit -m "$(cat <<'EOF'
feat(card): model the loaded clip and its source

A clip knows whether its audio is a fresh blob or an id already on the
server, which is what lets a history entry behave exactly like a new
recording without ever being re-uploaded.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VVZiRj3KcbJ77jnziW8u5t
EOF
)"
```

---

### Task 4: The card adopts Clip

Swaps the card's loose `blob` / `duration` / `previewUrl` / `phase: "preview"` state for a single `clip`, and makes broadcasting resolve its message id from the clip's source. No visual change yet — this is the state-machine move, done on its own so the UI tasks that follow are pure rendering.

Behaviour changes here, all from the spec: `phase` loses `"preview"` (a loaded clip is orthogonal to the phase); `error` becomes `status`; a clip survives a successful broadcast instead of being discarded; `replay()` is deleted.

**Files:**
- Modify: `frontend/src/card.ts`
- Modify: `frontend/test/card.test.ts`

**Interfaces:**
- Consumes: `Clip`, `freshClip`, `loadStoredClip`, `revokeClip`, `storedId` from `./clip`; `LevelEnvelope`, `BAR_COUNT` from `./levels`.
- Produces (on the card element, used by later tasks): `clip?: Clip`, `phase: "idle" | "recording" | "sending"`, `status?: { kind: "error" | "info"; text: string }`, `envelope: LevelEnvelope`, `canBroadcast: boolean`, `broadcast(): Promise<void>`, `clearClip(): void`, `loadMessage(message: BroadcastMessage): Promise<void>`.

- [ ] **Step 1: Write the failing tests**

In `frontend/test/card.test.ts`, replace the whole `describe("card send results", ...)` block with:

```ts
describe("card broadcasting", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /** A card holding a fresh recording, ready to send to two speakers. */
  function cardWithClip(response: any): { card: any; calls: any[]; uploads: number } {
    const calls: any[] = [];
    const counter = { uploads: 0 };
    const card = newCard();
    card.setConfig({ type: "custom:hass-broadcast-card", show_history: false });
    card.clip = {
      source: { kind: "fresh", blob: new Blob(["x"]) },
      url: "blob:preview",
      duration: 2,
      peaks: [],
    };
    card.selected = ["media_player.kitchen", "media_player.broken"];
    card.hass = {
      auth: { data: { access_token: "tok" } },
      states: {
        "media_player.broken": { attributes: { friendly_name: "Garage" } },
      },
      callService: async (...args: any[]) => {
        calls.push(args);
        return response;
      },
    };
    vi.stubGlobal("fetch", async () => {
      counter.uploads += 1;
      return { ok: true, json: async () => ({ message_id: "abc" }) };
    });
    return { card, calls, get uploads() { return counter.uploads; } } as any;
  }

  it("keeps the clip loaded after every target played", async () => {
    const { card } = cardWithClip({ response: { failed: [] } });

    await card.broadcast();

    // Discarding on success would make "send it to the bedroom too" a
    // re-record; the clip stays and Broadcast stays enabled.
    expect(card.phase).toBe("idle");
    expect(card.clip).toBeDefined();
    expect(card.status.kind).toBe("info");
  });

  it("uploads a fresh clip once and reuses the id on retry", async () => {
    const state = cardWithClip({ response: { failed: ["media_player.broken"] } });

    await state.card.broadcast();
    expect(state.uploads).toBe(1);
    // The first send stored the returned id on the clip.
    expect(state.card.clip.source).toEqual({ kind: "stored", id: "abc" });

    await state.card.broadcast();
    expect(state.uploads).toBe(1);
    expect(state.calls[1][2].message_id).toBe("abc");
  });

  it("broadcasts a stored clip without uploading anything", async () => {
    const state = cardWithClip({ response: { failed: [] } });
    state.card.clip = {
      source: { kind: "stored", id: "from-history" },
      url: "blob:preview",
      duration: 4,
      peaks: [],
    };

    await state.card.broadcast();

    expect(state.uploads).toBe(0);
    expect(state.calls[0][2].message_id).toBe("from-history");
  });

  it("warns about the failed targets and keeps the clip on partial failure", async () => {
    const { card } = cardWithClip({
      response: { failed: ["media_player.broken"] },
    });

    await card.broadcast();

    // Naming the target matters: "it worked" for a message half the house
    // never heard is the failure mode this exists to prevent.
    expect(card.status.kind).toBe("error");
    expect(card.status.text).toMatch(/Garage/);
    expect(card.phase).toBe("idle");
    expect(card.clip).toBeDefined();
  });

  it("treats a total failure like a send error and keeps the clip", async () => {
    const { card } = cardWithClip({
      response: { failed: ["media_player.kitchen", "media_player.broken"] },
    });

    await card.broadcast();

    expect(card.status.text).toMatch(/Could not play on any speaker/);
    expect(card.clip).toBeDefined();
  });

  it("cannot broadcast with nothing loaded or nobody selected", () => {
    const { card } = cardWithClip({ response: { failed: [] } });
    expect(card.canBroadcast).toBe(true);

    card.selected = [];
    expect(card.canBroadcast).toBe(false);

    card.selected = ["media_player.kitchen"];
    card.clip = undefined;
    expect(card.canBroadcast).toBe(false);
  });
});

describe("card loading a message from history", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const stored = {
    id: "abc123",
    created: "2026-08-22T10:00:00Z",
    duration: 4,
    can_delete: true,
    extension: "wav",
  };

  function cardForLoading(): any {
    const card = newCard();
    card.setConfig({ type: "custom:hass-broadcast-card" });
    card.hass = { auth: { data: { access_token: "tok" } }, states: {} };
    return card;
  }

  it("loads it in place of an un-broadcast recording", async () => {
    const revoked: string[] = [];
    vi.stubGlobal("URL", {
      createObjectURL: () => "blob:stored",
      revokeObjectURL: (url: string) => revoked.push(url),
    });
    vi.stubGlobal("fetch", async () => ({
      ok: true,
      blob: async () => new Blob(["audio"]),
    }));
    const card = cardForLoading();
    card.clip = {
      source: { kind: "fresh", blob: new Blob(["x"]) },
      url: "blob:fresh",
      duration: 2,
      peaks: [],
    };

    await card.loadMessage(stored);

    expect(card.clip.source).toEqual({ kind: "stored", id: "abc123" });
    expect(card.clip.duration).toBe(4);
    // The replaced recording's object URL is released, not leaked.
    expect(revoked).toEqual(["blob:fresh"]);
  });

  it("keeps the current clip when loading fails", async () => {
    vi.stubGlobal("URL", { createObjectURL: () => "blob:x", revokeObjectURL: () => {} });
    vi.stubGlobal("fetch", async () => ({ ok: false, status: 404 }));
    const card = cardForLoading();
    const existing = {
      source: { kind: "fresh" as const, blob: new Blob(["x"]) },
      url: "blob:fresh",
      duration: 2,
      peaks: [],
    };
    card.clip = existing;

    await card.loadMessage(stored);

    expect(card.clip).toBe(existing);
    expect(card.status.kind).toBe("error");
    expect(card.status.text).toMatch(/404/);
  });
});
```

Also update the two existing tests that name the old fields:

- In `"goes idle -> recording -> preview -> idle"`: rename to `"goes idle -> recording -> loaded -> idle"` and replace the assertions after `stopRecording()` with:

```ts
    await card.stopRecording();
    expect(card.phase).toBe("idle");
    expect(card.clip.source.kind).toBe("fresh");
    expect(card.clip.duration).toBe(2);
    expect(card.clip.url).toBe("blob:preview");

    card.clearClip();
    expect(card.clip).toBeUndefined();
```

- In `"counts elapsed seconds and auto-stops at the configured maximum"`, change the final assertion from `expect(card.phase).toBe("preview")` to:

```ts
    expect(card.phase).toBe("idle");
    expect(card.clip).toBeDefined();
```

- In the three tests asserting `card.error`, change to `card.status.text` (`"names the HTTPS requirement..."` asserts `card.status.text` equals `INSECURE_CONTEXT_MESSAGE`).
- In `describe("card speaker filtering")`, the two `send()` tests become `broadcast()`, and `card.blob = new Blob(["x"]); card.duration = 2;` becomes:

```ts
    card.clip = {
      source: { kind: "fresh", blob: new Blob(["x"]) },
      url: "blob:preview",
      duration: 2,
      peaks: [],
    };
```

with `expect(card.error).toMatch(/Pick at least one speaker/)` becoming `expect(card.status.text).toMatch(/Pick at least one speaker/)`.

- Delete the test `"reports failed targets when replaying from history"` — `replay()` no longer exists; loading and broadcasting are now separate steps, covered above.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run frontend/test/card.test.ts`
Expected: FAIL — `card.broadcast is not a function`, `card.clip` undefined, `card.status` undefined.

- [ ] **Step 3: Rewrite the card's state**

In `frontend/src/card.ts`:

Add to the imports:

```ts
import {
  Clip,
  freshClip,
  loadStoredClip,
  revokeClip,
  storedId,
} from "./clip";
import { BAR_COUNT, LevelEnvelope } from "./levels";
```

Add `record_mode` and `player_list` to `CardConfig` (used from Task 7 and Task 8, declared here so the interface is written once):

```ts
  /** How the record button behaves. Absent means push-to-talk. */
  record_mode?: "push_to_talk" | "start_stop";
  /** Which speaker-list style the card draws. Absent means rows. */
  player_list?: "rows" | "chips" | "dropdown";
```

Replace the `Phase` type and the state block:

```ts
type Phase = "idle" | "recording" | "sending";

/** What the status line is saying, and whether it reads as a problem. */
interface Status {
  kind: "error" | "info";
  text: string;
}
```

```ts
  @property({ attribute: false }) hass?: any;
  @state() private config: CardConfig = { type: "" };
  @state() private phase: Phase = "idle";
  @state() private elapsed = 0;
  @state() private status?: Status;
  @state() private selected: string[] = [];
  @state() private history: BroadcastMessage[] = [];
  @state() private clip?: Clip;
  /** Bars the strip draws right now: live tail, loaded waveform, or silence. */
  @state() private bars: number[] = [];
  /** The history row currently being fetched, for its pending state. */
  @state() private loadingId?: string;

  private recorder = new Recorder();
  private envelope = new LevelEnvelope();
  private timer?: number;
```

Delete the `blob`, `duration` and `previewUrl` fields and every reference to them. Keep `busy` and `disconnected` and their comments verbatim — those guards are load-bearing and Task 7 extends them.

Replace `startRecording`'s level callback and reset:

```ts
      this.recorder.onLevel((level) => {
        if (this.envelope.push(level, Date.now())) {
          this.bars = this.envelope.tail(BAR_COUNT);
        }
      });
```

and immediately before `await this.recorder.start()`, add `this.envelope.reset();`.

Replace `stopRecording`'s success branch:

```ts
      const { blob, duration } = await this.recorder.stop();
      this.setClip(freshClip(blob, duration, this.envelope.all()));
      this.phase = "idle";
```

and its catch branch's `this.error = ...` with `this.fail(\`Could not finish recording: ${err?.message ?? err}\`)`.

Replace `discard()` with:

```ts
  /** Swap in a new clip, releasing the one it replaces. */
  private setClip(clip: Clip): void {
    if (this.clip && this.clip !== clip) {
      revokeClip(this.clip);
    }
    this.clip = clip;
    this.bars = clip.peaks.length ? clip.peaks : [];
  }

  private clearClip(): void {
    revokeClip(this.clip);
    this.clip = undefined;
    this.bars = [];
  }

  private fail(text: string): void {
    this.status = { kind: "error", text };
  }
```

Update `disconnectedCallback` to call `revokeClip(this.clip)` in place of the `previewUrl` revoke, and `connectedCallback`'s insecure branch to `this.status = { kind: "error", text: INSECURE_CONTEXT_MESSAGE }`.

Replace `send()` with `broadcast()`, and delete `replay()`:

```ts
  private get canBroadcast(): boolean {
    return (
      this.clip !== undefined &&
      this.targets.length > 0 &&
      this.phase !== "sending"
    );
  }

  /**
   * The id to broadcast. A fresh clip is uploaded once and then *becomes* a
   * stored clip, so retrying a partial failure — or sending the same message
   * to another speaker — never uploads a second copy.
   */
  private async messageId(clip: Clip): Promise<string> {
    const existing = storedId(clip);
    if (existing !== undefined) {
      return existing;
    }
    const blob = (clip.source as { kind: "fresh"; blob: Blob }).blob;
    const id = await uploadRecording(this.hass, blob, clip.duration);
    this.clip = { ...clip, source: { kind: "stored", id } };
    return id;
  }

  private async broadcast(): Promise<void> {
    const clip = this.clip;
    if (!clip) {
      this.fail("Record a message or pick one from below first.");
      return;
    }
    const targets = this.targets;
    if (targets.length === 0) {
      this.fail("Pick at least one speaker first.");
      return;
    }
    this.phase = "sending";
    this.status = undefined;
    try {
      const id = await this.messageId(clip);
      const { failed } = await sendBroadcast(
        this.hass,
        id,
        targets,
        this.config.mode ?? "plain",
      );
      this.phase = "idle";
      if (failed.length === 0) {
        this.status = { kind: "info", text: `Sent to ${this.describe(targets)}` };
      } else if (failed.length >= targets.length) {
        // The clip is kept in every branch now, so the old "the recording was
        // kept" reassurance is gone — nothing is ever thrown away here.
        this.fail(`Could not play on any speaker: ${this.describe(failed)}.`);
      } else {
        this.fail(`Played, but not on ${this.describe(failed)}.`);
      }
      await this.refreshHistory();
    } catch (err: any) {
      this.phase = "idle";
      this.fail(`Could not send: ${err?.message ?? err}`);
    }
  }

  /** Load a stored message so it behaves exactly like one just recorded. */
  private async loadMessage(message: BroadcastMessage): Promise<void> {
    this.loadingId = message.id;
    this.status = undefined;
    try {
      this.setClip(await loadStoredClip(this.hass, message));
    } catch (err: any) {
      this.fail(err?.message ?? String(err));
    } finally {
      this.loadingId = undefined;
    }
  }
```

In `render()`, replace `${this.error ? ...}` with `${this.status ? html`<div class="status ${this.status.kind}">${this.status.text}</div>` : nothing}`, replace the `phase === "preview"` block's `<audio controls>` + Send/Discard with a temporary equivalent (Task 6 replaces it properly):

```ts
        ${this.clip
          ? html`
              <div class="actions">
                <button class="action send" @click=${this.broadcast}>Broadcast</button>
                <button class="action discard" @click=${this.clearClip}>Clear</button>
              </div>
            `
          : nothing}
```

and change the history rows' `Play` button to `@click=${() => this.loadMessage(message)}` with the label `Load`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS. Card tests reflect the new fields; `players.test.ts`, `editor.test.ts`, `api.test.ts`, `recorder.test.ts`, `wav.test.ts`, `errors.test.ts` unchanged and still green.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/card.ts frontend/test/card.test.ts
git commit -m "$(cat <<'EOF'
refactor(card): hold one Clip instead of loose recording fields

A clip now carries where its audio came from, so broadcasting resolves an
id rather than always uploading, a clip survives a successful send, and a
history entry can be loaded into the same state a recording produces.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VVZiRj3KcbJ77jnziW8u5t
EOF
)"
```

---

### Task 5: Stylesheet and the waveform strip

**Files:**
- Create: `frontend/src/styles.ts`
- Create: `frontend/src/ui/visualizer.ts`
- Modify: `frontend/src/card.ts`
- Test: `frontend/test/visualizer.test.ts`

**Interfaces:**
- Consumes: `BAR_COUNT`, `silence` from `../levels`.
- Produces: `cardStyles: CSSResult` from `./styles`; `visualizer(props: VisualizerProps): TemplateResult` and `interface VisualizerProps { bars: number[]; progress?: number; seekable: boolean; onSeek: (fraction: number) => void }` from `./ui/visualizer`.

- [ ] **Step 1: Write the failing test**

Create `frontend/test/visualizer.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { renderedText } from "./helpers";
import { BAR_COUNT, silence } from "../src/levels";
import { visualizer } from "../src/ui/visualizer";

describe("visualizer", () => {
  it("draws one bar per value, at a minimum height so silence still reads", () => {
    const html = renderedText(
      visualizer({ bars: [0, 0.5, 1], seekable: false, onSeek: () => {} }),
    );

    expect(html.match(/height:/g)).toHaveLength(3);
    // A zero bar is drawn as a baseline dot, never as nothing at all.
    expect(html).toContain("height:2%");
    expect(html).toContain("height:100%");
  });

  it("fills the bars behind the playhead and dims the rest", () => {
    const html = renderedText(
      visualizer({
        bars: [0.5, 0.5, 0.5, 0.5],
        progress: 0.5,
        seekable: true,
        onSeek: () => {},
      }),
    );

    expect(html.match(/bar played/g)).toHaveLength(2);
  });

  it("marks itself seekable only when there is something to seek", () => {
    const idle = renderedText(
      visualizer({ bars: silence(BAR_COUNT), seekable: false, onSeek: () => {} }),
    );
    const loaded = renderedText(
      visualizer({ bars: silence(BAR_COUNT), seekable: true, onSeek: () => {} }),
    );

    expect(idle).not.toContain("seekable");
    expect(loaded).toContain("seekable");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run frontend/test/visualizer.test.ts`
Expected: FAIL — `Failed to resolve import "../src/ui/visualizer"`.

- [ ] **Step 3: Write the stylesheet and the strip**

Create `frontend/src/styles.ts`. This is the card's whole stylesheet; later tasks add to it rather than creating new ones.

```ts
import { css } from "lit";

/**
 * The card's stylesheet.
 *
 * The organising rule: every region has a fixed height and is always
 * rendered. Recording, listening back and broadcasting change content and
 * enabled-state, never layout — a card that jumps under your thumb while a
 * message is loading is the thing this redesign exists to remove.
 */
export const cardStyles = css`
  ha-card {
    padding: 16px;
  }

  /* --- status line ------------------------------------------------ */
  .status {
    min-height: 20px;
    font-size: 0.85em;
    line-height: 20px;
    text-align: center;
    margin-bottom: 4px;
  }
  .status.error {
    color: var(--error-color, #db4437);
  }
  .status.info {
    color: var(--secondary-text-color);
  }

  /* --- waveform strip --------------------------------------------- */
  .wave {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2px;
    height: 64px;
    padding: 0 4px;
    border-radius: 10px;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    touch-action: none;
  }
  .wave.seekable {
    cursor: pointer;
  }
  .bar {
    flex: 1;
    min-width: 2px;
    border-radius: 2px;
    /* Centred in a flex row, so a bar of height h reads as mirrored around
       the middle without drawing two of them. */
    background: var(--divider-color, #ddd);
    transition: height 80ms linear;
  }
  .bar.live,
  .bar.played {
    background: var(--primary-color, #03a9f4);
  }
`;
```

Create `frontend/src/ui/visualizer.ts`:

```ts
import { TemplateResult, html } from "lit";

export interface VisualizerProps {
  /** One value per bar, 0..1. */
  bars: number[];
  /** Playhead position 0..1, or undefined when nothing is loaded. */
  progress?: number;
  /** True when a clip is loaded and the strip can be scrubbed. */
  seekable: boolean;
  onSeek: (fraction: number) => void;
}

/** Where along the strip a pointer landed, 0..1. */
function fractionOf(event: PointerEvent): number {
  const element = event.currentTarget as HTMLElement;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
}

/**
 * The strip: a live scrolling tail while recording, the loaded clip's
 * waveform with a playhead otherwise, and a flat baseline when idle. One
 * element for all three, because the alternative is a card that swaps
 * elements — and therefore heights — under the user.
 */
export function visualizer(props: VisualizerProps): TemplateResult {
  const played = (index: number) =>
    props.progress !== undefined && index / props.bars.length < props.progress;
  return html`
    <div
      class="wave ${props.seekable ? "seekable" : ""}"
      @pointerdown=${(event: PointerEvent) => {
        if (props.seekable) {
          props.onSeek(fractionOf(event));
        }
      }}
    >
      ${props.bars.map(
        (value, index) => html`
          <div
            class="bar ${played(index)
              ? "played"
              : props.progress === undefined
                ? "live"
                : ""}"
            style="height:${Math.max(2, Math.round(value * 100))}%"
          ></div>
        `,
      )}
    </div>
  `;
}
```

In `frontend/src/card.ts`: import `cardStyles` and `visualizer`, replace the whole `static styles = css\`...\`` block with `static styles = cardStyles;`, drop the now-unused `css` import, and replace the `.row` block in `render()` with:

```ts
        ${visualizer({
          bars: this.bars.length ? this.bars : silence(BAR_COUNT),
          progress: this.clip ? this.position / (this.clip.duration || 1) : undefined,
          seekable: this.clip !== undefined,
          onSeek: (fraction) => this.seek(fraction),
        })}
```

Add the two members it references (the player itself arrives in Task 6):

```ts
  @state() private position = 0;

  private seek(fraction: number): void {
    if (this.clip) {
      this.position = fraction * this.clip.duration;
    }
  }
```

Import `silence` alongside `BAR_COUNT`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS. The visualizer's 3 tests are new; the card tests still pass (they assert state, not markup, except the history/title tests which are unaffected).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/styles.ts frontend/src/ui/visualizer.ts frontend/src/card.ts frontend/test/visualizer.test.ts
git commit -m "$(cat <<'EOF'
feat(card): draw a waveform strip in place of the level bar

One fixed-height element covers all three states — live tail, loaded
waveform with a playhead, and a resting baseline — so nothing in the card
resizes as it moves between them.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VVZiRj3KcbJ77jnziW8u5t
EOF
)"
```

---

### Task 6: The in-card player

Replaces the browser's `<audio controls>` — which appeared only after recording and changed the card's height when it did — with a slim row that is always present and disabled when nothing is loaded.

**Files:**
- Create: `frontend/src/ui/player.ts`
- Modify: `frontend/src/styles.ts`
- Modify: `frontend/src/card.ts`
- Test: `frontend/test/player.test.ts`

**Interfaces:**
- Consumes: `formatClock` from `../format`.
- Produces: `playerRow(props: PlayerProps): TemplateResult` and `interface PlayerProps { enabled: boolean; playing: boolean; position: number; duration: number; onToggle: () => void; onClear: () => void }`.

- [ ] **Step 1: Write the failing test**

Create `frontend/test/player.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { renderedText } from "./helpers";
import { playerRow } from "../src/ui/player";

const base = {
  enabled: true,
  playing: false,
  position: 0,
  duration: 8,
  onToggle: () => {},
  onClear: () => {},
};

describe("playerRow", () => {
  it("is rendered even with nothing loaded, so the card cannot jump", () => {
    const html = renderedText(playerRow({ ...base, enabled: false, duration: 0 }));

    expect(html).toContain("0:00 / 0:00");
    expect(html).toContain("Play");
  });

  it("shows position against duration", () => {
    expect(renderedText(playerRow({ ...base, position: 3.4 }))).toContain(
      "0:03 / 0:08",
    );
  });

  it("offers pause while playing", () => {
    const html = renderedText(playerRow({ ...base, playing: true }));

    expect(html).toContain("Pause");
    expect(html).not.toContain(">Play<");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run frontend/test/player.test.ts`
Expected: FAIL — `Failed to resolve import "../src/ui/player"`.

- [ ] **Step 3: Write the player row, its styles, and the card's audio wiring**

Create `frontend/src/ui/player.ts`:

```ts
import { TemplateResult, html, svg } from "lit";

import { formatClock } from "../format";

export interface PlayerProps {
  /** False when no clip is loaded: the row still renders, greyed. */
  enabled: boolean;
  playing: boolean;
  position: number;
  duration: number;
  onToggle: () => void;
  onClear: () => void;
}

const playIcon = svg`<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
  <path fill="currentColor" d="M8 5v14l11-7z" />
</svg>`;

const pauseIcon = svg`<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
  <path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z" />
</svg>`;

const clearIcon = svg`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
  <path fill="currentColor" d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z" />
</svg>`;

/**
 * Play, position and clear for the loaded clip.
 *
 * Deliberately not `<audio controls>`: the browser's player only appeared
 * once something had been recorded, which moved everything below it, and it
 * looks nothing like the rest of a Home Assistant dashboard.
 */
export function playerRow(props: PlayerProps): TemplateResult {
  const label = props.playing ? "Pause" : "Play";
  return html`
    <div class="player" data-enabled=${props.enabled}>
      <button
        class="icon"
        ?disabled=${!props.enabled}
        title=${label}
        aria-label=${label}
        @click=${props.onToggle}
      >
        ${props.playing ? pauseIcon : playIcon}
      </button>
      <span class="time"
        >${formatClock(props.position)} / ${formatClock(props.duration)}</span
      >
      <button
        class="icon"
        ?disabled=${!props.enabled}
        title="Clear"
        aria-label="Clear"
        @click=${props.onClear}
      >
        ${clearIcon}
      </button>
    </div>
  `;
}
```

Append to `frontend/src/styles.ts`, inside the same `css` template:

```css
  /* --- player row -------------------------------------------------- */
  .player {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 40px;
    padding: 0 4px;
  }
  .player .time {
    flex: 1;
    font-size: 0.85em;
    font-variant-numeric: tabular-nums;
    color: var(--secondary-text-color);
  }
  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .icon:hover:not([disabled]) {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
  }
  .icon[disabled] {
    color: var(--disabled-text-color, #bdbdbd);
    cursor: default;
  }
  .icon:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
```

In `frontend/src/card.ts`, add playback:

```ts
  @state() private playing = false;

  private audio?: HTMLAudioElement;

  /**
   * The `<audio>` element is created on demand and never rendered: the card
   * draws its own transport, and the tests run in plain Node where `Audio`
   * does not exist at all.
   */
  private ensureAudio(): HTMLAudioElement | undefined {
    if (typeof Audio === "undefined") {
      return undefined;
    }
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.addEventListener("timeupdate", () => {
        this.position = this.audio?.currentTime ?? 0;
      });
      this.audio.addEventListener("ended", () => {
        this.playing = false;
        this.position = 0;
      });
    }
    return this.audio;
  }

  private togglePlay(): void {
    const audio = this.ensureAudio();
    if (!audio || !this.clip) {
      return;
    }
    if (this.playing) {
      audio.pause();
      this.playing = false;
      return;
    }
    if (audio.src !== this.clip.url) {
      audio.src = this.clip.url;
      audio.currentTime = this.position;
    }
    void audio.play().then(
      () => {
        this.playing = true;
      },
      (err: any) => {
        this.fail(`Could not play that here: ${err?.message ?? err}`);
      },
    );
  }

  private stopPlayback(): void {
    this.audio?.pause();
    this.playing = false;
    this.position = 0;
  }
```

Update `seek()` to move the element too:

```ts
  private seek(fraction: number): void {
    if (!this.clip) {
      return;
    }
    this.position = fraction * this.clip.duration;
    const audio = this.ensureAudio();
    if (audio && audio.src === this.clip.url) {
      audio.currentTime = this.position;
    }
  }
```

Call `this.stopPlayback()` at the top of `setClip()` and `clearClip()`, and in `disconnectedCallback()` — a card removed mid-playback must not keep talking.

In `render()`, put the player row directly under the strip:

```ts
        ${playerRow({
          enabled: this.clip !== undefined,
          playing: this.playing,
          position: this.position,
          duration: this.clip?.duration ?? 0,
          onToggle: () => this.togglePlay(),
          onClear: () => this.clearClip(),
        })}
```

and delete the temporary `.actions` block from Task 4 except the Broadcast button, which becomes:

```ts
        <button
          class="broadcast"
          ?disabled=${!this.canBroadcast}
          @click=${this.broadcast}
        >
          ${this.phase === "sending" ? "Broadcasting…" : "Broadcast"}
        </button>
```

with styles appended to `styles.ts`:

```css
  /* --- broadcast --------------------------------------------------- */
  .broadcast {
    display: block;
    width: 100%;
    margin: 16px 0;
    padding: 14px;
    font: inherit;
    font-weight: 500;
    border: none;
    border-radius: 24px;
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
    cursor: pointer;
  }
  .broadcast[disabled] {
    background: var(--disabled-text-color, #bdbdbd);
    cursor: default;
  }
  .broadcast:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, including the 3 new player tests.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/ui/player.ts frontend/src/styles.ts frontend/src/card.ts frontend/test/player.test.ts
git commit -m "$(cat <<'EOF'
feat(card): play the loaded message in the card

Replaces the browser <audio controls> that appeared after recording with a
slim always-present row, and gives the strip a playhead that seeks.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VVZiRj3KcbJ77jnziW8u5t
EOF
)"
```

---

### Task 7: Push-to-talk and the record button

**Files:**
- Modify: `frontend/src/card.ts`
- Modify: `frontend/src/styles.ts`
- Modify: `frontend/src/editor.ts`
- Modify: `frontend/test/card.test.ts`
- Modify: `frontend/test/editor.test.ts`

**Interfaces:**
- Consumes: the card's `startRecording`/`stopRecording` from Task 4.
- Produces: `recordMode` getter on the card; `record_mode` config key written by the editor.

- [ ] **Step 1: Write the failing tests**

Append to `frontend/test/card.test.ts`:

```ts
describe("push to talk", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (globalThis as any).isSecureContext = undefined;
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    (globalThis as any).isSecureContext = undefined;
  });

  const press = { preventDefault: () => {} } as any;

  it("is what a card gets with no record_mode configured", () => {
    const { card } = makeCard();
    card.setConfig({ type: "custom:hass-broadcast-card" });
    expect(card.recordMode).toBe("push_to_talk");

    card.setConfig({ type: "custom:hass-broadcast-card", record_mode: "start_stop" });
    expect(card.recordMode).toBe("start_stop");
  });

  it("records for as long as the button is held", async () => {
    const { card, recorder } = makeCard();
    card.setConfig({ type: "custom:hass-broadcast-card" });

    await card.onPressStart(press);
    expect(card.phase).toBe("recording");

    await card.onPressEnd();
    expect(recorder.stopped).toBe(1);
    expect(card.clip).toBeDefined();
  });

  it("stops a take released before the microphone finished opening", async () => {
    const { card, recorder } = makeCard();
    card.setConfig({ type: "custom:hass-broadcast-card" });
    let releaseStart: () => void = () => {};
    recorder.startImpl = () =>
      new Promise<void>((resolve) => {
        releaseStart = resolve;
      });

    const pending = card.onPressStart(press);
    // Released while getUserMedia is still pending: without the deferred
    // stop this leaves the microphone open and the card recording forever.
    await card.onPressEnd();
    releaseStart();
    await pending;
    await Promise.resolve();

    expect(recorder.stopped).toBe(1);
    expect(card.phase).toBe("idle");
  });

  it("discards a tap too short to be speech", async () => {
    const { card, recorder } = makeCard();
    card.setConfig({ type: "custom:hass-broadcast-card" });
    recorder.stopImpl = async () => ({ blob: new Blob(["x"]), duration: 0.2 });

    await card.onPressStart(press);
    await card.onPressEnd();

    expect(card.clip).toBeUndefined();
    expect(card.status.text).toMatch(/Hold/);
  });

  it("keeps a short recording in start-stop mode, where it was deliberate", async () => {
    const { card, recorder } = makeCard();
    card.setConfig({ type: "custom:hass-broadcast-card", record_mode: "start_stop" });
    recorder.stopImpl = async () => ({ blob: new Blob(["x"]), duration: 0.2 });

    await card.onPressStart(press);
    await card.onPressStart(press);

    expect(card.clip).toBeDefined();
  });

  it("toggles rather than holds in start-stop mode", async () => {
    const { card, recorder } = makeCard();
    card.setConfig({ type: "custom:hass-broadcast-card", record_mode: "start_stop" });

    await card.onPressStart(press);
    expect(card.phase).toBe("recording");
    // A release must do nothing at all here, or the button records for
    // exactly as long as the click lasts.
    await card.onPressEnd();
    expect(card.phase).toBe("recording");
    expect(recorder.stopped).toBe(0);

    await card.onPressStart(press);
    expect(recorder.stopped).toBe(1);
  });
});
```

Append to `frontend/test/editor.test.ts`. It needs its own helper: the existing
`newEditor` lives inside `describe("editor rendering")` and does not capture
emitted configs.

```ts
describe("editor record mode", () => {
  /**
   * An editor whose emitted configs are captured. Overriding dispatchEvent
   * rather than listening keeps this independent of what event plumbing
   * Lit's SSR DOM shim happens to provide outside a browser.
   */
  function newEditor(config: any = { type: "custom:hass-broadcast-card" }): {
    editor: any;
    configs: any[];
  } {
    const editor: any = new HassBroadcastCardEditor();
    editor.createRenderRoot = () => editor;
    editor.performUpdate = () => {};
    editor.setConfig(config);
    const configs: any[] = [];
    editor.dispatchEvent = (event: any) => configs.push(event.detail.config);
    return { editor, configs };
  }

  it("writes record_mode when a mode is picked", () => {
    const { editor, configs } = newEditor();

    editor.setRecordMode("start_stop");

    expect(configs.at(-1).record_mode).toBe("start_stop");
  });

  it("shows push-to-talk as the current mode when the key is absent", () => {
    const { editor } = newEditor();

    expect(renderedText(editor.render())).toContain("Push to talk");
    expect(editor.currentRecordMode).toBe("push_to_talk");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `card.onPressStart is not a function`, `editor.setRecordMode is not a function`.

- [ ] **Step 3: Implement press handling and the editor field**

In `frontend/src/card.ts`:

```ts
/** Below this, a push-to-talk press is a mis-tap rather than a message. */
const MIN_PRESS_SECONDS = 0.4;
```

```ts
  /** Set when the button is released before start() has resolved. */
  private stopRequested = false;

  private get recordMode(): "push_to_talk" | "start_stop" {
    return this.config.record_mode === "start_stop"
      ? "start_stop"
      : "push_to_talk";
  }

  /**
   * Pointer down on the record button. In start-stop this is the whole
   * interaction; in push-to-talk it opens the microphone and `onPressEnd`
   * closes it.
   */
  private async onPressStart(event: Event): Promise<void> {
    // Without this a long press on a phone selects text, opens the context
    // menu, or starts a scroll — all of which cancel the gesture mid-message.
    event.preventDefault();
    if (this.phase === "sending" || !Recorder.isSupported()) {
      return;
    }
    if (this.recordMode === "start_stop") {
      await (this.phase === "recording"
        ? this.stopRecording()
        : this.startRecording());
      return;
    }
    this.stopRequested = false;
    await this.startRecording();
    // Released while the microphone was still opening: stop now that there
    // is a session to stop.
    if (this.stopRequested && this.phase === "recording") {
      await this.stopRecording();
    }
  }

  /** Pointer up, cancel, or leave. Only push-to-talk cares. */
  private async onPressEnd(): Promise<void> {
    if (this.recordMode !== "push_to_talk") {
      return;
    }
    if (this.phase !== "recording") {
      this.stopRequested = true;
      return;
    }
    await this.stopRecording();
  }
```

In `stopRecording()`, gate the short press before building the clip:

```ts
      const { blob, duration } = await this.recorder.stop();
      if (this.recordMode === "push_to_talk" && duration < MIN_PRESS_SECONDS) {
        // A tap, not a message. Saying so beats loading a clip of silence
        // that the user then has to work out how to get rid of.
        this.phase = "idle";
        this.fail("Hold the button while you speak.");
        return;
      }
      this.setClip(freshClip(blob, duration, this.envelope.all()));
      this.phase = "idle";
```

Render the button (replacing the old `.record`):

```ts
        <div class="record-row">
          <button
            class="record"
            data-recording=${this.phase === "recording"}
            ?disabled=${!Recorder.isSupported() || this.phase === "sending"}
            @pointerdown=${this.onPressStart}
            @pointerup=${this.onPressEnd}
            @pointercancel=${this.onPressEnd}
            @pointerleave=${this.onPressEnd}
            @contextmenu=${(event: Event) => event.preventDefault()}
            @keydown=${(event: KeyboardEvent) => {
              // Auto-repeat would otherwise restart the take ~30 times a second.
              if (!event.repeat && (event.key === " " || event.key === "Enter")) {
                void this.onPressStart(event);
              }
            }}
            @keyup=${(event: KeyboardEvent) => {
              if (event.key === " " || event.key === "Enter") {
                void this.onPressEnd();
              }
            }}
            title=${this.recordHint}
            aria-label=${this.recordHint}
          ></button>
        </div>
        <div class="status ${this.status?.kind ?? "info"}">
          ${this.status?.text ?? this.recordHint}
        </div>
```

Move the status line here (it is the same element the spec describes: elapsed timer, hints, errors, send results) and remove the one added in Task 4 from the top of the card:

```ts
  /** What the status line says when there is nothing more urgent to report. */
  private get recordHint(): string {
    if (this.phase === "recording") {
      return `Recording… ${this.elapsed}s`;
    }
    if (this.phase === "sending") {
      return "Broadcasting…";
    }
    return this.recordMode === "push_to_talk"
      ? "Hold to talk"
      : "Tap to record";
  }
```

Clear a stale status when a new take starts: in `startRecording()`, `this.status = undefined;` already runs where `this.error = undefined` did.

Append to `frontend/src/styles.ts`:

```css
  /* --- record button ----------------------------------------------- */
  .record-row {
    display: flex;
    justify-content: center;
    padding: 8px 0 4px;
  }
  .record {
    width: 96px;
    height: 96px;
    border: none;
    border-radius: 50%;
    background: var(--error-color, #db4437);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    /* Stops the browser claiming the gesture as a scroll or a long-press. */
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
    transition: transform 120ms ease, box-shadow 120ms ease;
  }
  .record[data-recording="true"] {
    transform: scale(0.92);
    box-shadow: 0 0 0 8px rgba(219, 68, 55, 0.25);
  }
  .record[disabled] {
    background: var(--disabled-text-color, #bdbdbd);
    box-shadow: none;
    cursor: default;
  }
  .record:focus-visible {
    outline: 3px solid var(--primary-color);
    outline-offset: 4px;
  }
```

In `frontend/src/editor.ts`, add to `CardConfig` the same two keys as the card, and add above the playback-mode field:

```ts
  /** The mode the card behaves as, with the key absent meaning push-to-talk. */
  private get currentRecordMode(): "push_to_talk" | "start_stop" {
    return this.config.record_mode === "start_stop"
      ? "start_stop"
      : "push_to_talk";
  }

  private setRecordMode(mode: "push_to_talk" | "start_stop"): void {
    this.emit({ record_mode: mode });
  }
```

```ts
      <div class="field">
        <label>Recording</label>
        <div class="segmented">
          ${(
            [
              ["push_to_talk", "Push to talk"],
              ["start_stop", "Tap to start and stop"],
            ] as const
          ).map(
            ([value, label]) => html`
              <button
                type="button"
                data-on=${this.currentRecordMode === value}
                @click=${() => this.setRecordMode(value)}
              >
                ${label}
              </button>
            `,
          )}
        </div>
        <div class="hint">
          Push to talk records only while the button is held.
        </div>
      </div>
```

with editor styles:

```css
    .segmented { display: flex; gap: 6px; }
    .segmented button { flex: 1; padding: 8px; font: inherit; cursor: pointer;
      border: 1px solid var(--divider-color, #ddd); border-radius: 6px;
      background: none; color: var(--primary-text-color); }
    .segmented button[data-on="true"] { background: var(--primary-color);
      color: var(--text-primary-color, #fff); border-color: var(--primary-color); }
```

Finally, make `getStubConfig` state the mode explicitly:

```ts
  static getStubConfig(): CardConfig {
    return {
      type: "custom:hass-broadcast-card",
      targets: [],
      mode: "plain",
      record_mode: "push_to_talk",
      player_list: "rows",
    };
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, including the 6 new push-to-talk tests and 2 new editor tests.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/card.ts frontend/src/styles.ts frontend/src/editor.ts frontend/test/card.test.ts frontend/test/editor.test.ts
git commit -m "$(cat <<'EOF'
feat(card): add push-to-talk recording and a larger record button

Push-to-talk is the default for every card. A release that arrives before
the microphone has opened is deferred rather than dropped, and a press too
short to be speech is discarded with a hint instead of loading silence.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VVZiRj3KcbJ77jnziW8u5t
EOF
)"
```

---

### Task 8: Three speaker-list styles

**Files:**
- Create: `frontend/src/ui/targets.ts`
- Modify: `frontend/src/styles.ts`
- Modify: `frontend/src/card.ts`
- Modify: `frontend/src/editor.ts`
- Modify: `frontend/test/editor.test.ts`
- Test: `frontend/test/targets.test.ts`

**Interfaces:**
- Consumes: nothing beyond lit.
- Produces: `type ListStyle = "rows" | "chips" | "dropdown"`, `interface TargetProps { players: TargetPlayer[]; selected: string[]; style: ListStyle; open: boolean; onToggle: (entityId: string) => void; onOpenChange: (open: boolean) => void }`, `interface TargetPlayer { entityId: string; name: string; available: boolean }`, `targetList(props: TargetProps): TemplateResult`, `summarize(players: TargetPlayer[], selected: string[]): string`.

- [ ] **Step 1: Write the failing test**

Create `frontend/test/targets.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { renderedText } from "./helpers";
import { summarize, targetList } from "../src/ui/targets";

const players = [
  { entityId: "media_player.kitchen", name: "Kitchen", available: true },
  { entityId: "media_player.attic", name: "Attic", available: true },
  { entityId: "media_player.bath", name: "Bathroom", available: false },
];

const base = {
  players,
  selected: ["media_player.kitchen"],
  open: false,
  onToggle: () => {},
  onOpenChange: () => {},
};

describe("targetList", () => {
  it("names every player and counts the selection in all three styles", () => {
    for (const style of ["rows", "chips", "dropdown"] as const) {
      const html = renderedText(targetList({ ...base, style, open: true }));
      expect(html).toContain("Kitchen");
      expect(html).toContain("Attic");
      expect(html).toContain("1 of 3");
    }
  });

  it("marks an unavailable speaker rather than hiding it", () => {
    const html = renderedText(targetList({ ...base, style: "rows" }));
    expect(html).toContain("Bathroom");
    expect(html).toContain("unavailable");
  });

  it("keeps a closed dropdown's rows out of the markup", () => {
    const closed = renderedText(targetList({ ...base, style: "dropdown" }));
    const open = renderedText(targetList({ ...base, style: "dropdown", open: true }));

    expect(closed).not.toContain("Attic");
    expect(open).toContain("Attic");
  });

  it("says so when no speaker was found at all", () => {
    const html = renderedText(
      targetList({ ...base, players: [], selected: [], style: "rows" }),
    );
    expect(html).toContain("No speakers found");
  });
});

describe("summarize", () => {
  it("names a short selection and counts a long one", () => {
    expect(summarize(players, [])).toBe("No speakers selected");
    expect(summarize(players, ["media_player.kitchen"])).toBe("Kitchen");
    expect(
      summarize(players, ["media_player.kitchen", "media_player.attic"]),
    ).toBe("Kitchen, Attic");
    expect(
      summarize(players, [
        "media_player.kitchen",
        "media_player.attic",
        "media_player.bath",
      ]),
    ).toBe("Kitchen, Attic +1");
  });
});
```

And append to `frontend/test/editor.test.ts`, reusing the capturing `newEditor`
helper added in Task 7 (it is scoped to `describe("editor record mode")`, so
either widen that describe to `describe("editor record mode and list style")`
or lift the helper to module scope — lift it):

```ts
  it("writes player_list when a style is picked", () => {
    const { editor, configs } = newEditor();

    editor.emit({ player_list: "dropdown" });

    expect(configs.at(-1).player_list).toBe("dropdown");
  });

  it("shows rows as the style when the key is absent", () => {
    const { editor } = newEditor();

    expect(renderedText(editor.render())).toContain("Speaker list style");
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run frontend/test/targets.test.ts`
Expected: FAIL — `Failed to resolve import "../src/ui/targets"`.

- [ ] **Step 3: Write the three styles**

Create `frontend/src/ui/targets.ts`:

```ts
import { TemplateResult, html, nothing } from "lit";

export type ListStyle = "rows" | "chips" | "dropdown";

export interface TargetPlayer {
  entityId: string;
  name: string;
  /** False when Home Assistant reports the entity unavailable. */
  available: boolean;
}

export interface TargetProps {
  players: TargetPlayer[];
  selected: string[];
  style: ListStyle;
  /** Dropdown only: whether the overlay panel is showing. */
  open: boolean;
  onToggle: (entityId: string) => void;
  onOpenChange: (open: boolean) => void;
}

/** How many speakers the dropdown summary names before it starts counting. */
const SUMMARY_NAMES = 2;

/** The one-line description of a selection, for the dropdown's closed state. */
export function summarize(
  players: TargetPlayer[],
  selected: string[],
): string {
  if (selected.length === 0) {
    return "No speakers selected";
  }
  const names = selected.map(
    (entityId) =>
      players.find((player) => player.entityId === entityId)?.name ?? entityId,
  );
  const shown = names.slice(0, SUMMARY_NAMES).join(", ");
  const rest = names.length - SUMMARY_NAMES;
  return rest > 0 ? `${shown} +${rest}` : shown;
}

function row(props: TargetProps, player: TargetPlayer): TemplateResult {
  const on = props.selected.includes(player.entityId);
  return html`
    <button
      class="target-row"
      role="checkbox"
      aria-checked=${on}
      data-on=${on}
      @click=${() => props.onToggle(player.entityId)}
    >
      <span class="target-name">${player.name}</span>
      ${player.available
        ? nothing
        : html`<span class="target-note">unavailable</span>`}
      <span class="target-check" aria-hidden="true">${on ? "✓" : ""}</span>
    </button>
  `;
}

function chip(props: TargetProps, player: TargetPlayer): TemplateResult {
  const on = props.selected.includes(player.entityId);
  return html`
    <button
      class="chip"
      role="checkbox"
      aria-checked=${on}
      data-on=${on}
      @click=${() => props.onToggle(player.entityId)}
    >
      ${player.name}${player.available ? "" : " (unavailable)"}
    </button>
  `;
}

/**
 * The speaker picker, in whichever style the card is configured for.
 *
 * All three show the same header and counter; only the body differs, so
 * switching styles in the editor never changes what the card can do.
 */
export function targetList(props: TargetProps): TemplateResult {
  const header = html`
    <div class="section-head">
      <span>Speakers</span>
      <span class="count">${props.selected.length} of ${props.players.length}</span>
    </div>
  `;

  if (props.players.length === 0) {
    return html`${header}<div class="empty">No speakers found</div>`;
  }

  if (props.style === "chips") {
    return html`
      ${header}
      <div class="chips">${props.players.map((player) => chip(props, player))}</div>
    `;
  }

  if (props.style === "dropdown") {
    return html`
      ${header}
      <div class="dropdown">
        <button
          class="dropdown-summary"
          aria-expanded=${props.open}
          @click=${() => props.onOpenChange(!props.open)}
        >
          <span>${summarize(props.players, props.selected)}</span>
          <span aria-hidden="true">${props.open ? "▴" : "▾"}</span>
        </button>
        ${props.open
          ? html`
              <!-- Absolutely positioned: an inline panel would push the
                   broadcast button and the history list down the card. -->
              <div class="dropdown-panel">
                ${props.players.map((player) => row(props, player))}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  return html`
    ${header}
    <div class="target-rows">${props.players.map((player) => row(props, player))}</div>
  `;
}
```

Append to `frontend/src/styles.ts`:

```css
  /* --- sections ---------------------------------------------------- */
  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 8px 0 6px;
    font-size: 0.8em;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }
  .section-head .count {
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
  }
  .empty {
    padding: 12px 0;
    font-size: 0.9em;
    color: var(--secondary-text-color);
  }

  /* --- speakers: rows ---------------------------------------------- */
  .target-rows {
    max-height: 208px;
    overflow-y: auto;
  }
  .target-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 8px;
    font: inherit;
    text-align: left;
    border: none;
    border-radius: 8px;
    background: none;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .target-row[data-on="true"] {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
  }
  .target-name {
    flex: 1;
  }
  .target-note {
    font-size: 0.8em;
    color: var(--secondary-text-color);
  }
  .target-check {
    width: 20px;
    text-align: center;
    color: var(--primary-color);
  }

  /* --- speakers: chips --------------------------------------------- */
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    padding: 8px 14px;
    font: inherit;
    border-radius: 18px;
    border: 1px solid var(--divider-color, #ddd);
    background: none;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .chip[data-on="true"] {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  /* --- speakers: dropdown ------------------------------------------ */
  .dropdown {
    position: relative;
  }
  .dropdown-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px;
    font: inherit;
    text-align: left;
    border: 1px solid var(--divider-color, #ddd);
    border-radius: 8px;
    background: none;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .dropdown-panel {
    position: absolute;
    z-index: 2;
    left: 0;
    right: 0;
    max-height: 240px;
    overflow-y: auto;
    margin-top: 4px;
    padding: 4px;
    border: 1px solid var(--divider-color, #ddd);
    border-radius: 8px;
    background: var(--card-background-color, #fff);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }
```

In `frontend/src/card.ts`, replace the `.targets` block in `render()`:

```ts
        ${targetList({
          players: this.players.map((entityId) => ({
            entityId,
            name:
              this.hass?.states?.[entityId]?.attributes?.friendly_name ?? entityId,
            available: this.hass?.states?.[entityId]?.state !== "unavailable",
          })),
          selected: this.selected,
          style: this.config.player_list ?? "rows",
          open: this.pickerOpen,
          onToggle: (entityId) => this.toggleTarget(entityId),
          onOpenChange: (open) => {
            this.pickerOpen = open;
          },
        })}
```

with `@state() private pickerOpen = false;` added to the state block.

In `frontend/src/editor.ts`, add the style selector below the recording field:

```ts
      <div class="field">
        <label for="player-list">Speaker list style</label>
        <select
          id="player-list"
          .value=${this.config.player_list ?? "rows"}
          @change=${(e: Event) =>
            this.emit({ player_list: (e.target as HTMLSelectElement).value as any })}
        >
          <option value="rows">List — one row per speaker</option>
          <option value="chips">Chips — compact pills</option>
          <option value="dropdown">Dropdown — a single summary line</option>
        </select>
      </div>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, including the 5 new targets tests and 2 new editor tests.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/ui/targets.ts frontend/src/styles.ts frontend/src/card.ts frontend/src/editor.ts frontend/test/targets.test.ts frontend/test/editor.test.ts
git commit -m "$(cat <<'EOF'
feat(card): offer three speaker-list styles

Rows, chips and a dropdown, picked per card from the editor. The dropdown's
panel is an overlay so opening it does not push the rest of the card down.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VVZiRj3KcbJ77jnziW8u5t
EOF
)"
```

---

### Task 9: The recent-messages section

**Files:**
- Create: `frontend/src/ui/history.ts`
- Modify: `frontend/src/styles.ts`
- Modify: `frontend/src/card.ts`
- Test: `frontend/test/history.test.ts`

**Interfaces:**
- Consumes: `BroadcastMessage` from `../api`; `formatClock`, `formatWhen` from `../format`.
- Produces: `historySection(props: HistoryProps): TemplateResult`, `interface HistoryProps { messages: BroadcastMessage[]; loadedId?: string; loadingId?: string; onLoad: (message: BroadcastMessage) => void; onDelete: (id: string) => void; now?: Date }`.

- [ ] **Step 1: Write the failing test**

Create `frontend/test/history.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { renderedText } from "./helpers";
import { historySection } from "../src/ui/history";

const now = new Date("2026-08-22T14:30:00Z");

const messages = [
  {
    id: "one",
    created: "2026-08-22T14:00:00Z",
    duration: 3,
    can_delete: true,
    extension: "wav",
  },
  {
    id: "two",
    created: "2026-08-21T09:00:00Z",
    duration: 65,
    can_delete: false,
    extension: "mp3",
  },
];

const base = { messages, onLoad: () => {}, onDelete: () => {}, now };

describe("historySection", () => {
  it("names each message by when it was left and how long it runs", () => {
    const html = renderedText(historySection(base));

    expect(html).toContain("Recent messages");
    expect(html).toContain("30 minutes ago");
    expect(html).toContain("0:03");
    expect(html).toContain("1:05");
  });

  it("offers a delete control only where the server allows it", () => {
    const html = renderedText(historySection(base));

    // One row of two can be deleted, and the other row is still shown.
    // Match the aria-label alone: the button also carries a `title="Delete"`.
    expect(html.match(/aria-label="Delete"/g)).toHaveLength(1);
    expect(html).toContain("Yesterday");
  });

  it("marks the row whose message is loaded into the card", () => {
    const html = renderedText(historySection({ ...base, loadedId: "two" }));

    expect(html).toContain('data-loaded="true"');
    expect(html.match(/data-loaded="true"/g)).toHaveLength(1);
  });

  it("marks the row being fetched", () => {
    const html = renderedText(historySection({ ...base, loadingId: "one" }));

    expect(html).toContain('data-loading="true"');
  });

  it("keeps its height with nothing recorded yet", () => {
    const html = renderedText(historySection({ ...base, messages: [] }));

    expect(html).toContain("Recent messages");
    expect(html).toContain("Nothing recorded yet");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run frontend/test/history.test.ts`
Expected: FAIL — `Failed to resolve import "../src/ui/history"`.

- [ ] **Step 3: Write the section**

Create `frontend/src/ui/history.ts`:

```ts
import { TemplateResult, html, nothing } from "lit";

import { BroadcastMessage } from "../api";
import { formatClock, formatWhen } from "../format";

export interface HistoryProps {
  messages: BroadcastMessage[];
  /** The message currently loaded into the card, if it came from here. */
  loadedId?: string;
  /** The message being fetched right now. */
  loadingId?: string;
  onLoad: (message: BroadcastMessage) => void;
  onDelete: (id: string) => void;
  /** Injectable for tests; production reads the clock. */
  now?: Date;
}

/**
 * Recent messages.
 *
 * A row loads its message into the card rather than broadcasting it. The old
 * per-row Play button sent to the speakers on one tap, with no way to hear it
 * first and no undo — picking a message and sending it are now two decisions.
 */
export function historySection(props: HistoryProps): TemplateResult {
  const now = props.now ?? new Date();
  return html`
    <div class="history">
      <div class="section-head">
        <span>Recent messages</span>
        <span class="count">${props.messages.length || ""}</span>
      </div>
      ${props.messages.length === 0
        ? html`<div class="empty">Nothing recorded yet</div>`
        : props.messages.map(
            (message) => html`
              <div
                class="history-row"
                data-loaded="${props.loadedId === message.id}"
                data-loading="${props.loadingId === message.id}"
              >
                <button class="history-load" @click=${() => props.onLoad(message)}>
                  <span class="history-when">${formatWhen(message.created, now)}</span>
                  <span class="history-length">${formatClock(message.duration)}</span>
                </button>
                ${message.can_delete
                  ? html`
                      <button
                        class="icon"
                        title="Delete"
                        aria-label="Delete"
                        @click=${() => props.onDelete(message.id)}
                      >
                        ✕
                      </button>
                    `
                  : nothing}
              </div>
            `,
          )}
    </div>
  `;
}
```

Append to `frontend/src/styles.ts`:

```css
  /* --- history ----------------------------------------------------- */
  .history {
    border-top: 1px solid var(--divider-color, #ddd);
    margin-top: 8px;
    padding-top: 4px;
  }
  .history-row {
    display: flex;
    align-items: center;
    gap: 4px;
    border-radius: 8px;
  }
  .history-row[data-loaded="true"] {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
  }
  .history-row[data-loading="true"] {
    opacity: 0.5;
  }
  .history-load {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    flex: 1;
    padding: 10px 8px;
    font: inherit;
    text-align: left;
    border: none;
    background: none;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .history-length {
    font-size: 0.85em;
    font-variant-numeric: tabular-nums;
    color: var(--secondary-text-color);
  }
```

In `frontend/src/card.ts`, replace the history block in `render()`:

```ts
        ${this.config.show_history === false
          ? nothing
          : historySection({
              messages: this.history,
              loadedId: this.clip ? storedId(this.clip) : undefined,
              loadingId: this.loadingId,
              onLoad: (message) => void this.loadMessage(message),
              onDelete: (id) => void this.deleteRecording(id),
            })}
```

`deleteRecording` keeps its existing `not_authorized` handling; change its two `this.error = ...` assignments to `this.fail(...)`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, including the 5 new history tests.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/ui/history.ts frontend/src/styles.ts frontend/src/card.ts frontend/test/history.test.ts
git commit -m "$(cat <<'EOF'
feat(card): load a recent message instead of broadcasting it on tap

A history row now fills the card the way a fresh recording does: playable
locally, with Broadcast enabled. Sending an old message is two deliberate
taps rather than one irreversible one.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VVZiRj3KcbJ77jnziW8u5t
EOF
)"
```

---

### Task 10: Dev harness

**Files:**
- Modify: `frontend/dev/mock-hass.ts`
- Modify: `frontend/dev/main.ts`
- Modify: `frontend/dev/README.md`

**Interfaces:**
- Consumes: the existing `Scenario` shape.
- Produces: `Scenario.mediaFails: boolean`.

Nothing here is covered by tests — the harness is a dev tool and has none. Verification is by running it and looking.

- [ ] **Step 1: Add the scenario flag**

In `frontend/dev/mock-hass.ts`, add to the `Scenario` interface:

```ts
  /** GET /media answers 404, so a history entry cannot be loaded. */
  mediaFails: boolean;
```

to `DEFAULT_SCENARIO`:

```ts
  mediaFails: false,
```

and in `installFetchMock`'s media branch, before looking up the blob:

```ts
    const media = /\/api\/hass_broadcast\/media\/([^./]+)\./.exec(url);
    if (media) {
      if (scenario.mediaFails) {
        return new Response("not found", { status: 404 });
      }
      const blob = backend.mediaFor(media[1]);
```

`installFetchMock` currently takes only the backend, so give it the live scenario object too — `main.ts` mutates a single `scenario` object in place, so a reference stays current:

```ts
export function installFetchMock(backend: MockBackend, scenario: Scenario): void {
```

- [ ] **Step 2: Wire the toggle**

In `frontend/dev/main.ts`, change the call to `installFetchMock(backend, scenario)` and add to the "Failure modes" group, after the delete toggle:

```ts
        ${this.toggle("mediaFails", "Loading a recent message fails")}
```

- [ ] **Step 3: Document it**

In `frontend/dev/README.md`, in the "Controls" paragraph, add the new toggle to the list of forced states: change

```
an unauthorized delete, an empty or twelve-entry history, and artificial latency
```

to

```
an unauthorized delete, a recent message that will not load, an empty or
twelve-entry history, and artificial latency
```

and add a paragraph after it:

```
The card's two new layout choices — push-to-talk versus tap-to-start, and the
speaker-list style — live in the real editor at the bottom of the panel, not in
these controls, because they are card configuration rather than simulated
conditions.
```

- [ ] **Step 4: Verify by running it**

Run: `npm run dev` and open the printed URL. Check, in this order:

1. With "Simulated recording" on, hold the record button — the strip scrolls with the signal, the timer counts in the status line, and nothing in the card moves.
2. Release — the strip becomes the take's waveform, the player row lights up, Broadcast enables.
3. Press play, then tap partway along the strip — the playhead follows and audio seeks.
4. Switch the editor to "Tap to start and stop" — one tap records, a second stops.
5. Tap a row under "Recent messages" — it loads, the row highlights, the strip redraws, and playback works. Nothing was sent to a speaker.
6. Turn on "Loading a recent message fails" — the status line reports it and the previously loaded clip stays put.
7. Cycle the speaker-list style through all three in the editor; open the dropdown and confirm the panel overlays the Broadcast button rather than pushing it down.
8. Repeat 1–2 at 360px in dark theme, and with "No recordings" selected.

Then stop the server.

- [ ] **Step 5: Commit**

```bash
git add frontend/dev/mock-hass.ts frontend/dev/main.ts frontend/dev/README.md
git commit -m "$(cat <<'EOF'
feat(dev): simulate a recent message that will not load

The history-load path has a failure mode the harness could not reach, and
it is the one the redesign leans on hardest.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VVZiRj3KcbJ77jnziW8u5t
EOF
)"
```

---

### Task 11: Rebuild the bundle and verify the whole thing

**Files:**
- Modify: `custom_components/hass_broadcast/www/hass-broadcast-card.js` (generated)
- Modify: `CLAUDE.md`

- [ ] **Step 1: Run both suites**

```bash
npm test
.venv/bin/python -m pytest -q
```

Expected: card tests all green (84 before this work, plus the ~35 added here); Python 54 passed. If the Python suite fails, something outside this plan's scope changed — stop and investigate rather than proceeding.

- [ ] **Step 2: Rebuild the bundle**

```bash
npm run build
git diff --stat custom_components/hass_broadcast/www/hass-broadcast-card.js
```

Expected: the bundle shows as modified. CI rebuilds and compares it, so a stale bundle fails the build.

- [ ] **Step 3: Note the new config keys in CLAUDE.md**

Add to `CLAUDE.md`, after the "Commands" section:

```markdown
## Card configuration keys

`record_mode` (`push_to_talk` | `start_stop`) and `player_list` (`rows` |
`chips` | `dropdown`) are card config, both written by the editor. An absent
`record_mode` means push-to-talk — cards predating that key changed behaviour
on upgrade, deliberately, so there is one default rather than one per card age.
```

- [ ] **Step 4: Commit**

```bash
git add custom_components/hass_broadcast/www/hass-broadcast-card.js CLAUDE.md
git commit -m "$(cat <<'EOF'
chore: rebuild the card bundle for the UI redesign

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VVZiRj3KcbJ77jnziW8u5t
EOF
)"
```

- [ ] **Step 5: Final check**

```bash
git status --short
```

Expected: clean. Nothing under `frontend/src/` may be newer than the committed bundle.

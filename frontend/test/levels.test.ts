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

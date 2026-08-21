import { describe, it, expect } from "vitest";
import { clampMaxDuration } from "../src/editor";

describe("clampMaxDuration", () => {
  it("returns the value when within valid range", () => {
    expect(clampMaxDuration(60)).toBe(60);
    expect(clampMaxDuration(5)).toBe(5);
    expect(clampMaxDuration(300)).toBe(300);
    expect(clampMaxDuration(150)).toBe(150);
  });

  it("clamps values below the minimum to 5", () => {
    expect(clampMaxDuration(0)).toBe(5);
    expect(clampMaxDuration(1)).toBe(5);
    expect(clampMaxDuration(-10)).toBe(5);
  });

  it("clamps values above the maximum to 300", () => {
    expect(clampMaxDuration(301)).toBe(300);
    expect(clampMaxDuration(1000)).toBe(300);
  });

  it("defaults to 60 when given empty string or NaN", () => {
    expect(clampMaxDuration("")).toBe(60);
    expect(clampMaxDuration(NaN)).toBe(60);
    expect(clampMaxDuration(null)).toBe(60);
    expect(clampMaxDuration(undefined)).toBe(60);
  });

  it("parses numeric strings correctly", () => {
    expect(clampMaxDuration("30")).toBe(30);
    expect(clampMaxDuration("300")).toBe(300);
    expect(clampMaxDuration("0")).toBe(5);
  });
});

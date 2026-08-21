import { describe, expect, it } from "vitest";
import { INSECURE_CONTEXT_MESSAGE, micErrorMessage } from "../src/errors";

describe("microphone errors", () => {
  it("names the HTTPS requirement in the insecure-context message", () => {
    expect(INSECURE_CONTEXT_MESSAGE).toMatch(/HTTPS/);
    expect(INSECURE_CONTEXT_MESSAGE).toMatch(/localhost/);
  });

  it("gives actionable advice when permission was denied", () => {
    const message = micErrorMessage({ name: "NotAllowedError" });
    expect(message).toMatch(/permission/i);
    expect(message).not.toMatch(/undefined/);
  });

  it("falls back to the error message for other failures", () => {
    expect(micErrorMessage({ name: "NotFoundError", message: "no device" })).toMatch(
      /no device/,
    );
  });

  it("never renders undefined for a bare error", () => {
    expect(micErrorMessage({})).not.toMatch(/undefined/);
  });
});

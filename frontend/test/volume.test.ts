import { describe, expect, it } from "vitest";

import { renderedText } from "./helpers";
import { volumeControl } from "../src/ui/volume";

const base = {
  enabled: false,
  value: 1,
  onToggle: () => {},
  onChange: () => {},
};

describe("volumeControl", () => {
  it("hides the slider and percentage until the override is turned on", () => {
    const html = renderedText(volumeControl(base));

    expect(html).toContain("Set volume");
    expect(html).not.toContain("%");
  });

  it("shows the slider and percentage once enabled", () => {
    const html = renderedText(volumeControl({ ...base, enabled: true, value: 0.8 }));

    expect(html).toContain("80%");
  });

  it("marks the toggle as checked when enabled", () => {
    const off = renderedText(volumeControl(base));
    const on = renderedText(volumeControl({ ...base, enabled: true }));

    expect(off).toContain("data-on=false");
    expect(on).toContain("data-on=true");
  });
});

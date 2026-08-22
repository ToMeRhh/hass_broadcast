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

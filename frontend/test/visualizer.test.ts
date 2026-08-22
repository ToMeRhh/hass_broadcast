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

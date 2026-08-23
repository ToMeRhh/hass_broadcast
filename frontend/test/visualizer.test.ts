import { describe, expect, it } from "vitest";

import { renderedText } from "./helpers";
import { BAR_COUNT, silence } from "../src/levels";
import { visualizer } from "../src/ui/visualizer";

/** Pull the event-handler functions out of the template, in the order they
 * appear as `@pointer*` bindings — there is no DOM here to dispatch real
 * events at, so the handlers are invoked directly with stand-in events. */
function handlersOf(result: any): ((event: any) => void)[] {
  return (result.values as any[]).filter((value) => typeof value === "function");
}

describe("visualizer", () => {
  it("draws one bar per value, at a minimum height so silence still reads", () => {
    const html = renderedText(
      visualizer({ bars: [0, 0.5, 1], seekable: false, recording: false, onSeek: () => {} }),
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
        recording: false,
        onSeek: () => {},
      }),
    );

    expect(html.match(/bar played/g)).toHaveLength(2);
  });

  it("marks itself seekable only when there is something to seek", () => {
    const idle = renderedText(
      visualizer({
        bars: silence(BAR_COUNT),
        seekable: false,
        recording: false,
        onSeek: () => {},
      }),
    );
    const loaded = renderedText(
      visualizer({
        bars: silence(BAR_COUNT),
        seekable: true,
        recording: false,
        onSeek: () => {},
      }),
    );

    expect(idle).not.toContain("seekable");
    expect(loaded).toContain("seekable");
  });

  it("draws the live tail only while actually recording, not merely idle", () => {
    // Finding 11: `live` used to key off `progress === undefined`, which is
    // also true when idle with nothing loaded — so the resting baseline was
    // painted in the accent color and the class no longer meant what it said.
    const recording = renderedText(
      visualizer({ bars: [0.5, 0.5], seekable: false, recording: true, onSeek: () => {} }),
    );
    const idle = renderedText(
      visualizer({ bars: [0.5, 0.5], seekable: false, recording: false, onSeek: () => {} }),
    );

    expect(recording).toContain("bar live");
    expect(idle).not.toContain("bar live");
  });

  it("drags to seek: pointerdown then pointermove scrub, pointerup releases capture", () => {
    // Finding 5: the spec says tapping or dragging the strip seeks, but only
    // @pointerdown was bound.
    const seeks: number[] = [];
    const result = visualizer({
      bars: [0.5, 0.5, 0.5, 0.5],
      seekable: true,
      recording: false,
      onSeek: (fraction) => seeks.push(fraction),
    }) as any;
    const [onDown, onMove, onUp] = handlersOf(result);
    const captures: number[] = [];
    const element = {
      getBoundingClientRect: () => ({ left: 0, width: 100 }),
      setPointerCapture: (id: number) => captures.push(id),
      releasePointerCapture: (id: number) => captures.push(-id),
    };

    onDown({ currentTarget: element, clientX: 25, pointerId: 7 });
    expect(seeks).toEqual([0.25]);
    expect(captures).toEqual([7]);

    onMove({ currentTarget: element, clientX: 75, buttons: 1, pointerId: 7 });
    expect(seeks).toEqual([0.25, 0.75]);

    // A hover move with nothing pressed must not scrub.
    onMove({ currentTarget: element, clientX: 10, buttons: 0, pointerId: 7 });
    expect(seeks).toEqual([0.25, 0.75]);

    onUp({ currentTarget: element, pointerId: 7 });
    expect(captures).toEqual([7, -7]);
  });
});

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

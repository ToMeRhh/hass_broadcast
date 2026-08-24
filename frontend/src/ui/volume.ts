import { TemplateResult, html, nothing } from "lit";

export interface VolumeControlProps {
  /** Off by default: an untouched card sends no volume at all. */
  enabled: boolean;
  /** Fraction 0-1, matching `volume_level` on the Home Assistant side. */
  value: number;
  onToggle: () => void;
  onChange: (value: number) => void;
}

/**
 * The broadcast-volume override: a toggle plus a slider, the slider hidden
 * until the toggle is on so an untouched card renders exactly as it did
 * before this control existed.
 */
export function volumeControl(props: VolumeControlProps): TemplateResult {
  return html`
    <div class="volume-row">
      <button
        class="volume-toggle"
        role="checkbox"
        aria-checked=${props.enabled}
        data-on=${props.enabled}
        @click=${() => props.onToggle()}
      >
        Set volume
      </button>
      ${props.enabled
        ? html`
            <input
              type="range"
              class="volume-slider"
              min="0"
              max="1"
              step="0.01"
              .value=${String(props.value)}
              aria-label="Broadcast volume"
              @input=${(event: Event) =>
                props.onChange(Number((event.target as HTMLInputElement).value))}
            />
            <span class="volume-value">${Math.round(props.value * 100)}%</span>
          `
        : nothing}
    </div>
  `;
}

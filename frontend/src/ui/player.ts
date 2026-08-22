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

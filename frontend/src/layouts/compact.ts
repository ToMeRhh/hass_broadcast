import { TemplateResult, html, nothing } from "lit";

import { historyIcon, moreIcon, volumeIcon } from "../ui/icons";
import { layers, statusText, timerText } from "../ui/strip";
import { CardParts } from "./parts";

/**
 * Compact: two rows beside the mic.
 *
 *   ( MIC ) [ title · hint | ● 0:07 | ▶ wave ✕ | status ] [⋮]
 *           [ speaker dropdown                  ] [ Send ]
 *
 * Row 1 is one layered slot; row 2 never changes. Recent messages and the
 * volume control, when shown, live in the ⋮ menu.
 */
export function compactLayout(parts: CardParts): TemplateResult {
  const menu = parts.recentMessages !== "off" || parts.volumeControl;
  return html`
    <div class="card compact">
      <div class="compact-mic slot">${parts.mic(72)}</div>
      <div class="compact-body">
        <div class="compact-row">
          ${layers("compact-status", parts.view, {
            idle: html`
              <span class="title">${parts.title}</span>
              <span class="hint">${parts.hint}</span>
            `,
            recording: timerText(parts.timer, parts.timerWarning),
            review: html`
              ${parts.play()} ${parts.waveform("wave-mini")} ${parts.discard()}
              ${parts.save("icon")}
            `,
            // As in full: Save stays put when a status takes over the row.
            status: html`${statusText(parts.status)}${parts.save("icon")}`,
          })}
          ${menu
            ? html`
                <div class="popover-wrap slot" data-popover="menu">
                  <button
                    class="icon"
                    title="More"
                    aria-label="More"
                    aria-expanded=${parts.menuOpen}
                    @click=${() => parts.onMenuOpenChange(!parts.menuOpen)}
                  >
                    ${moreIcon}
                  </button>
                  ${parts.menuOpen ? menuPanel(parts) : nothing}
                </div>
              `
            : nothing}
        </div>
        <div class="compact-row">
          <div class="compact-speakers slot">${parts.speakers()}</div>
          <div class="slot">${parts.send("pill")}</div>
        </div>
      </div>
      ${parts.historyDialog()}
    </div>
  `;
}

/**
 * What the ⋮ button discloses. Not an ARIA menu: a menu may hold only menu
 * items, and this one holds the volume toggle and slider, so its buttons stay
 * plain buttons and the ⋮ button says it is open with aria-expanded.
 */
function menuPanel(parts: CardParts): TemplateResult {
  return html`
    <div class="popover menu">
      ${parts.recentMessages !== "off"
        ? html`
            <button
              class="menu-item"
              @click=${() => {
                parts.onMenuOpenChange(false);
                parts.onOpenHistory();
              }}
            >
              ${historyIcon}<span>Recent messages</span>
            </button>
          `
        : nothing}
      ${parts.volumeControl
        ? html`<div class="menu-item menu-volume">${volumeIcon}${parts.volumePanel()}</div>`
        : nothing}
    </div>
  `;
}

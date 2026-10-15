import { TemplateResult, html, nothing } from "lit";

import { layers, statusText, timerText } from "../ui/strip";
import { CardParts } from "./parts";

/**
 * Full: header, a one-line strip, the record core, then the speakers.
 *
 *   [ Title           (recent messages) (volume) ]
 *   [ hint | ● 0:07 | ▶ waveform 0:07 | status   ]   ← one 40px layered slot
 *   [ (discard)        ( MIC )         (send)    ]   ← fixed 132px core
 *   [ speaker picker                             ]
 *   [ recent messages, when shown as a list      ]
 *
 * The mic never moves. Discard fades in beside it while reviewing; Send is
 * always there and only enabled once there is something to send.
 */
export function fullLayout(parts: CardParts): TemplateResult {
  return html`
    <div class="card full">
      <div class="head slot">
        <span class="title">${parts.title}</span>
        <span class="head-actions">
          ${parts.recentMessages === "button" ? parts.historyButton() : nothing}
          ${parts.volumeControl ? parts.volumeButton() : nothing}
        </span>
      </div>

      ${layers("strip", parts.view, {
        idle: html`<span class="hint">${parts.hint}</span>`,
        recording: timerText(parts.timer, parts.timerWarning),
        review: html`
          ${parts.play()} ${parts.waveform("wave-strip")}
          <span class="clip-length">${parts.clipLength}</span>
        `,
        status: statusText(parts.status),
      })}

      <div class="core">
        <div class="core-side slot">
          <div class="pop" data-on=${parts.reviewing} ?inert=${!parts.reviewing}>
            ${parts.discard()}
            <span class="caption">Discard</span>
          </div>
        </div>
        <div class="core-mic slot">${parts.mic(96)}</div>
        <div class="core-side slot">${parts.send("round")}</div>
      </div>

      <div class="section section-speakers slot" data-style=${parts.speakerPicker}>
        ${parts.speakers()}
      </div>
      ${parts.recentMessages === "list"
        ? html`<div class="section slot">${parts.historyList()}</div>`
        : nothing}
      ${parts.historyDialog()}
    </div>
  `;
}

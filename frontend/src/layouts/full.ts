import { TemplateResult, html } from "lit";

import { layers, statusText, timerText } from "../ui/strip";
import { CardParts } from "./parts";

/**
 * Full: header, a one-line strip, the record core, then the user's sections.
 *
 *   [ Title                    (icon sections) ]
 *   [ hint | ● 0:07 | ▶ waveform 0:07 | status ]   ← one 40px layered slot
 *   [ (discard)        ( MIC )         (send)  ]   ← fixed 132px core
 *   [ list-style sections, in config order     ]
 *
 * The mic never moves. Discard fades in beside it while reviewing; Send is
 * always there and only enabled once there is something to send.
 */
export function fullLayout(parts: CardParts): TemplateResult {
  const icons = parts.sections.filter((section) => section.style === "icon");
  const below = parts.sections.filter((section) => section.style !== "icon");
  return html`
    <div class="card full">
      <div class="head slot">
        <span class="title">${parts.title}</span>
        <span class="head-actions">
          ${icons.map((section) =>
            section.type === "history"
              ? parts.historyButton()
              : section.type === "volume"
                ? parts.volumeButton()
                : "",
          )}
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

      ${below.map((section) =>
        section.type === "speakers"
          ? html`<div class="section section-speakers slot" data-style=${section.style}>
              ${parts.speakers(section)}
            </div>`
          : section.type === "history"
            ? html`<div class="section slot">${parts.historyList()}</div>`
            : "",
      )}
      ${parts.historyDialog()}
    </div>
  `;
}

import { TemplateResult, html, nothing } from "lit";

import { Status } from "../sending";

/**
 * A status message as a layer: one clipped line, the full text in `title`.
 * The messages routed here (send failures naming several speakers, upload
 * errors) are long and variable-length and would otherwise wrap and grow the
 * slot — the reflow the layered slots exist to prevent.
 */
export function statusText(status: Status | undefined): TemplateResult | typeof nothing {
  if (!status) {
    return nothing;
  }
  return html`<span class="status ${status.kind}" title=${status.text}>${status.text}</span>`;
}

/** The elapsed time while recording, warning-coloured near the limit. */
export function timerText(timer: string, warning: boolean): TemplateResult {
  return html`<span class="timer" data-warning=${warning}>${timer}</span>`;
}

/**
 * A fixed-size slot holding several layers in the same grid cell, of which
 * one shows at a time.
 *
 * This is how the card changes what a region says without changing where
 * anything is: every layer is always rendered, stacked with `grid-area: 1/1`,
 * and a state change only moves `data-on` (an opacity crossfade). The slot's
 * size comes from CSS, never from whichever layer happens to be visible.
 * Hidden layers are `inert` so keyboard and screen-reader users only reach
 * the one on screen.
 */
export function layers<K extends string>(
  className: string,
  active: K,
  content: Record<K, unknown>,
): TemplateResult {
  return html`
    <div class="layers slot ${className}" data-active=${active}>
      ${(Object.keys(content) as K[]).map(
        (key) => html`
          <div
            class="layer layer-${key}"
            data-on=${key === active}
            ?inert=${key !== active}
            aria-hidden=${key !== active}
          >
            ${content[key]}
          </div>
        `,
      )}
    </div>
  `;
}

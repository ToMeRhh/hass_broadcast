import { TemplateResult, html, nothing } from "lit";

import { BroadcastMessage } from "../api";
import { formatClock, formatWhen } from "../format";

export interface HistoryProps {
  messages: BroadcastMessage[];
  /** The message currently loaded into the card, if it came from here. */
  loadedId?: string;
  /** The message being fetched right now. */
  loadingId?: string;
  onLoad: (message: BroadcastMessage) => void;
  onDelete: (id: string) => void;
  /** Injectable for tests; production reads the clock. */
  now?: Date;
}

/**
 * Recent messages.
 *
 * A row loads its message into the card rather than broadcasting it. The old
 * per-row Play button sent to the speakers on one tap, with no way to hear it
 * first and no undo — picking a message and sending it are now two decisions.
 */
export function historySection(props: HistoryProps): TemplateResult {
  const now = props.now ?? new Date();
  return html`
    <div class="history">
      <div class="section-head">
        <span>Recent messages</span>
        <span class="count">${props.messages.length || ""}</span>
      </div>
      ${props.messages.length === 0
        ? html`<div class="empty">Nothing recorded yet</div>`
        : props.messages.map(
            (message) => html`
              <div
                class="history-row"
                data-loaded="${props.loadedId === message.id}"
                data-loading="${props.loadingId === message.id}"
              >
                <button class="history-load" @click=${() => props.onLoad(message)}>
                  <span class="history-when">${formatWhen(message.created, now)}</span>
                  <span class="history-length">${formatClock(message.duration)}</span>
                </button>
                ${message.can_delete
                  ? html`
                      <button
                        class="icon"
                        title="Delete"
                        aria-label="Delete"
                        @click=${() => props.onDelete(message.id)}
                      >
                        ✕
                      </button>
                    `
                  : nothing}
              </div>
            `,
          )}
    </div>
  `;
}

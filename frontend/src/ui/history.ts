import { TemplateResult, html, nothing } from "lit";

import { BroadcastMessage } from "../api";
import { formatClock, formatWhen } from "../format";

/**
 * Rows the card body shows, and therefore its height.
 *
 * The body used to render every message the server returned, capped only by
 * the integration's `retention` option — 10 by default, up to 200. The card
 * grew by a row per recording and shrank on delete, reflowing every other card
 * on the dashboard. The slots below are reserved whether or not a message
 * fills them, so recording the first three does not move the layout either.
 */
export const BODY_ROWS = 3;

export interface HistoryProps {
  messages: BroadcastMessage[];
  /** The message currently loaded into the card, if it came from here. */
  loadedId?: string;
  /** The message being fetched right now. */
  loadingId?: string;
  onLoad: (message: BroadcastMessage) => void;
  onDelete: (id: string) => void;
  /** Whether the full-list dialog is showing. State lives in the card. */
  dialogOpen?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
  /** Injectable for tests; production reads the clock. */
  now?: Date;
}

/**
 * One message.
 *
 * A row loads its message into the card rather than broadcasting it. The old
 * per-row Play button sent to the speakers on one tap, with no way to hear it
 * first and no undo — picking a message and sending it are now two decisions.
 */
function historyRow(
  message: BroadcastMessage,
  props: HistoryProps,
  now: Date,
): TemplateResult {
  return html`
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
  `;
}

/**
 * The whole list, in a modal the card opens with `showModal()`. The list
 * style renders it from `historySection`; the icon style and the compact ⋮
 * menu render it directly, since they have no section to hang it from.
 */
export function historyDialog(
  props: HistoryProps,
  now: Date = props.now ?? new Date(),
): TemplateResult {
  const close = () => props.onDialogOpenChange?.(false);
  return html`
    <dialog class="history-dialog" @close=${close} @cancel=${close}>
      <div class="dialog-head">
        <span>Recent messages</span>
        <button class="icon" title="Close" aria-label="Close" @click=${close}>✕</button>
      </div>
      <div class="dialog-list">
        ${props.messages.length === 0
          ? html`<div class="empty">Nothing recorded yet</div>`
          : props.messages.map((message) => historyRow(message, props, now))}
      </div>
    </dialog>
  `;
}

/** Recent messages: a fixed three slots, with the rest behind the dialog. */
export function historySection(props: HistoryProps): TemplateResult {
  const now = props.now ?? new Date();
  const empty = props.messages.length === 0;
  const shown = props.messages.slice(0, BODY_ROWS);
  return html`
    <div class="history">
      <div class="section-head">
        <span>Recent messages</span>
        <button
          class="history-all"
          data-disabled="${empty}"
          ?disabled=${empty}
          @click=${() => props.onDialogOpenChange?.(true)}
        >
          ${empty ? "Show all" : `Show all · ${props.messages.length}`}
        </button>
      </div>
      <div class="history-slots">
        ${Array.from(
          { length: BODY_ROWS },
          (_, index) => html`
            <div class="history-slot">
              ${shown[index]
                ? historyRow(shown[index], props, now)
                : index === 0 && empty
                  ? html`<div class="empty">Nothing recorded yet</div>`
                  : nothing}
            </div>
          `,
        )}
      </div>
      ${props.dialogOpen ? historyDialog(props, now) : nothing}
    </div>
  `;
}

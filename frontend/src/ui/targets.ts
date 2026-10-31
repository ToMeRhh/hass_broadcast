import { TemplateResult, html, nothing } from "lit";

import { chevronIcon, speakerIcon } from "./icons";

import type { SpeakerPicker } from "../config";

export type ListStyle = SpeakerPicker;

export interface TargetPlayer {
  entityId: string;
  name: string;
  /** False when Home Assistant reports the entity unavailable. */
  available: boolean;
}

export interface TargetProps {
  players: TargetPlayer[];
  selected: string[];
  style: ListStyle;
  /** Dropdown only: whether the overlay panel is showing. */
  open: boolean;
  onToggle: (entityId: string) => void;
  onOpenChange: (open: boolean) => void;
}

/** How many speakers the dropdown summary names before it starts counting. */
const SUMMARY_NAMES = 2;

/** The one-line description of a selection, for the pill's closed state. */
export function summarize(
  players: TargetPlayer[],
  selected: string[],
): string {
  if (selected.length === 0) {
    return "No speakers selected";
  }
  const names = selected.map(
    (entityId) =>
      players.find((player) => player.entityId === entityId)?.name ?? entityId,
  );
  const shown = names.slice(0, SUMMARY_NAMES).join(", ");
  const rest = names.length - SUMMARY_NAMES;
  return rest > 0 ? `${shown} +${rest}` : shown;
}

function row(props: TargetProps, player: TargetPlayer): TemplateResult {
  const on = props.selected.includes(player.entityId);
  return html`
    <button
      class="target-row"
      role="checkbox"
      aria-checked=${on}
      data-on=${on}
      @click=${() => props.onToggle(player.entityId)}
    >
      <span class="target-name">${player.name}</span>
      ${player.available
        ? nothing
        : html`<span class="target-note">unavailable</span>`}
      <span class="target-check" aria-hidden="true">${on ? "✓" : ""}</span>
    </button>
  `;
}

function chip(props: TargetProps, player: TargetPlayer): TemplateResult {
  const on = props.selected.includes(player.entityId);
  return html`
    <button
      class="chip"
      role="checkbox"
      aria-checked=${on}
      data-on=${on}
      @click=${() => props.onToggle(player.entityId)}
    >
      ${player.name}${player.available ? "" : " (unavailable)"}
    </button>
  `;
}

/**
 * The speaker picker, in whichever style the card is configured for.
 *
 * Rows and chips show a header and counter above the body. The pill is a
 * single line that opens a panel carrying the same header, so it fits the
 * compact layout's one fixed row. Switching styles in the editor never
 * changes what the card can do.
 */
export function targetList(props: TargetProps): TemplateResult {
  const header = html`
    <div class="section-head">
      <span>Speakers</span>
      <span class="count">${props.selected.length} of ${props.players.length}</span>
    </div>
  `;

  if (props.players.length === 0) {
    return props.style === "dropdown"
      ? html`<div class="pill-wrap">
          <button class="pill" disabled>
            <span class="pill-icon">${speakerIcon}</span>
            <span class="pill-text">No speakers found</span>
          </button>
        </div>`
      : html`${header}<div class="empty">No speakers found</div>`;
  }

  if (props.style === "chips") {
    return html`
      ${header}
      <div class="chips">${props.players.map((player) => chip(props, player))}</div>
    `;
  }

  if (props.style === "dropdown") {
    return html`
      <div class="pill-wrap" data-popover="picker">
        <button
          class="pill"
          aria-expanded=${props.open}
          aria-haspopup="true"
          title=${summarize(props.players, props.selected)}
          @click=${() => props.onOpenChange(!props.open)}
        >
          <span class="pill-icon">${speakerIcon}</span>
          <span class="pill-text">${summarize(props.players, props.selected)}</span>
          <span class="pill-chevron">${chevronIcon}</span>
        </button>
        ${props.open
          ? html`
              <!-- Absolutely positioned: an inline panel would push
                   everything below it down the card. -->
              <div class="pill-panel">
                ${header}
                ${props.players.map((player) => row(props, player))}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  return html`
    ${header}
    <div class="target-rows">${props.players.map((player) => row(props, player))}</div>
  `;
}

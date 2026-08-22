import { css } from "lit";

/**
 * The card's stylesheet.
 *
 * The organising rule: every region has a fixed height and is always
 * rendered. Recording, listening back and broadcasting change content and
 * enabled-state, never layout — a card that jumps under your thumb while a
 * message is loading is the thing this redesign exists to remove.
 */
export const cardStyles = css`
  ha-card {
    padding: 16px;
  }

  /* --- status line ------------------------------------------------ */
  .status {
    min-height: 20px;
    font-size: 0.85em;
    line-height: 20px;
    text-align: center;
    margin-bottom: 4px;
  }
  .status.error {
    color: var(--error-color, #db4437);
  }
  .status.info {
    color: var(--secondary-text-color);
  }

  /* --- waveform strip --------------------------------------------- */
  .wave {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2px;
    height: 64px;
    padding: 0 4px;
    border-radius: 10px;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    touch-action: none;
  }
  .wave.seekable {
    cursor: pointer;
  }
  .bar {
    flex: 1;
    min-width: 2px;
    border-radius: 2px;
    /* Centred in a flex row, so a bar of height h reads as mirrored around
       the middle without drawing two of them. */
    background: var(--divider-color, #ddd);
    transition: height 80ms linear;
  }
  .bar.live,
  .bar.played {
    background: var(--primary-color, #03a9f4);
  }

  /* --- player row -------------------------------------------------- */
  .player {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 40px;
    padding: 0 4px;
  }
  .player .time {
    flex: 1;
    font-size: 0.85em;
    font-variant-numeric: tabular-nums;
    color: var(--secondary-text-color);
  }
  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .icon:hover:not([disabled]) {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
  }
  .icon[disabled] {
    color: var(--disabled-text-color, #bdbdbd);
    cursor: default;
  }
  .icon:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* --- broadcast --------------------------------------------------- */
  .broadcast {
    display: block;
    width: 100%;
    margin: 16px 0;
    padding: 14px;
    font: inherit;
    font-weight: 500;
    border: none;
    border-radius: 24px;
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
    cursor: pointer;
  }
  .broadcast[disabled] {
    background: var(--disabled-text-color, #bdbdbd);
    cursor: default;
  }
  .broadcast:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* --- record button ----------------------------------------------- */
  .record-row {
    display: flex;
    justify-content: center;
    padding: 8px 0 4px;
  }
  .record {
    width: 96px;
    height: 96px;
    border: none;
    border-radius: 50%;
    background: var(--error-color, #db4437);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    /* Stops the browser claiming the gesture as a scroll or a long-press. */
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
    transition: transform 120ms ease, box-shadow 120ms ease;
  }
  .record[data-recording="true"] {
    transform: scale(0.92);
    box-shadow: 0 0 0 8px rgba(219, 68, 55, 0.25);
  }
  .record[disabled] {
    background: var(--disabled-text-color, #bdbdbd);
    box-shadow: none;
    cursor: default;
  }
  .record:focus-visible {
    outline: 3px solid var(--primary-color);
    outline-offset: 4px;
  }
`;

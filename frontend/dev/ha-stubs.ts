/**
 * Minimal stand-ins for the Home Assistant frontend elements and CSS custom
 * properties the card relies on, so the harness renders something close to
 * what a real dashboard shows.
 *
 * Values are taken from HA's default light and dark themes. They are
 * approximations, not a fork of HA's theme system: close enough to judge
 * contrast, spacing and colour, not close enough to skip a final look on a
 * real install.
 */
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

/** Stand-in for HA's <ha-card>: a rounded surface with an optional header. */
@customElement("ha-card")
export class HaCardStub extends LitElement {
  @property() header?: string;

  static styles = css`
    :host {
      display: block;
      background: var(--ha-card-background, var(--card-background-color, #fff));
      border-radius: var(--ha-card-border-radius, 12px);
      box-shadow: var(--ha-card-box-shadow, none);
      border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
      color: var(--primary-text-color);
    }
    .header {
      color: var(--ha-card-header-color, var(--primary-text-color));
      font-family: var(--ha-card-header-font-family, inherit);
      font-size: var(--ha-card-header-font-size, 24px);
      font-weight: 400;
      letter-spacing: -0.012em;
      line-height: 48px;
      padding: 12px 16px 16px;
      display: block;
    }
  `;

  render() {
    return html`
      ${this.header ? html`<h1 class="header">${this.header}</h1>` : null}
      <slot></slot>
    `;
  }
}

const LIGHT = `
  --primary-color: #03a9f4;
  --accent-color: #ff9800;
  --primary-text-color: #212121;
  --secondary-text-color: #727272;
  --text-primary-color: #ffffff;
  --disabled-text-color: #bdbdbd;
  --error-color: #db4437;
  --success-color: #43a047;
  --warning-color: #ffa600;
  --divider-color: rgba(0, 0, 0, 0.12);
  --card-background-color: #ffffff;
  --primary-background-color: #fafafa;
  --secondary-background-color: #e5e5e5;
  --state-icon-color: #44739e;
  --ha-card-box-shadow: none;
  --ha-card-border-radius: 12px;
`;

const DARK = `
  --primary-color: #03a9f4;
  --accent-color: #ff9800;
  --primary-text-color: #e1e1e1;
  --secondary-text-color: #9b9b9b;
  --text-primary-color: #212121;
  --disabled-text-color: #545454;
  --error-color: #db4437;
  --success-color: #43a047;
  --warning-color: #ffa600;
  --divider-color: rgba(225, 225, 225, 0.12);
  --card-background-color: #1c1c1c;
  --primary-background-color: #111111;
  --secondary-background-color: #202020;
  --state-icon-color: #a1c9ea;
  --ha-card-box-shadow: none;
  --ha-card-border-radius: 12px;
`;

/** Applies one of HA's default themes to the page. */
export function applyTheme(theme: "light" | "dark"): void {
  document.documentElement.setAttribute("style", theme === "dark" ? DARK : LIGHT);
  document.documentElement.style.colorScheme = theme;
}

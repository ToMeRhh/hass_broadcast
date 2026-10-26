import { expect } from "vitest";
import { page } from "vitest/browser";

import type { Mounted } from "../mount";

/**
 * How far into every animation a screenshot is taken. The takes the tests
 * record are this long, so the countdown ring shows their real progress;
 * the bars' draw-in and every transition are long finished by then.
 */
export const FROZEN_AT_MS = 3000;

/**
 * Screenshot an element against its reference in __screenshots__/.
 *
 * Every animation in its shadow root is paused at FROZEN_AT_MS first, rather
 * than left to Playwright's `animations: "disabled"`: that cancels infinite
 * animations back to their base style, and the mic's level blob only gets its
 * shape from its animation, so it would be captured as a square no user sees.
 */
export async function shot(element: Mounted, name: string): Promise<void> {
  for (const animation of element.shadowRoot.getAnimations()) {
    animation.pause();
    animation.currentTime = FROZEN_AT_MS;
  }
  await expect
    .element(page.elementLocator(element))
    .toMatchScreenshot(name, { screenshotOptions: { animations: "allow" } });
}

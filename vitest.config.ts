import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

/** A test that needs a real browser: a rendered card, layout, real DOM. */
const BROWSER_TESTS = "frontend/test/**/*.browser.test.ts";

export default defineConfig({
  test: {
    // formatWhen buckets by *local* calendar day, and the tests assert
    // against UTC fixtures. Pinning the run's timezone here (rather than a
    // `TZ=UTC` shell prefix in package.json) keeps `npm test` portable to
    // Windows, where that prefix syntax does not work. The browser project
    // pins its own: the page's clock is Chromium's, not this process's.
    env: {
      TZ: "UTC",
    },
    // Off unless asked for: `npm test` stays as it is, and CI runs
    // `npx vitest run --coverage`. Every file under frontend/src/ counts,
    // including ones no test imports, so the number is not flattered by
    // leaving files out. json-summary is what CI turns into the job summary.
    // Both projects report into the one summary.
    coverage: {
      provider: "v8",
      include: ["frontend/src/**"],
      reporter: ["text", "json-summary"],
    },
    // Both inherit everything above (inline projects do, from Vitest 5).
    projects: [
      {
        // Plain Node: fast, and enough for everything that does not need a
        // real DOM. Lit's SSR DOM shim lets the card construct here, which
        // is how the renderedText() tests run.
        test: {
          name: "unit",
          include: ["frontend/test/**/*.test.ts"],
          exclude: [BROWSER_TESTS],
        },
      },
      {
        // Headless Chromium through Playwright: the card mounted into a real
        // document, shadow DOM, styles and layout included. Needs the browser
        // installed once per machine: `npx playwright install chromium`.
        test: {
          name: "browser",
          include: [BROWSER_TESTS],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ contextOptions: { timezoneId: "UTC" } }),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});

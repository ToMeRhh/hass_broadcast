import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// Visual regression tests: run with `npm run test:visual`, never bare
// `vitest`. frontend/dev/visual.mjs starts the browser in the Playwright
// Docker image and passes its address here, so every machine (and CI) renders
// the same pixels. A host browser would write references that only match the
// machine that made them, so there is no fallback to one.
const wsEndpoint = process.env.PW_WS_ENDPOINT;
if (!wsEndpoint) {
  throw new Error("Run the visual tests with `npm run test:visual`.");
}

export default defineConfig({
  test: {
    name: "visual",
    include: ["frontend/test/visual/**/*.visual.test.ts"],
    setupFiles: ["frontend/test/visual/setup.ts"],
    // As in vitest.config.ts: history timestamps bucket by local day.
    env: { TZ: "UTC" },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({
        // `<loopback>` lets the browser in the container reach vitest's
        // server on this machine's 127.0.0.1, tunnelled over the connection.
        connectOptions: { wsEndpoint, exposeNetwork: "<loopback>" },
        contextOptions: { timezoneId: "UTC", deviceScaleFactor: 1 },
      }),
      instances: [{ browser: "chromium" }],
      viewport: { width: 800, height: 900 },
      expect: {
        toMatchScreenshot: {
          // One set for every platform: the browser is always the
          // container's, so the default `-chromium-<platform>` suffix would
          // only split identical images by the OS of whoever ran the tests.
          resolveScreenshotPath: ({ arg, ext, root, testFileDirectory, testFileName }) =>
            `${root}/${testFileDirectory}/__screenshots__/${testFileName}/${arg}${ext}`,
        },
      },
    },
  },
});

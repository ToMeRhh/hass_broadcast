import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // formatWhen buckets by *local* calendar day, and the tests assert
    // against UTC fixtures. Pinning the run's timezone here (rather than a
    // `TZ=UTC` shell prefix in package.json) keeps `npm test` portable to
    // Windows, where that prefix syntax does not work.
    env: {
      TZ: "UTC",
    },
  },
});

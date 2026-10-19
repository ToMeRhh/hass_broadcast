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
    // Off unless asked for: `npm test` stays as it is, and CI runs
    // `npx vitest run --coverage`. Every file under frontend/src/ counts,
    // including ones no test imports, so the number is not flattered by
    // leaving files out. json-summary is what CI turns into the job summary.
    coverage: {
      provider: "v8",
      include: ["frontend/src/**"],
      reporter: ["text", "json-summary"],
    },
  },
});

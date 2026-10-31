/**
 * npm run test:visual [-- vitest args, e.g. -u]
 *
 * Runs the visual tests (vitest.visual.config.ts) against a Chromium inside
 * the Playwright Docker image, so every machine renders the same pixels: the
 * tests run here, the browser runs there. Starts the container, points vitest
 * at it through PW_WS_ENDPOINT, and removes it afterwards.
 *
 * The image tag follows the installed `playwright` package, because the
 * client and the server must be the same version; a dependabot bump moves
 * both.
 *
 * Docker is optional for developing: CI runs this as the `visual` job, and
 * the "Update screenshots" workflow regenerates the reference screenshots on
 * a branch (README, Development).
 */
import { execFileSync, spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:net";

const { version } = JSON.parse(
  readFileSync(new URL("../../node_modules/playwright/package.json", import.meta.url)),
);
const IMAGE = `mcr.microsoft.com/playwright:v${version}-noble`;
const NAME = `hass-broadcast-visual-${process.pid}`;

function docker(...args) {
  return execFileSync("docker", args, { encoding: "utf8" }).trim();
}

try {
  docker("version", "--format", "{{.Server.Version}}");
} catch {
  console.error(
    "test:visual needs Docker, to render in the same browser as CI.\n" +
      "Without it, push and let CI's `visual` job check the screenshots; run the\n" +
      "\"Update screenshots\" workflow on the branch for an intended change.",
  );
  process.exit(1);
}

/** A free port on this machine's loopback. */
async function freePort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

// On Linux the container shares the host's network and listens on loopback
// only. Docker Desktop (macOS, Windows) runs containers in a VM, so there the
// port is published to loopback instead. `npx -y` fetches the playwright
// package; the image ships its browsers.
const port = await freePort();
const network =
  process.platform === "linux"
    ? ["--network=host"]
    : ["-p", `127.0.0.1:${port}:${port}`];
const listen = process.platform === "linux" ? "127.0.0.1" : "0.0.0.0";
docker(
  "run", "-d", "--rm", "--name", NAME, "--init", "--ipc=host", "--user", "pwuser",
  ...network, IMAGE,
  "/bin/sh", "-c", `npx -y playwright@${version} run-server --port ${port} --host ${listen}`,
);
const stop = () => {
  try {
    docker("rm", "-f", NAME);
  } catch {
    // Already gone.
  }
};
process.on("SIGINT", () => {
  stop();
  process.exit(130);
});

let code = 1;
try {
  const deadline = Date.now() + 120_000;
  while (!docker("logs", NAME).includes("Listening on")) {
    if (Date.now() > deadline) {
      throw new Error(`${IMAGE} did not start: ${docker("logs", NAME)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  const vitest = spawn(
    "npx",
    ["vitest", "run", "-c", "vitest.visual.config.ts", ...process.argv.slice(2)],
    {
      stdio: "inherit",
      env: { ...process.env, PW_WS_ENDPOINT: `ws://127.0.0.1:${port}/` },
    },
  );
  code = await new Promise((resolve) => vitest.on("exit", (status) => resolve(status ?? 1)));
} finally {
  stop();
}
process.exit(code);

/**
 * npm run dev:editor                  the gallery, with our editors, on :8100
 * npm run dev:editor -- --screenshots write the README's editor images, then exit
 *
 * Both cards' editors are Home Assistant's own forms (`getConfigForm()`), so
 * only Home Assistant's frontend can draw them. This runs its design gallery —
 * the same thing that serves design.home-assistant.io — locally, from a pinned
 * checkout of home-assistant/frontend, with one extra page (hass-broadcast.ts,
 * next to this file) that renders our real bundle's editors and cards against
 * the gallery's fake `hass`. See frontend/dev/README.md.
 *
 * Everything it downloads lives in .cache/hass-broadcast-editor (gitignored):
 * the checkout, its node_modules, and the Node version it requires, which is
 * used for the gallery alone and never put on your PATH. The first run takes a
 * few minutes; later ones start in seconds. Not in CI, like check:layout.
 */
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

import * as esbuild from "esbuild";

/**
 * The home-assistant/frontend commit the gallery is built from: a `dev`
 * commit, because release tags are cut for the app build and the gallery does
 * not necessarily build from them (20260930.3's lockfile leaves a Babel plugin
 * unresolvable). Bump it deliberately, and check the page still renders.
 */
const FRONTEND_COMMIT = "a83d32f7c97d839920b2e9d689b0502e5ccfc518"; // 2026-10-15
const PORT = 8100;

const ROOT = resolve(import.meta.dirname, "../../..");
// Not under node_modules: Node refuses to strip types from .ts files there,
// and the gallery's build scripts are TypeScript.
const CACHE = join(ROOT, ".cache/hass-broadcast-editor");
const FRONTEND = join(CACHE, "frontend");
const PAGE = join(import.meta.dirname, "hass-broadcast.ts");
const IMAGES = join(ROOT, "docs/images");

const { values: flags } = parseArgs({
  options: { screenshots: { type: "boolean", default: false } },
  strict: true,
});

const log = (message) => console.log(`[dev:editor] ${message}`);

function run(command, args, options = {}) {
  execFileSync(command, args, { stdio: "inherit", ...options });
}

/** A shallow checkout of FRONTEND_COMMIT, replaced when the commit changes. */
function ensureCheckout() {
  const stamp = join(FRONTEND, ".hass-broadcast-commit");
  if (existsSync(stamp) && readFileSync(stamp, "utf8") === FRONTEND_COMMIT) {
    return;
  }
  log(`fetching home-assistant/frontend ${FRONTEND_COMMIT.slice(0, 12)}`);
  rmSync(FRONTEND, { recursive: true, force: true });
  mkdirSync(FRONTEND, { recursive: true });
  const git = (...args) => run("git", ["-C", FRONTEND, ...args]);
  git("init", "--quiet");
  git("fetch", "--quiet", "--depth", "1", "https://github.com/home-assistant/frontend.git", FRONTEND_COMMIT);
  git("checkout", "--quiet", "FETCH_HEAD");
  writeFileSync(stamp, FRONTEND_COMMIT);
}

/** The Node release the checkout's .nvmrc asks for, downloaded once. */
function ensureNode() {
  const version = readFileSync(join(FRONTEND, ".nvmrc"), "utf8").trim().replace(/^v/, "");
  const platform = { linux: "linux", darwin: "darwin" }[process.platform];
  const arch = { x64: "x64", arm64: "arm64" }[process.arch];
  if (!platform || !arch) {
    throw new Error(`dev:editor supports Linux and macOS on x64/arm64, not ${process.platform}/${process.arch}`);
  }
  const dir = join(CACHE, `node-v${version}`);
  if (!existsSync(join(dir, "bin/node"))) {
    log(`downloading Node ${version} for the gallery`);
    mkdirSync(dir, { recursive: true });
    const url = `https://nodejs.org/dist/v${version}/node-v${version}-${platform}-${arch}.tar.xz`;
    run("sh", ["-c", `curl -fsSL "$0" | tar -xJ -C "$1" --strip-components=1`, url, dir]);
  }
  return join(dir, "bin");
}

/** Install the checkout's dependencies whenever its lockfile changes. */
function ensureDependencies(env) {
  const lock = readFileSync(join(FRONTEND, "pnpm-lock.yaml"));
  const hash = createHash("sha256").update(lock).digest("hex");
  const stamp = join(FRONTEND, "node_modules/.hass-broadcast-lock");
  if (existsSync(stamp) && readFileSync(stamp, "utf8") === hash) {
    return;
  }
  log("installing the gallery's dependencies");
  run("corepack", ["pnpm", "install", "--frozen-lockfile"], { cwd: FRONTEND, env });
  writeFileSync(stamp, hash);
}

/**
 * Our bundle, unminified, where the page imports it from. The gallery copies
 * gallery/public into its output when it starts; writing to the output too
 * lets a rebuild show up on a reload without restarting the gallery.
 */
async function bundle(watch) {
  const targets = [join(FRONTEND, "gallery/public/hass-broadcast"), join(FRONTEND, "gallery/dist/hass-broadcast")];
  const copy = {
    name: "copy-to-gallery",
    setup(build) {
      build.onEnd((result) => {
        if (result.errors.length) {
          return;
        }
        for (const target of targets.slice(1)) {
          if (existsSync(join(target, ".."))) {
            mkdirSync(target, { recursive: true });
            cpSync(join(targets[0], "card.js"), join(target, "card.js"));
          }
        }
        if (watch) {
          log("rebuilt the cards — reload the page");
        }
      });
    },
  };
  const options = {
    entryPoints: [join(ROOT, "frontend/src/card.ts")],
    bundle: true,
    format: "esm",
    target: "es2021",
    outfile: join(targets[0], "card.js"),
    plugins: [copy],
    logLevel: "warning",
  };
  if (watch) {
    const context = await esbuild.context(options);
    await context.watch();
  } else {
    await esbuild.build(options);
  }
}

function installPage() {
  const pages = join(FRONTEND, "gallery/src/pages/misc");
  cpSync(PAGE, join(pages, "hass-broadcast.ts"));
  writeFileSync(
    join(pages, "hass-broadcast.markdown"),
    "---\ntitle: Voice Broadcast editors\n---\n\nThe hass_broadcast cards' editors, as Home Assistant draws them.\n",
  );
}

const GALLERY_LOG = join(CACHE, "gallery.log");

/**
 * The gallery's dev server, under the gallery's own Node, in the foreground,
 * as a killable process group. With --screenshots its output goes to a log
 * file, printed if it never comes up.
 */
function startGallery(nodeBin, env) {
  const output = flags.screenshots ? openSync(GALLERY_LOG, "w") : "inherit";
  return spawn(join(nodeBin, "node"), ["build-scripts/dev-server.mjs", "--suite", "gallery"], {
    cwd: FRONTEND,
    env: { ...env, HA_DEV_BACKGROUND: "0" },
    stdio: ["ignore", output, output],
    detached: true,
  });
}

async function waitForGallery(gallery) {
  let exited = false;
  gallery.once("exit", () => {
    exited = true;
  });
  const deadline = Date.now() + 10 * 60_000;
  while (Date.now() < deadline && !exited) {
    try {
      const response = await fetch(`http://localhost:${PORT}/`);
      if (response.ok) {
        return;
      }
    } catch {
      // Not listening yet.
    }
    await new Promise((done) => setTimeout(done, 2000));
  }
  if (flags.screenshots && existsSync(GALLERY_LOG)) {
    console.error(readFileSync(GALLERY_LOG, "utf8").split("\n").slice(-30).join("\n"));
  }
  throw new Error(exited ? "the gallery exited before it was ready" : "the gallery did not start within 10 minutes");
}

async function screenshots() {
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 4000 } });
    await page.goto(`http://localhost:${PORT}/#misc/hass-broadcast`);
    await page.waitForFunction(
      () => {
        const deep = (root) => {
          for (const el of root.querySelectorAll("*")) {
            if (el.matches(".editor-card")) return el;
            const found = el.shadowRoot && deep(el.shadowRoot);
            if (found) return found;
          }
        };
        return deep(document);
      },
      undefined,
      { timeout: 120_000 },
    );
    // Selectors and entity pickers finish loading after the form appears.
    await page.waitForTimeout(4000);
    const editors = await page.evaluateHandle(() => {
      const found = [];
      const walk = (root) => {
        root.querySelectorAll(".editor-card").forEach((el) => found.push(el));
        root.querySelectorAll("*").forEach((el) => el.shadowRoot && walk(el.shadowRoot));
      };
      walk(document);
      return found;
    });
    for (const [index, theme] of ["light", "dark"].entries()) {
      if (theme === "dark") {
        await page.evaluate(() => {
          const find = (root) => {
            for (const el of root.querySelectorAll("*")) {
              if (el.localName === "demo-misc-hass-broadcast") return el;
              const found = el.shadowRoot && find(el.shadowRoot);
              if (found) return found;
            }
          };
          find(document).showDarkThumbnails(true);
        });
        await page.waitForTimeout(500);
      }
      const editor = await editors.evaluateHandle((list, i) => list[i], index);
      const path = join(IMAGES, `editor-${theme}.png`);
      await editor.screenshot({ path });
      log(`wrote ${path}`);
    }
  } finally {
    await browser.close();
  }
}

ensureCheckout();
const nodeBin = ensureNode();
const env = {
  ...process.env,
  PATH: `${nodeBin}:${process.env.PATH}`,
  COREPACK_ENABLE_DOWNLOAD_PROMPT: "0",
  // Otherwise the build stops to ask for a GitHub login, to download
  // translations the gallery does not need: English ships in the repo.
  SKIP_FETCH_NIGHTLY_TRANSLATIONS: "1",
};
ensureDependencies(env);
installPage();
await bundle(!flags.screenshots);

const gallery = startGallery(nodeBin, env);
const stop = () => {
  try {
    process.kill(-gallery.pid, "SIGTERM");
  } catch {
    // Already gone.
  }
};
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stop();
    process.exit(130);
  });
}

if (flags.screenshots) {
  try {
    await waitForGallery(gallery);
    // The output directory exists now; put the bundle in it.
    await bundle(false);
    await screenshots();
  } finally {
    stop();
  }
  process.exit(0);
} else {
  await waitForGallery(gallery);
  await bundle(false);
  log(`open http://localhost:${PORT}/#misc/hass-broadcast`);
  gallery.on("exit", (code) => process.exit(code ?? 0));
}

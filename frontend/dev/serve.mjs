// Dev harness server. Renders the real card against a mocked `hass` so the UI
// can be iterated on without a Home Assistant install. See frontend/dev/README.md.
//
// Deliberately dependency-free beyond esbuild, which is already a devDependency:
// node's own http/fs is enough, and a dev-only tool should not add packages.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import * as esbuild from "esbuild";

const ROOT = resolve(import.meta.dirname, "../..");
const DEV_DIR = join(ROOT, "frontend/dev");
const BUILD_DIR = join(DEV_DIR, ".build");
// The recorder hardcodes /api/hass_broadcast/static/recorder-worklet.js, so the
// harness has to serve that exact path or real microphone capture cannot work.
const STATIC_DIR = join(ROOT, "custom_components/hass_broadcast/www");
const PORT = Number(process.env.PORT ?? 8099);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".wav": "audio/wav",
  ".svg": "image/svg+xml",
};

/** Open SSE connections, notified after every successful rebuild. */
const reloadClients = new Set();

const reloadPlugin = {
  name: "dev-reload",
  setup(build) {
    build.onEnd((result) => {
      const stamp = new Date().toLocaleTimeString();
      if (result.errors.length > 0) {
        console.error(`[${stamp}] build failed (${result.errors.length} errors)`);
        return;
      }
      console.log(`[${stamp}] rebuilt${reloadClients.size ? " — reloading browser" : ""}`);
      for (const client of reloadClients) {
        client.write("data: reload\n\n");
      }
    });
  },
};

const ctx = await esbuild.context({
  entryPoints: [join(DEV_DIR, "main.ts")],
  bundle: true,
  format: "esm",
  target: "es2021",
  sourcemap: true,
  outfile: join(BUILD_DIR, "dev.js"),
  plugins: [reloadPlugin],
});
await ctx.watch();

/** Resolve `urlPath` inside `dir`, refusing anything that escapes it. */
function safeJoin(dir, urlPath) {
  const path = join(dir, normalize(decodeURIComponent(urlPath)));
  return path.startsWith(dir) ? path : undefined;
}

async function serveFile(res, path) {
  if (!path) {
    res.writeHead(403).end("forbidden");
    return;
  }
  try {
    const body = await readFile(path);
    res.writeHead(200, {
      "Content-Type": MIME[extname(path)] ?? "application/octet-stream",
      // Iterating means reloading constantly; a cached bundle is never wanted here.
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  if (path === "/esbuild-reload") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
    });
    res.write("retry: 500\n\n");
    reloadClients.add(res);
    req.on("close", () => reloadClients.delete(res));
    return;
  }

  if (path === "/" || path === "/index.html") {
    await serveFile(res, join(DEV_DIR, "index.html"));
    return;
  }
  if (path.startsWith("/.build/")) {
    await serveFile(res, safeJoin(BUILD_DIR, path.slice("/.build".length)));
    return;
  }
  if (path.startsWith("/api/hass_broadcast/static/")) {
    await serveFile(res, safeJoin(STATIC_DIR, path.slice("/api/hass_broadcast/static".length)));
    return;
  }
  res.writeHead(404).end("not found");
}).listen(PORT, () => {
  console.log(`\n  Voice Broadcast card harness → http://localhost:${PORT}\n`);
  console.log("  localhost counts as a secure context, so the microphone really records.\n");
});

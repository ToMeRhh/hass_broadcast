// Dev harness server. Renders the real card against a mocked `hass` so the UI
// can be iterated on without a Home Assistant install. See frontend/dev/README.md.
//
// Deliberately dependency-free beyond esbuild, which is already a devDependency:
// node's own http/fs is enough, and a dev-only tool should not add packages.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { networkInterfaces } from "node:os";
import { extname, join, normalize, resolve } from "node:path";
import { parseArgs } from "node:util";
import * as esbuild from "esbuild";

const ROOT = resolve(import.meta.dirname, "../..");
const DEV_DIR = join(ROOT, "frontend/dev");
const BUILD_DIR = join(DEV_DIR, ".build");
// The recorder hardcodes /api/hass_broadcast/static/recorder-worklet.js, so the
// harness has to serve that exact path or real microphone capture cannot work.
const STATIC_DIR = join(ROOT, "custom_components/hass_broadcast/www");

// npm run dev -- --host 192.168.1.20 --port 9000, or HOST=... PORT=... npm run dev.
// The default binds every interface, so the harness is reachable from other
// devices on the network without any flag.
let flags;
try {
  ({ values: flags } = parseArgs({
    options: { host: { type: "string" }, port: { type: "string" } },
    strict: true,
  }));
} catch (error) {
  // A stack trace is the wrong answer to a mistyped flag on a dev tool.
  console.error(`\n  ${error.message}`);
  console.error("  usage: npm run dev -- [--host <address>] [--port <number>]\n");
  process.exit(1);
}
const HOST = flags.host ?? process.env.HOST ?? "0.0.0.0";
const PORT = Number(flags.port ?? process.env.PORT ?? 8099);

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
  entryPoints: {
    dev: join(DEV_DIR, "main.ts"),
    lab: join(DEV_DIR, "lab.ts"),
    voice: join(DEV_DIR, "voice.ts"),
  },
  define: { VOICE_SAMPLES: "undefined", VOICE_NEURAL: "undefined" },
  // Signalsmith Stretch builds its AudioWorklet by stringifying its own
  // functions; lowered class fields would call an esbuild helper that does
  // not exist in the worklet scope. Every AudioWorklet browser has them.
  supported: { "class-field": true, "class-static-field": true },
  bundle: true,
  format: "esm",
  target: "es2021",
  sourcemap: true,
  outdir: BUILD_DIR,
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
  if (path === "/lab") {
    await serveFile(res, join(DEV_DIR, "lab.html"));
    return;
  }
  if (path === "/voice") {
    await serveFile(res, join(DEV_DIR, "voice.html"));
    return;
  }
  if (path === "/lab/mp3" && req.method === "POST") {
    await transcode(req, res, url.searchParams.get("bitrate") ?? "128k");
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
}).listen(PORT, HOST, () => {
  console.log("\n  Voice Broadcast card harness\n");
  for (const address of addresses()) {
    console.log(`    ${address}`);
  }
  // Worth repeating on every start, because the difference is invisible in the
  // UI: only localhost is a secure context, so anywhere else the browser hides
  // getUserMedia and the harness substitutes a simulated recorder.
  console.log("\n  Real microphone on localhost; simulated recording on every other address.\n");
});

/**
 * The sound lab's MP3 step: the ffmpeg command async_transcode_to_mp3 in
 * audio_processing.py runs, with the bitrate left to the preset. Keep the two
 * in step, or the lab stops predicting what the speaker plays.
 */
async function transcode(req, res, bitrate) {
  if (!/^\d{2,3}k$/.test(bitrate)) {
    res.writeHead(400).end(`bad bitrate: ${bitrate}`);
    return;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);

  const ffmpeg = spawn("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-i", "pipe:0",
    "-codec:a", "libmp3lame", "-ar", "44100", "-b:a", bitrate, "-f", "mp3", "pipe:1",
  ]);
  const out = [];
  const err = [];
  ffmpeg.stdout.on("data", (chunk) => out.push(chunk));
  ffmpeg.stderr.on("data", (chunk) => err.push(chunk));
  ffmpeg.stdin.on("error", () => {});
  ffmpeg.stdin.end(Buffer.concat(chunks));

  const code = await new Promise((done) => {
    ffmpeg.on("error", () => done("missing"));
    ffmpeg.on("close", done);
  });
  if (code === "missing") {
    res.writeHead(501).end("ffmpeg is not on PATH; install it to hear the MP3 step");
  } else if (code !== 0) {
    res.writeHead(500).end(`ffmpeg failed: ${Buffer.concat(err).toString().trim()}`);
  } else {
    res.writeHead(200, { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" });
    res.end(Buffer.concat(out));
  }
}

/** Every URL this server can be reached on, so a phone or tablet has one to type. */
function addresses() {
  if (HOST !== "0.0.0.0" && HOST !== "::") {
    return [`http://${HOST.includes(":") ? `[${HOST}]` : HOST}:${PORT}`];
  }
  const external = Object.values(networkInterfaces())
    .flat()
    .filter((item) => item && item.family === "IPv4" && !item.internal)
    .map((item) => `http://${item.address}:${PORT}`);
  return [`http://localhost:${PORT}`, ...external];
}

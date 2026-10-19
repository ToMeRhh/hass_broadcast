/**
 * npm run brand
 *
 * Renders every brand image from docs/brand/icon.svg, so they are regenerated
 * rather than hand-exported:
 *
 * - custom_components/hass_broadcast/brand/: icon and logo PNGs. Home
 *   Assistant 2026.3+ shows these for a custom integration instead of looking
 *   it up in home-assistant/brands.
 * - docs/brand/social-preview.png: the repository's social preview (1280x640),
 *   with the real card mid-take, drawn by the dev harness. GitHub has no API
 *   for it: upload it under Settings → General → Social preview.
 *
 * Text is set in Roboto, Home Assistant's font, from the home-assistant-frontend
 * package in .venv (requirements_test.txt; VENV=<path> points elsewhere, e.g.
 * from a worktree). Without it the script stops, since a fallback font would
 * change the committed images.
 * First time on a machine: npx playwright-core install chromium
 */
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { chromium } from "playwright-core";

const ROOT = resolve(import.meta.dirname, "../..");
const BRAND = join(ROOT, "custom_components/hass_broadcast/brand");
const DOCS = join(ROOT, "docs/brand");
const PORT = Number(process.env.BRAND_PORT ?? 8198);

const icon = readFileSync(join(DOCS, "icon.svg"), "utf8");

function roboto(weight) {
  const lib = join(process.env.VENV ?? join(ROOT, ".venv"), "lib");
  for (const python of readdirSync(lib)) {
    const file = join(lib, python, "site-packages/hass_frontend/static/fonts/roboto", `Roboto-${weight}.woff2`);
    try {
      return readFileSync(file).toString("base64");
    } catch {
      // Not under this Python; try the next.
    }
  }
  throw new Error(`Roboto-${weight}.woff2 not found: pip install -r requirements_test.txt into .venv`);
}
const fonts = `
  @font-face { font-family: Roboto; font-weight: 400; src: url(data:font/woff2;base64,${roboto("Regular")}); }
  @font-face { font-family: Roboto; font-weight: 500; src: url(data:font/woff2;base64,${roboto("Medium")}); }
`;

/** Screenshot an HTML fragment's #art element, with a transparent background. */
async function render(page, body, path) {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.setContent(
    `<style>${fonts} html, body { margin: 0; background: transparent; } #art { display: inline-block; }</style>
     <div id="art">${body}</div>`,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#art").screenshot({ path, omitBackground: true });
  console.log(`wrote ${path.slice(ROOT.length + 1)}`);
}

const sized = (size) => icon.replace('width="256" height="256"', `width="${size}" height="${size}"`);

/** The icon beside the name: the logo, `size` px tall. */
const lockup = (size, color) => `
  <div style="display: flex; align-items: center; gap: ${size * 0.12}px; padding-right: ${size * 0.06}px;
              font: 500 ${size * 0.4}px Roboto; color: ${color}; white-space: nowrap;">
    ${sized(size)}<span>Voice Broadcast</span>
  </div>`;

/** The real card, mid-take, from the dev harness. Returns a PNG data URL. */
async function cardMidTake(browser) {
  const server = spawn(
    process.execPath,
    ["frontend/dev/serve.mjs", "--host", "127.0.0.1", "--port", String(PORT)],
    { cwd: ROOT, stdio: ["ignore", "pipe", "inherit"] },
  );
  try {
    await new Promise((done, fail) => {
      server.stdout.on("data", (chunk) => String(chunk).includes("rebuilt") && done());
      server.on("exit", (code) => fail(new Error(`dev server exited (${code})`)));
    });
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${PORT}`);
    await page.addStyleTag({ content: fonts });
    const app = page.locator("dev-app");
    await app.locator("label", { hasText: "Simulated recording" }).locator("input").check();
    await app.locator("button", { hasText: "Phone" }).click();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const card = page.locator("hass-broadcast-card");
    const mic = await card.locator("button.mic").boundingBox();
    await page.mouse.move(mic.x + mic.width / 2, mic.y + mic.height / 2);
    await page.mouse.down();
    // Long enough for the strip to fill and the blobs to be mid-swell.
    await page.waitForTimeout(2200);
    const png = await card.screenshot({ animations: "allow" });
    await page.mouse.up();
    await page.close();
    return `data:image/png;base64,${png.toString("base64")}`;
  } finally {
    server.kill();
  }
}

mkdirSync(BRAND, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage();

  // Icons: square, 256 and 512.
  await render(page, sized(256), join(BRAND, "icon.png"));
  await render(page, sized(512), join(BRAND, "icon@2x.png"));

  // Logos: the icon and the name, 128 and 256 tall; dark_ for dark themes.
  await render(page, lockup(128, "#212121"), join(BRAND, "logo.png"));
  await render(page, lockup(256, "#212121"), join(BRAND, "logo@2x.png"));
  await render(page, lockup(128, "#e1e1e1"), join(BRAND, "dark_logo.png"));
  await render(page, lockup(256, "#e1e1e1"), join(BRAND, "dark_logo@2x.png"));

  // Social preview: 1280x640, the brand on the left, the card on the right.
  const card = await cardMidTake(browser);
  await page.setViewportSize({ width: 1280, height: 640 });
  await page.setContent(`
    <style>${fonts}
      html, body { margin: 0; }
      #art { width: 1280px; height: 640px; box-sizing: border-box; padding: 0 88px;
             display: flex; align-items: center; justify-content: space-between; gap: 48px;
             background: linear-gradient(135deg, #fafafa, #eef1f4); font-family: Roboto; color: #212121; }
      h1 { margin: 24px 0 16px; font-size: 64px; font-weight: 500; letter-spacing: -0.5px; }
      p { margin: 0; font-size: 28px; line-height: 1.4; color: #555; }
      .for { margin-top: 28px; font-size: 22px; color: #03a9f4; font-weight: 500; }
      img { width: 440px; border-radius: 14px; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12); }
    </style>
    <div id="art">
      <div>
        ${sized(132)}
        <h1>Voice Broadcast</h1>
        <p>Record a voice message on your dashboard<br>and play it on your speakers.</p>
        <div class="for">Home Assistant · HACS</div>
      </div>
      <img src="${card}" alt="">
    </div>`);
  await page.evaluate(() => document.fonts.ready);
  const social = join(DOCS, "social-preview.png");
  await page.locator("#art").screenshot({ path: social });
  console.log(`wrote ${social.slice(ROOT.length + 1)}`);
} finally {
  await browser.close();
}

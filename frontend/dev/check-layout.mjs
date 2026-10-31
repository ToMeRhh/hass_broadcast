/**
 * npm run check:layout
 *
 * Proves the card's central promise: nothing moves between idle, recording,
 * review and sending. Starts the dev harness on a spare port, drives the real
 * card through every state in each layout with a headless Chromium, records
 * the box of every `.slot` (and of the card itself) in each state, and fails
 * if any of them differs from idle. Screenshots of every state land in a temp
 * directory for a human to look at too.
 *
 * vitest cannot do this: it runs without a layout engine. CI runs it as the
 * `layout` job; run it locally too before pushing UI work.
 * First time on a machine: npx playwright-core install chromium
 */
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { chromium } from "playwright-core";

const PORT = Number(process.env.CHECK_PORT ?? 8199);
const URL = `http://127.0.0.1:${PORT}`;
const shots = mkdtempSync(join(tmpdir(), "hass-broadcast-layout-"));

const server = spawn(
  process.execPath,
  ["frontend/dev/serve.mjs", "--host", "127.0.0.1", "--port", String(PORT)],
  { stdio: ["ignore", "pipe", "inherit"] },
);
await new Promise((resolve, reject) => {
  server.stdout.on("data", (chunk) => {
    if (String(chunk).includes("rebuilt")) resolve();
  });
  server.on("exit", (code) => reject(new Error(`dev server exited (${code})`)));
});

/** Every slot's box in an element's shadow root, plus the element's own. */
async function geometry(page, selector) {
  return page.evaluate((selector) => {
    const host = document
      .querySelector("dev-app")
      .shadowRoot.querySelector(selector);
    const box = (element) => {
      const r = element.getBoundingClientRect();
      return [r.x, r.y, r.width, r.height].map((n) => Math.round(n * 10) / 10);
    };
    const slots = [...host.shadowRoot.querySelectorAll(".slot")];
    return { host: box(host), slots: slots.map(box) };
  }, selector);
}

function diff(a, b) {
  const problems = [];
  if (JSON.stringify(a.host) !== JSON.stringify(b.host)) {
    problems.push(`card box ${a.host} → ${b.host}`);
  }
  if (a.slots.length !== b.slots.length) {
    problems.push(`slot count ${a.slots.length} → ${b.slots.length}`);
  }
  a.slots.forEach((box, index) => {
    if (JSON.stringify(box) !== JSON.stringify(b.slots[index])) {
      problems.push(`slot ${index} ${box} → ${b.slots[index]}`);
    }
  });
  return problems;
}

let failures = 0;
const browser = await chromium.launch();
try {
  // Each config is the harness's card-config buttons to press, in order.
  const configs = {
    full: ["Full"],
    "full-lists": ["Full", "List", "History list"],
    compact: ["Compact"],
    // Temporary sends put Save in the strip, in the review and status layers.
    "full-temporary": ["Full", "Temporary"],
    "compact-temporary": ["Compact", "Temporary"],
  };
  for (const [layout, presses] of Object.entries(configs)) {
    for (const width of ["Phone", "Desktop"]) {
      const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
      await page.goto(URL);
      const app = page.locator("dev-app");
      await app.locator("label", { hasText: "Simulated recording" }).locator("input").check();
      await app.locator("button", { hasText: width }).click();
      for (const label of presses) {
        // Exact: "List" would otherwise also match "History list".
        await app.locator("#card-config button", { hasText: new RegExp(`^\\s*${label}\\s*$`) }).click();
      }
      await page.waitForTimeout(300);

      const card = page.locator("hass-broadcast-card");
      const states = {};
      const capture = async (name) => {
        // Past every crossfade, so a mid-transition frame cannot pass or fail.
        await page.waitForTimeout(400);
        states[name] = await geometry(page, "hass-broadcast-card");
        await card.screenshot({ path: join(shots, `${layout}-${width}-${name}.png`) });
      };

      await capture("idle");
      const mic = await card.locator("button.mic").boundingBox();
      await page.mouse.move(mic.x + mic.width / 2, mic.y + mic.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(1200);
      await capture("recording");
      await page.mouse.up();
      await capture("review");
      // Sending: the harness holds the broadcast for its latency setting.
      await card.locator("button.send").click();
      await page.waitForTimeout(80);
      states.sending = await geometry(page, "hass-broadcast-card");
      // Upload and send each take the harness latency; let both finish.
      await page.waitForTimeout(1000);
      await capture("sent");

      for (const name of Object.keys(states)) {
        const problems = diff(states.idle, states[name]);
        if (problems.length) {
          failures += 1;
          console.error(`✗ ${layout} @ ${width}: idle → ${name}\n    ${problems.join("\n    ")}`);
        }
      }
      console.log(`${layout} @ ${width}: ${Object.keys(states).join(", ")} checked`);
      await page.close();
    }
  }

  // The tile: idle → recording → sending → result, in both shapes.
  for (const shape of ["Square", "Horizontal"]) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    await page.goto(URL);
    const app = page.locator("dev-app");
    await app.locator("label", { hasText: "Simulated recording" }).locator("input").check();
    await app.locator("#tile-config button", { hasText: shape }).click();
    await page.waitForTimeout(300);
    const tile = page.locator("hass-broadcast-tile");
    await tile.scrollIntoViewIfNeeded();
    const states = {};
    const capture = async (name, settle = 400) => {
      await page.waitForTimeout(settle);
      states[name] = await geometry(page, "hass-broadcast-tile");
      await tile.screenshot({ path: join(shots, `tile-${shape}-${name}.png`) });
    };
    await capture("idle");
    const mic = await tile.locator("button.mic").boundingBox();
    await page.mouse.move(mic.x + mic.width / 2, mic.y + mic.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(1200);
    await capture("recording");
    await page.mouse.up();
    await capture("sending", 80);
    await capture("result", 1000);
    for (const name of Object.keys(states)) {
      const problems = diff(states.idle, states[name]);
      if (problems.length) {
        failures += 1;
        console.error(`✗ tile ${shape}: idle → ${name}\n    ${problems.join("\n    ")}`);
      }
    }
    console.log(`tile ${shape}: ${Object.keys(states).join(", ")} checked`);
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}

console.log(`screenshots: ${shots}`);
if (failures) {
  console.error(`${failures} layout shift(s) found`);
  process.exit(1);
}
console.log("no layout shift");

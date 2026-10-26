// Vite's client types declare the CSS imports below.
/// <reference types="vite/client" />

// The page around the cards, as Home Assistant sets it up: Roboto on the
// root, the theme's background behind. Without a font of its own the
// container's Chromium falls back to a serif, and every screenshot would show
// a card no user ever sees.
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { beforeAll } from "vitest";

const style = document.createElement("style");
style.textContent = `
  html {
    font-family: Roboto, Noto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  body {
    margin: 0;
    padding: 16px;
    background: var(--primary-background-color);
  }
`;
document.head.append(style);

beforeAll(async () => {
  // Faces load when first used; load them up front so the first screenshot
  // is not taken in the fallback font.
  await Promise.all(
    ["400", "500", "700"].map((weight) => document.fonts.load(`${weight} 16px Roboto`)),
  );
});

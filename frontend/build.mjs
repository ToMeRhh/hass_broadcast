import { build } from "esbuild";

await build({
  entryPoints: ["frontend/src/card.ts"],
  bundle: true,
  format: "esm",
  target: "es2021",
  minify: true,
  outfile: "custom_components/hass_broadcast/www/hass-broadcast-card.js",
});
console.log("built hass-broadcast-card.js");

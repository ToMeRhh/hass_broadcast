# Card dev harness

```bash
npm run dev     # → http://localhost:8099
```

Renders the real `hass-broadcast-card` and the real `hass-broadcast-card-editor`
against a mocked `hass`, so the UI can be iterated on without deploying to Home
Assistant. Saving anything under `frontend/src/` rebuilds and reloads the page.

Nothing here ships. It is a separate esbuild entry point; the committed bundle in
`custom_components/hass_broadcast/www/` is untouched by `npm run dev`.

## What is real and what is faked

**Real:** the card, the editor, the recorder, the level meter, the WAV encoder,
and microphone capture — `http://localhost` counts as a secure context, so
`getUserMedia` and the AudioWorklet work. `serve.mjs` serves
`/api/hass_broadcast/static/*` out of `custom_components/hass_broadcast/www/`,
which is the exact path `Recorder` hardcodes for the worklet.

**Faked** (`mock-hass.ts`): the entity list, `hass_broadcast.send`, the
`hass_broadcast/list` and `/delete` websocket calls, and the `/upload` and
`/media/<id>.wav` HTTP endpoints. Uploads are kept in memory and served back
from `/media`, so a recording made in the harness round-trips through history
and plays back the way it would on a live install. Seeded history entries carry
a generated tone so they are audible too.

**Approximated** (`ha-stubs.ts`): `<ha-card>` and Home Assistant's theme
variables for the default light and dark themes. Close enough to judge layout
and contrast — not a substitute for one look at a real dashboard before release.

Because HA's own elements are not available here, the card should stick to plain
HTML plus inline SVG rather than `ha-icon`, `ha-switch` and friends. What renders
in the harness is then what renders in Home Assistant.

## Controls

The right-hand panel forces the states that are painful to reach on a live
install: microphone denied, upload failure, a broadcast that throws, a broadcast
that partially or completely fails, an unauthorized delete, an empty or
twelve-entry history, and artificial latency for looking at pending states.
Theme and card width (phone / tablet / desktop) are there too.

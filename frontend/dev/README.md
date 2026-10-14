# Card dev harness

```bash
npm run dev                                        # → http://localhost:8099
npm run dev -- --host 127.0.0.1 --port 9000        # or HOST=... PORT=... npm run dev
```

Renders the real `hass-broadcast-card` and the real `hass-broadcast-card-editor`
against a mocked `hass`, so the UI can be iterated on without deploying to Home
Assistant. Saving anything under `frontend/src/` rebuilds and reloads the page.

The default binds every interface and prints each URL it can be reached on, so
another device on the network can open it without a flag. Pass `--host` to
narrow that — `--host 127.0.0.1` keeps it to this machine.

Nothing here ships. It is a separate esbuild entry point; the committed bundle in
`custom_components/hass_broadcast/www/` is untouched by `npm run dev`.

## What is real and what is faked

**Real:** the card, the editor, the level meter, the WAV encoder, the upload
round-trip, and — on `localhost` — microphone capture and the AudioWorklet.
`serve.mjs` serves `/api/hass_broadcast/static/*` out of
`custom_components/hass_broadcast/www/`, which is the exact path `Recorder`
hardcodes for the worklet.

**Faked** (`mock-hass.ts`): the entity list, the `hass_broadcast/send`,
`/list`, and `/delete` websocket calls, and the `/upload` and
`/media/<id>.wav` HTTP endpoints. Uploads are kept in memory and served back
from `/media`, so a recording made in the harness round-trips through history
and plays back the way it would on a live install. Seeded history entries carry
generated audio so they are audible too.

**Approximated** (`ha-stubs.ts`): `<ha-card>` and Home Assistant's theme
variables for the default light and dark themes. Close enough to judge layout
and contrast — not a substitute for one look at a real dashboard before release.

Because HA's own elements are not available here, the card should stick to plain
HTML plus inline SVG rather than `ha-icon`, `ha-switch` and friends. What renders
in the harness is then what renders in Home Assistant.

## The simulated recorder

Only `localhost` is a secure context. Anywhere else — a LAN address on a phone —
the browser hides `getUserMedia`, `Recorder.isSupported()` is false, and the card
replaces its whole recording UI with an error. That would put the record button
and the level meter out of reach on the device where they matter most.

So `fake-recorder.ts` patches `Recorder` to report support, drive the level
callback with a speech-shaped signal, and return synthetic audio of the recorded
length on stop. It is forced on outside a secure context, and offered as a
"Simulated recording" toggle everywhere else — handy on localhost too, when you
want to work on the recording UI without granting microphone permission or
talking to your screen.

Only capture is faked. The resulting blob goes through upload, history, playback
and broadcast for real, because to the card it is an ordinary recording. The
patch decides per call, so the toggle takes effect immediately, real capture is
untouched on localhost, and a take started as fake still finishes as fake.

## Controls

The right-hand panel forces the states that are painful to reach on a live
install: microphone denied, upload failure, a broadcast that throws, a broadcast
that partially or completely fails, an unauthorized delete, a recent message that
will not load, an empty or twelve-entry history, and artificial latency for
looking at pending states. Theme and card width (phone / tablet / desktop) are
there too.

**Show slots** outlines every fixed slot in the card. Record, review and send
with it on: no outline should move or change size. `npm run check:layout`
checks the same thing automatically, in headless Chromium.

Layout, sections, and push-to-talk versus tap-to-start live in the real editor
at the bottom of the panel, not in these controls, because they are card
configuration rather than simulated conditions.

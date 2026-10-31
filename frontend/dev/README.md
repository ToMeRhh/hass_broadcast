# Card dev harness

```bash
npm run dev                                        # → http://localhost:8099
npm run dev -- --host 127.0.0.1 --port 9000        # or HOST=... PORT=... npm run dev
```

Renders the real `hass-broadcast-card` and `hass-broadcast-tile` against a
mocked `hass`, so the UI can be iterated on without deploying to Home
Assistant. Saving anything under `frontend/src/` rebuilds and reloads the page.

The editors are not here: they are Home Assistant's own forms, drawn from each
card's `getConfigForm()`, and only Home Assistant's frontend can draw them. See
[The editors](#the-editors-npm-run-deveditor) below.

The default binds every interface and prints each URL it can be reached on, so
another device on the network can open it without a flag. Pass `--host` to
narrow that — `--host 127.0.0.1` keeps it to this machine.

Nothing here ships. It is a separate esbuild entry point; the committed bundle in
`custom_components/hass_broadcast/www/` is untouched by `npm run dev`.

## What is real and what is faked

**Real:** the card and the tile, the level meter, the WAV encoder, the upload
round-trip, and — on `localhost` — microphone capture and the AudioWorklet.
`serve.mjs` serves `/api/hass_broadcast/static/*` out of
`custom_components/hass_broadcast/www/`, which is the exact path `Recorder`
hardcodes for the worklet.

**Faked** (`mock-hass.ts`): the entity list, the `hass_broadcast/send`,
`/list`, `/delete` and `/save` websocket calls, and the `/upload` and
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

**Card config** at the bottom of the panel has a button row per appearance
option (layout, speaker picker, recent messages, volume control, recording
mode, whether sends are kept) and a JSON box holding the whole config,
applied when it loses focus — edit `speakers`, `selected`, `mode` and the rest there. `check:layout` drives
the button rows.

Below the card is a **broadcast tile**, in a box the size of its
sections-view grid cell, with its shape under **Tile config**. Its sends go
through the same mocked backend, so the broadcast-result and latency switches
apply to it too.

## The editors: `npm run dev:editor`

```bash
npm run dev:editor                    # → http://localhost:8100/#misc/hass-broadcast
npm run dev:editor -- --screenshots   # regenerate docs/images/editor-{light,dark}.png
```

Both cards' editors are `getConfigForm()` schemas (`frontend/src/forms.ts`),
which Home Assistant renders with its own form and selectors. To see them, this
runs Home Assistant's design gallery — the site behind design.home-assistant.io
— locally, with one extra page, [`editor/hass-broadcast.ts`](editor/hass-broadcast.ts).
That page wraps each card in `hui-card-element-editor`, the element the Edit
card dialog uses, against the gallery's fake `hass` with six speakers, and puts
the live card under each editor, in light and dark. The cards come from our
real bundle, built unminified by the script; editing `frontend/src/` rebuilds
it, and a page reload picks it up.

[`editor/run.mjs`](editor/run.mjs) does the setup, all of it inside
`.cache/hass-broadcast-editor/` (gitignored):

- fetches home-assistant/frontend at a pinned `dev` commit (`FRONTEND_COMMIT`;
  a release tag's lockfile did not build the gallery);
- downloads the Node release that checkout's `.nvmrc` asks for, used for the
  gallery only and never put on your PATH;
- installs its dependencies with `corepack pnpm` whenever the lockfile changes;
- skips the gallery's nightly-translations download, which would otherwise stop
  to ask for a GitHub login.

The first run takes a few minutes; later ones start once the gallery has
compiled. It is not in CI: the download is far too large to repeat on every push. The cache
cannot live under `node_modules`: Node refuses to strip types from `.ts` files
there, and the gallery's build scripts are TypeScript.

Picture options choose their `src_dark` image from one page-wide UI context,
so in the interactive page the dark column shows the light pictures; the
screenshot step switches that context before its dark shot.

## Sound lab — `/lab`

`http://localhost:8099/lab` records one take through several capture presets
at once and plays each back twice: as the WAV the card uploads, and as the MP3
the speaker is handed. Use it to judge recording quality by ear instead of
deploying to Home Assistant and broadcasting.

- **Presets** are the `PRESETS` list at the top of `lab.ts`: sample rate, mic
  constraints, peak boost and MP3 bitrate. Edit or add to it freely. Each one
  runs the real `Recorder` with `CaptureOptions` overrides; "Shipped" passes
  none, so it is exactly what the card does.
- **The MP3 step** is `POST /lab/mp3` in `serve.mjs`, which runs the same
  ffmpeg command as `audio_processing.py`. Keep the two in step. It needs
  `ffmpeg` on `PATH`; without it the MP3 players say so and the WAVs still work.
- **Shared takes and browser processing.** Chrome can give every stream open
  on a microphone the same echo cancellation / noise suppression / gain
  control, so a preset asking for different processing than its neighbours may
  not get it. Each preset shows what the browser actually granted and is
  flagged when that differs from what it asked; "Record alone" re-records just
  that preset.
- **On a phone**, the lab needs a secure context like real capture does. Over
  USB: `adb reverse tcp:8099 tcp:8099`, then open `http://localhost:8099/lab`
  in Chrome on the phone.

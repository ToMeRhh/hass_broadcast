# hass_broadcast — Design

**Date:** 2026-08-21
**Status:** Approved, pending implementation plan

## Purpose

Record a voice message directly in the Home Assistant UI and broadcast it to one or
more speakers chosen in the card. First-class target is Google Cast; the design keeps
other player types addable later without restructuring.

## Constraints (established, not assumed)

These were verified against Home Assistant `dev` source and Cast documentation. Each one
shaped a decision below.

1. **Cast does not implement `MEDIA_ANNOUNCE`.** `homeassistant/components/cast/media_player.py`
   has no `announce` handling and does not advertise the feature. Ducking and resume must be
   emulated or forgone.
2. **HA's built-in upload endpoint is admin-only.** `UploadMediaView` at
   `/api/media_source/local_source/upload` is decorated `@require_admin`. A frontend-only card
   would fail for every non-admin household member.
3. **Audio-only Opus is unreliable on Cast.** Cast lists Opus as supported but in practice only
   inside a WebM video container. Chrome's `MediaRecorder` default output is exactly the
   unreliable case.
4. **`/local/` is unauthenticated.** It appears in `PATHS_WITHOUT_AUTH` in
   `homeassistant/components/media_player/browse_media.py`, so files under `config/www/` are
   served unsigned to anyone who can reach HA.
5. **Root-relative paths get signed automatically.** `async_process_play_media_url` signs any
   absolute-path URL with no query params via `async_sign_path`, and the auth middleware
   validates signed paths. This is what lets Cast fetch an authenticated URL.
6. **Browser mic requires a secure context.** `getUserMedia` is unavailable over plain HTTP to a
   LAN IP.

## Architecture

A HACS-installable custom integration that owns storage, serving, retention, and playback,
and ships the Lovelace card as a static asset it serves itself.

```
Browser card                Integration                     Cast device
-----------                 -----------                     -----------
AudioWorklet -> Int16 PCM
  -> WAV blob
  -> POST /api/hass_broadcast/upload
                            write <config>/hass_broadcast/<id>.wav
                            optional ffmpeg -> .mp3
                            prune to retention limit
                            record metadata in Store
  <- {message_id}
  -> WS hass_broadcast/send (or service call)
                            media_player.play_media
                              media-source://hass_broadcast/<id>
                            -> MediaSource.async_resolve_media
                            -> /api/hass_broadcast/media/<id>.<ext>
                            -> async_process_play_media_url signs it
                                                            GET signed URL
                            <- authenticated file response  -> plays
```

## Components

Each unit below is independently testable and depends only on the interfaces named.

### `audio` (card, TypeScript)
Captures microphone input and produces a WAV blob.

- Uses `AudioWorklet` + `getUserMedia({ audio: true })` to obtain Int16 PCM, mirroring HA's own
  Assist recorder (`src/util/audio-recorder.ts` in home-assistant/frontend). This avoids
  `MediaRecorder`'s cross-browser codec divergence (Chrome produces Opus, Safari produces AAC)
  and lands on WAV/LPCM, which Cast plays natively.
- Downsamples to 16 kHz mono and wraps in a WAV header. ~32 KB/s; a 15-second message is
  under 500 KB.
- **Interface:** `start()`, `stop(): Promise<Blob>`, `onLevel(cb)` for the waveform.
- **Depends on:** nothing outside the browser.

### `card` (TypeScript, Lit)
Lovelace card with a `record -> stop -> preview -> choose targets -> send` state machine.

- Preview plays the local blob before anything is uploaded.
- Target picker multi-selects entities whose `supported_features` include `PLAY_MEDIA`.
- History list: replay or delete past messages.
- Ships a visual config editor so it is configurable from the Lovelace UI.
- **Config:** `targets` (default selection), `mode` (`plain` | `restore` | `chime`),
  `max_duration` seconds, `show_history` bool.
- **Depends on:** `audio`, the integration's HTTP and WS APIs.

### `http` (integration, Python)
Two `HomeAssistantView`s.

- `POST /api/hass_broadcast/upload` — authenticated, **not** admin-gated. Accepts multipart
  WAV, validates content type and size ceiling, delegates to `storage`. Returns `{message_id}`.
- `GET /api/hass_broadcast/media/<id>.<ext>` — `requires_auth = True`. Serves the file. Signed-path
  requests from Cast authenticate through the standard middleware.

### `storage` (integration, Python)
Owns the filesystem and metadata; the single place retention is enforced.

- Files in `<config>/hass_broadcast/`, **not** the `local` media dir, so behaviour does not
  depend on the user's `media_dirs` configuration.
- Metadata in HA's `Store` (`.storage/hass_broadcast`): id, created timestamp, duration,
  recording user id, extension.
- Prunes to the retention limit on every upload, so the card can never drift from disk.
- **Interface:** `async_add(blob) -> id`, `async_list()`, `async_delete(id)`, `async_path(id)`.

### `audio_processing` (integration, Python)
Optional transcode of WAV to MP3 when `ffmpeg` is on PATH (it is in every official HA image).
Failure or absence is non-fatal — the WAV is kept and both formats are Cast-safe. ffmpeg is an
optimization, never a dependency.

### `media_source` (integration, Python)
Registers a `MediaSource` so recordings resolve as `media-source://hass_broadcast/<id>`.
`async_resolve_media` returns a `PlayMedia` whose URL is the root-relative
`/api/hass_broadcast/media/<id>.<ext>`, where `<ext>` is the stored extension recorded in
 metadata (`wav`, or `mp3` when transcoding succeeded). The `PlayMedia` mime type matches.
 HA then signs the URL.

### `playback` (integration, Python)
Service `hass_broadcast.send(message_id, targets, mode)`, fanning out `media_player.play_media`.

- `plain` (default) — play it, no state management.
- `restore` — snapshot volume and state per target, play, poll for completion, restore.
  Reliably restores volume; resuming an active cast session is best-effort.
- `chime` — bundled chime file first, then the message.

Exposing this as a service (not just a card action) is the seam for supporting non-Cast
player types later and makes broadcasts usable from automations.

## Data flow decisions and rationale

| Decision | Rationale |
|---|---|
| WAV/LPCM over the wire | Cast-safe, no ffmpeg dependency, no browser codec divergence (constraint 3) |
| Own integration, not frontend-only | Non-admin users can record (constraint 2); server-side retention |
| `<config>/hass_broadcast/` + signed view | Independent of `media_dirs`; avoids the unauthenticated `/local/` path (constraint 4, 5) |
| `plain` as default mode | Cast cannot duck or resume natively (constraint 1); `restore` would over-promise |
| Card served by the integration | `async_register_static_paths` + `frontend.add_extra_js_url`; no manual Lovelace resource |

## Error handling

- **No mic permission / insecure context** — card detects `navigator.mediaDevices` absence or a
  `NotAllowedError` and shows a specific message naming the HTTPS requirement, not a generic failure.
- **Upload rejected** (too large, bad type, disk error) — card keeps the local blob so the
  recording is not lost, and offers retry.
- **`ffmpeg` missing** — logged once at debug level, WAV retained. Not surfaced to the user.
- **Target lacks `PLAY_MEDIA`** — filtered out of the picker; if a stale config references one,
  the service skips it and reports which targets failed rather than aborting the whole broadcast.
- **Partial fan-out failure** — remaining targets still play; the card surfaces per-target results.
- **Signed URL expiry** — `CONTENT_AUTH_EXPIRY_TIME` bounds fetch time; a target that fetches
  late fails rather than serving unauthenticated content. Documented, not worked around.

## README — required content

The README is a deliverable of this project, not documentation-after-the-fact. It must cover,
in this order: installation, then usage, then a prominent **Requirements and restrictions**
section containing every item below.

**Hard requirements**
1. **HTTPS is required to record.** Browsers only expose `getUserMedia` in a secure context.
   Plain `http://192.168.x.x:8123` will refuse to record, usually silently. Valid-certificate
   HTTPS, Nabu Casa, Tailscale, or Cloudflare all work; so does `localhost`. The HA Companion
   app works, and may require granting microphone permission in the app's own settings.
2. **`internal_url` must be set to a LAN-reachable address for Cast.** `async_process_play_media_url`
   resolves through `get_url()`, which prefers the internal URL. With it set, the Cast device
   fetches over the LAN and never leaves the network.
3. **Cloudflare Access / Zero Trust in front of HA breaks Cast playback** if the Cast device has
   to fetch through it — the device cannot satisfy an Access challenge. Setting `internal_url`
   (item 2) avoids this. Call this pairing out explicitly.
4. Target entities must support the `PLAY_MEDIA` feature.
5. Modern browser required for `AudioWorklet`.

**Behavioural restrictions**
6. **No ducking or resume on Cast.** `announce` is not supported by the Cast integration.
   `restore` mode is an emulation: it restores volume reliably, but will not dependably resume
   an active Spotify or YouTube session. `plain` is the default for this reason.
7. **Audio format.** WAV/LPCM by default; MP3 when ffmpeg is present. Explain why Opus is not
   used, so the choice does not look arbitrary.
8. **Only Google Cast is tested.** Other player types may work; they are not verified.

**Storage and privacy**
9. Recordings are stored **unencrypted** in `<config>/hass_broadcast/` and are therefore
   included in Home Assistant backups.
10. Retention defaults to the last 10 messages and is configurable in the integration options.
11. Any user who can see the card can record and broadcast; uploads are authenticated but not
    admin-restricted. This is deliberate (constraint 2) and its implication should be stated.

## Repository layout

```
custom_components/hass_broadcast/
  __init__.py  config_flow.py  const.py  http.py  media_source.py
  storage.py   audio_processing.py  playback.py
  manifest.json  services.yaml  strings.json  translations/en.json
  www/hass-broadcast-card.js        # built card, served by the integration
frontend/                           # card source (TypeScript + Lit), esbuild
docs/superpowers/specs/
hacs.json  README.md
```

Installing the integration is the entire install — no separate frontend repository and no
manual Lovelace resource entry.

## Testing

- **Python** — `pytest-homeassistant-custom-component`: upload auth (authenticated non-admin
  succeeds, unauthenticated fails), size and content-type rejection, retention pruning,
  media source resolution returning a signable root-relative URL, service fan-out including
  partial failure.
- **TypeScript** — Vitest: WAV encoder output (header correctness, sample rate, duration) and
  the card state machine, including the insecure-context and permission-denied branches.
- Test-driven throughout, per the project's development workflow.

## Out of scope

Text-to-speech input, two-way intercom, scheduled or triggered broadcasts, and per-user
permission controls beyond HA's own authentication.

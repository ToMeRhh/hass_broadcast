# Voice Broadcast for Home Assistant

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/docs/faq/custom_repositories/)
[![Home Assistant 2024.11+](https://img.shields.io/badge/Home%20Assistant-2024.11%2B-41BDF5.svg)](https://www.home-assistant.io/)
[![CI](https://github.com/ToMeRhh/hass_broadcast/actions/workflows/ci.yml/badge.svg)](https://github.com/ToMeRhh/hass_broadcast/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Record a voice message in your Home Assistant dashboard and play it on your
speakers — a simple intercom, without leaving the UI.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/images/card-dark.png">
    <img src="https://github.com/ToMeRhh/hass_broadcast/blob/master/docs/images/card-light.png?raw=true" alt="The Voice Broadcast card: a recorded message's waveform above a large record button, with Discard and Send beside it and a speaker picker below" width="360">
  </picture>
</p>

- **Hold to talk** (or tap to start, tap to stop), then play it back before sending
- **Broadcast to several speakers at once** — playback starts on all of them together
- **Three playback modes**: plain, restore the volume afterwards, or a chime first
- **Optional broadcast volume**, with each speaker's own volume put back afterwards
- **Recent messages** to replay or re-send, with automatic retention
- **A one-tap intercom tile** that sends straight to the speakers you chose
- **No services, no entities** — installing it adds dashboard cards and nothing else

<a id="https-required"></a>

> [!IMPORTANT]
> **Recording needs HTTPS.** Browsers only allow microphone access on secure pages,
> so on `http://<ip>:8123` the record button stays disabled. This is a browser rule,
> not a limitation of this card. Workaround in Chrome: open
> `chrome://flags/#unsafely-treat-insecure-origin-as-secure`, add your Home Assistant
> URL, enable it and relaunch. Other options are under [Requirements](#hard-requirements).

## Installation

### HACS (recommended)

[![Open your Home Assistant instance and open this repository inside HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=ToMeRhh&repository=hass_broadcast&category=integration)

The button above opens this repository in your own Home Assistant's HACS, adding
it as a custom repository if needed — then skip to step 3. Or, by hand:

1. In HACS, choose **Integrations → ⋮ → Custom repositories**.
2. Add `https://github.com/ToMeRhh/hass_broadcast` as an **Integration**.
3. Install **Voice Broadcast**, then restart Home Assistant.
4. Go to **Settings → Devices & services → Add integration** and add **Voice Broadcast**
   ([open it directly](https://my.home-assistant.io/redirect/config_flow_start/?domain=hass_broadcast)).

### Manual

Copy `custom_components/hass_broadcast/` into your Home Assistant `config/custom_components/`
directory and restart, then add the integration as above.

You do **not** need to add a Lovelace resource by hand — the integration serves the
card bundle and registers the resource for you, pointing at
`/api/hass_broadcast/static/hass-broadcast-card.js?v=<version>`. The version query
string means an upgrade re-fetches the bundle instead of serving a cached copy.
The resource is deleted again when the integration is removed.

If your Lovelace runs in **YAML mode**, resources are yours to manage and the
integration will not write to them. It falls back to loading the card as a frontend
module, which works in desktop browsers but is not reliably picked up by the Home
Assistant companion apps. If the card renders as `Custom element doesn't exist:
hass-broadcast-card.` on mobile, add the resource yourself:

```yaml
lovelace:
  mode: yaml
  resources:
    - url: /api/hass_broadcast/static/hass-broadcast-card.js
      type: module
```

## Usage

Add the **Voice Broadcast** card to any dashboard. Then:

1. Hold the round record button and speak, then let go to stop. (The button
   defaults to this hold-to-talk behaviour; switch it to tap-to-start,
   tap-to-stop instead in the card editor's **Recording** section.) While you
   speak, the button pulses with your voice and a ring on its rim counts down
   to the length limit.
2. Optionally press play to hear the recording before sending it, or
   **Discard** it.
3. Pick one or more speakers.
4. Optionally open the volume control and choose the level to broadcast at.
   Each speaker is set to that level for the message and put back to its own
   volume afterwards. Left off, the speakers' volume is not touched.
5. Press **Send**.

Nothing on the card moves while you do this: recording, reviewing and sending
change what the card shows, never where its buttons are.

### Setting it up

The card's editor is Home Assistant's own form, in four sections:

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/images/editor-dark.png">
    <img src="https://github.com/ToMeRhh/hass_broadcast/blob/master/docs/images/editor-light.png?raw=true" alt="The card editor: a Name field, then Appearance with picture choices for the layout and the speaker picker, a Recent messages menu and a Volume control switch, then Speakers with the speakers on the card and the ones selected when it opens" width="420">
  </picture>
</p>

- **Appearance** — the layout, how speakers are picked, where recent messages
  go, and whether there is a volume control.
- **Speakers** — the speakers the card offers, and which of them are ticked
  when it opens. A new card starts with every speaker that can play audio;
  remove the ones you do not want.
- **Recording** — hold to talk, or tap to start and stop; the time limit; and
  noise suppression, for a noisy room.
- **Playback** — what happens on the speakers: just play the message, play a
  chime first, or pause what was playing and resume it afterwards.

The card comes in two layouts:

- **Full** — a large record button with Discard and Send beside it, a strip
  above it for the timer and the recorded waveform, and the speaker picker
  below: a dropdown, chips, or a list.
- **Compact** — two rows: the record button on the left, and beside it the
  status line, a speaker dropdown and Send. Recent messages and volume move
  into a ⋮ menu.

<p align="center">
  <img src="https://github.com/ToMeRhh/hass_broadcast/blob/master/docs/images/card-compact-light.png?raw=true" alt="The compact layout: the record button beside a recorded waveform, a speaker picker and Send" width="360">
</p>

Recent messages can be a button in the header that opens them in a dialog, a
list of the last three below the card, or off. The volume control is a header
button.

For a one-tap intercom button that sends straight to fixed speakers, see the
[broadcast tile](#broadcast-tile).

### Broadcast tile

The **Voice Broadcast Tile** is a second card for the call you make every
day: hold it, speak, and let go — the message goes straight to the speakers
you chose, with no review step and no picker. It shows ✓ when every speaker
played it, and names any that did not.

```yaml
type: custom:hass-broadcast-tile
name: Kids' rooms
speakers:
  - media_player.kids_room
  - media_player.bedroom
shape: square        # square (3×2 in a sections view) or horizontal (6×1)
mode: plain
max_duration: 30
```

| Option | Default | Meaning |
| --- | --- | --- |
| `name` | `Intercom` | The tile's label |
| `speakers` | first speaker found | Every message goes to all of these. A tile with none is disabled |
| `shape` | `square` | `square` or `horizontal` |
| `mode` | `plain` | As for the card |
| `max_duration` | `60` | As for the card |
| `noise_suppression` | `false` | As for the card |

The tile is always hold-to-talk: release is what sends, so a tap-to-start
tile would send the moment you tapped to stop. Its recordings appear in the
card's recent messages like any other.

Broadcasting happens from the card. This integration deliberately registers no
Home Assistant service and creates no entities — installing it adds the card,
plus a "Voice Broadcast" folder in the Media panel where past recordings are
browsable.

The three most recent recordings appear at the bottom of the card, and
**Show all** opens the full list. Tapping one loads it into the card —
exactly as if you had just recorded it, ready to play back or send — rather
than broadcasting it immediately. A recording can be deleted by its owner or
by an administrator — see [Deletion permissions](#deletion-permissions) below;
the delete button only appears when the server says you are allowed to use it.

When you broadcast to multiple speakers, playback is dispatched to all of them
concurrently — they all start together rather than one after another.

### Card options

Everything below is set from the card editor, one field per option. In YAML:

```yaml
type: custom:hass-broadcast-card
title: Intercom
layout: full
speaker_picker: chips
recent_messages: button
volume_control: true
speakers:
  - media_player.kitchen
  - media_player.living_room
selected:
  - media_player.kitchen
record_mode: start_stop
max_duration: 60
mode: restore
```

| Option | Default | Meaning |
| --- | --- | --- |
| `title` | `Voice Broadcast` | Card heading. Blank restores the default |
| `layout` | `full` | `full` or `compact` — see [Setting it up](#setting-it-up) |
| `speaker_picker` | `dropdown` | `dropdown`, `chips` or `list`. Compact always uses the dropdown |
| `recent_messages` | `button` | `button` (a header button that opens them in a dialog), `list` (the last three below the card) or `off`. In Compact, anything but `off` puts them in the ⋮ menu |
| `volume_control` | `true` | Whether the card offers the broadcast volume control |
| `speakers` | every speaker | The speakers the card offers, in the order listed. Left out, the card offers every media player that supports playback; an empty list offers none. A speaker named here appears even while it is unavailable |
| `selected` | `[]` | Speakers ticked when the card opens. One that is not in `speakers` is ignored, and never broadcast to |
| `record_mode` | `push_to_talk` | `push_to_talk` (hold to record, release to stop) or `start_stop` (tap to start, tap again to stop) |
| `max_duration` | `60` | Recording stops automatically after this many seconds. Clamped to **5–300**; invalid values fall back to 60 |
| `noise_suppression` | `false` | The browser's noise suppression on the microphone: filters out a TV, fan or kitchen in the background. Leave it off in a quiet room — it can make a voice sound slightly processed |
| `mode` | `plain` | `plain`, `chime` or `restore` — see [Behavioural restrictions](#behavioural-restrictions) below |

## Requirements and restrictions

Most problems people run into are covered below, so please read this section before
filing a bug.

### Hard requirements

- **HTTPS is required to record.** Browsers only expose the microphone on secure pages.
  HTTPS, Home Assistant Cloud, Tailscale, Cloudflare Tunnel and `localhost` all work, and
  so does the Companion app (grant it microphone permission the first time). For a quick
  stopgap in Chrome over plain HTTP, add your URL at
  `chrome://flags/#unsafely-treat-insecure-origin-as-secure` and relaunch. The flag only
  applies to that one browser.
- **Set `internal_url` to a LAN address if you use Google Cast.** Cast speakers fetch the
  audio from Home Assistant themselves, using the internal URL when one is set:

  ```yaml
  homeassistant:
    internal_url: "http://192.168.1.50:8123"
  ```

  This also keeps Cloudflare Access out of the path. A speaker can't log in to Access, so
  if it has to fetch through it, nothing plays. If you can't avoid that, add a bypass rule
  for `/api/hass_broadcast/media/*`.
- **Speakers must support `PLAY_MEDIA`.** Players that don't support it aren't listed.
  Only Google Cast is tested. Sonos, ESPHome and similar players should work, but Alexa
  won't.

### Behavioural restrictions

- **Cast doesn't resume music.** Speakers that support announcements (Sonos, Music
  Assistant, ESPHome) duck the audio and then resume it themselves. On Cast, a broadcast
  interrupts whatever is playing. `restore` mode puts the volume back, but it can't
  restart Spotify or the radio.
- **`chime` timing is an estimate.** On a slow Cast device, the start of the message may
  cut off the end of the chime.

### Storage and privacy

- **Recordings aren't encrypted, and they're included in backups.** By default the last
  10 are kept; you can set this anywhere from 1 to 200 under **Configure** on the
  integration. Removing the integration deletes all recordings.
- <a id="deletion-permissions"></a>**Any logged-in user who can see the card can record,
  broadcast and play back every recording.** Only the person who made a recording, or an
  admin, can delete it. Playback URLs are signed and expire after a short time.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Record button is disabled | Not a secure context — see [Hard requirements](#hard-requirements) |
| "Microphone permission was denied" | Allow the microphone for this site, or for the Companion app |
| Nothing plays, no error | Cast could not fetch the URL — check `internal_url` and Cloudflare Access ([Hard requirements](#hard-requirements)) |
| Speaker missing from the list | It does not support `PLAY_MEDIA` |
| Music does not resume after a broadcast | Expected on Cast — see [Behavioural restrictions](#behavioural-restrictions) |
| Chime sounds cut off before the message starts | Cast started playback slowly — see [Behavioural restrictions](#behavioural-restrictions) |
| Delete button is missing on a recording | You are not the owner and not an administrator — see [Storage and privacy](#storage-and-privacy) |

## Development

Python 3.12 or newer and Node 22.

```bash
python -m venv .venv
.venv/bin/pip install -r requirements_test.txt
.venv/bin/python -m pytest -q   # integration tests; `python -m pytest`, not bare `pytest`,
                                # so the repo root is on sys.path

npm ci
npm test                        # card tests (vitest)
npm run build                   # bundle the card into custom_components/hass_broadcast/www/
npm run dev                     # card dev harness on http://localhost:8099
npm run dev:editor              # the editors, drawn by Home Assistant's own frontend, on :8100
npm run check:layout            # headless check that nothing moves between card states;
                                # first run: npx playwright-core install chromium
```

`npm run dev` renders the real card and tile against a mocked Home Assistant,
with live reload and switches for hard-to-reach states (microphone denied, a
partly failed broadcast, empty history, latency). The editors are Home
Assistant's own forms, so `npm run dev:editor` runs Home Assistant's design
gallery locally to show them; `npm run dev:editor -- --screenshots` regenerates
the editor images in this README. See
[`frontend/dev/README.md`](frontend/dev/README.md).

`custom_components/hass_broadcast/www/hass-broadcast-card.js` is a **build output that is
committed to the repository**, because HACS installs the repository as-is and the integration
serves that file directly — an uncommitted bundle means every dashboard gets a 404 instead of a
card. Whenever anything under `frontend/src/` changes, run `npm run build` and commit the
regenerated bundle in the same change. CI fails if the committed bundle is stale. CI also runs
`npm run check:layout`, which fails if any part of the card moves between states.

Commit subjects follow [Conventional Commits](https://www.conventionalcommits.org/)
(`fix:`, `feat:`, `docs:`, `refactor:`, `chore:`).

Releases are cut with **Actions → Release → Run workflow**, which bumps the version in
`manifest.json`, tags, and publishes a GitHub release with `hass_broadcast.zip` attached —
the asset HACS installs, since `hacs.json` sets `zip_release`. The version is also the card's
cache-busting query string, so a change reaches users only once it is released.

## License

[MIT](LICENSE)

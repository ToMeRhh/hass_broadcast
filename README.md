# Voice Broadcast for Home Assistant

Record a voice message in your Home Assistant dashboard and play it on your
speakers — a simple intercom, without leaving the UI.

## Installation

### HACS (recommended)

1. In HACS, choose **Integrations → ⋮ → Custom repositories**.
2. Add `https://github.com/tomerh/hass_broadcast` as an **Integration**.
3. Install **Voice Broadcast**, then restart Home Assistant.
4. Go to **Settings → Devices & services → Add integration** and add **Voice Broadcast**.

### Manual

Copy `custom_components/hass_broadcast/` into your Home Assistant `config/custom_components/`
directory and restart, then add the integration as above.

You do **not** need to add a Lovelace resource — the integration serves and registers
the card itself.

## Usage

Add the **Voice Broadcast** card to any dashboard. Then:

1. Press the round record button and speak.
2. Press it again to stop. The recording plays back locally so you can check it.
3. Select one or more speakers.
4. Press **Send**.

Recent recordings appear below the card and can be replayed. A recording can be
deleted by its owner or by an administrator — see [Deletion permissions](#deletion-permissions)
below; the delete button only appears when the server says you are allowed to use it.

When you broadcast to multiple speakers, playback is dispatched to all of them
concurrently — they all start together rather than one after another.

### Card options

| Option | Default | Meaning |
| --- | --- | --- |
| `targets` | `[]` | Speakers selected when the card loads |
| `mode` | `plain` | `plain`, `restore`, or `chime` — see [Behavioural restrictions](#behavioural-restrictions) below |
| `max_duration` | `60` | Recording stops automatically after this many seconds. Clamped to the range **5–300**; values outside that range are pulled back to the nearest bound, and invalid values fall back to 60. |
| `show_history` | `true` | Show the list of recent recordings |

### Using it from an automation

```yaml
action:
  - service: hass_broadcast.send
    data:
      message_id: "{{ message_id }}"
      targets:
        - media_player.kitchen
        - media_player.office
      mode: plain
```

## Requirements and restrictions

**Please read this section before filing a bug.** Most problems people hit are one of
the items below.

### Hard requirements

1. **HTTPS is required to record.** Browsers only expose the microphone in a *secure
   context*. If you open Home Assistant at `http://192.168.1.50:8123`, recording will
   not work — usually with no visible error at all. Any of these are fine: HTTPS with a
   valid certificate, Home Assistant Cloud (Nabu Casa), Tailscale, Cloudflare Tunnel, or
   `http://localhost:8123`. The card detects an insecure context and tells you so instead
   of failing silently.

   The **Home Assistant Companion app** works, since it connects over HTTPS. You may need
   to grant microphone permission to the app itself in your phone's settings the first time.

2. **Set `internal_url` to a LAN address if you use Google Cast.** When you broadcast, the
   Cast device fetches the audio file from Home Assistant *itself* — Home Assistant does
   not push audio to it. Home Assistant picks the URL via `get_url()`, which prefers the
   internal URL. With `internal_url` set to your LAN address, the speaker fetches over your
   local network and never goes out to the internet:

   ```yaml
   homeassistant:
     internal_url: "http://192.168.1.50:8123"
     external_url: "https://hass.example.com"
   ```

3. **Cloudflare Access / Zero Trust in front of Home Assistant breaks Cast playback** if the
   Cast device has to fetch through it. A speaker cannot log in to an Access challenge, so
   the fetch fails and nothing plays. Setting `internal_url` as in item 2 avoids this
   entirely, because the speaker never goes through Cloudflare. If you must expose media
   through Cloudflare, add a bypass rule for `/api/hass_broadcast/media/*`.

4. **Target speakers must support `PLAY_MEDIA`.** The card only lists media players that
   advertise this feature. A player that cannot accept a URL will not appear.

5. **A modern browser is required** for `AudioWorklet` — any current Chrome, Edge, Firefox,
   or Safari. Very old browsers will show the unsupported message.

### Behavioural restrictions

6. **There is no ducking or resume on Google Cast.** Home Assistant's Cast integration does
   not implement the `announce` feature, so a broadcast simply interrupts whatever was
   playing. The card's `restore` mode is an *emulation*: it snapshots and restores the
   volume reliably, but it **cannot dependably resume an active Spotify, YouTube Music, or
   radio session** — that is a Cast limitation, not something this integration can fix.
   `plain` is the default for exactly this reason. Treat `restore` as best-effort.

7. **In `chime` mode, the gap before the message is a timing heuristic, not a guarantee
   that the chime finished playing.** The card plays a short chime, waits a fixed interval
   derived from the chime's own length plus a latency margin, then plays the message —
   `play_media` with `blocking=True` only confirms Home Assistant's call was accepted, not
   that the speaker has audibly finished the chime. On a Cast device that is slow to start
   playback, the message can clip the tail end of the chime. If that matters to you, prefer
   `plain` or `restore`.

8. **Audio is WAV, or MP3 when ffmpeg is available.** Recordings are captured as 16 kHz mono
   16-bit PCM and wrapped in a WAV container in the browser. If `ffmpeg` is on the system
   path — it is in every official Home Assistant image — the file is transcoded to MP3 to
   save space. If it is not, the WAV is kept and everything still works. ffmpeg is an
   optimization, never a requirement.

   **Why not Opus?** The browser's built-in `MediaRecorder` produces Opus in a WebM
   container in Chrome and AAC in Safari. Google Cast documents Opus as supported, but in
   practice plays it reliably only inside a WebM *video* container — audio-only Opus often
   fails. Capturing raw PCM avoids both the codec divergence between browsers and the Cast
   compatibility problem.

9. **Only Google Cast is tested.** Sonos, ESPHome media players, Squeezelite, and the
   Voice Preview Edition all use the same `play_media` path and are expected to work, but
   they are not verified. Alexa devices will **not** work: they cannot play arbitrary URLs.

10. **Recording duration is measured server-side, not taken from the browser's claim.**
    When a recording is uploaded, Home Assistant parses the true duration from the WAV
    header itself; the duration the browser reports is only used as a fallback if that
    parsing fails. This matters for `restore` mode, where an understated duration would
    restore the speaker's volume while the message is still audibly playing, and it is
    why the history timestamps and durations can be trusted even if a client misreports.

### Storage and privacy

11. **Recordings are stored unencrypted** in `<config>/hass_broadcast/`, and are therefore
    **included in your Home Assistant backups**. If you back up off-site, your voice
    messages go with it.

12. **Retention defaults to the last 10 recordings.** Older ones are deleted automatically
    when a new one arrives. Change this in **Settings → Devices & services → Voice
    Broadcast → Configure**.

13. <a id="deletion-permissions"></a>**Deletion is ownership-based: you may delete your own
    recordings, and an administrator may delete anyone's.** This is enforced on the server —
    the websocket delete command checks that the requesting user either owns the recording or
    is an administrator, and rejects the request with `not_authorized` otherwise. The card
    only shows a Delete button where the server has told it deletion is permitted; it never
    decides this on its own.

14. **Any Home Assistant user who can see the card can record and broadcast.** Uploads
    require a valid login but are deliberately *not* restricted to administrators — Home
    Assistant's own media upload endpoint is admin-only, which would stop non-admin
    household members from using the card at all. This applies to recording and sending a
    broadcast only; deleting an existing recording is restricted as described above. If you
    do not want a particular user broadcasting, do not put the card on a dashboard they can
    see.

    Playback URLs are individually signed and short-lived, so recordings are never served
    unauthenticated. They are deliberately not placed in `config/www/`, which Home
    Assistant serves with no authentication whatsoever.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Record button is disabled | Not a secure context — see restriction 1 |
| "Microphone permission was denied" | Allow the microphone for this site, or for the Companion app |
| Nothing plays, no error | Cast could not fetch the URL — check `internal_url` (2) and Cloudflare Access (3) |
| Speaker missing from the list | It does not advertise `PLAY_MEDIA` (4) |
| Music does not resume after a broadcast | Expected on Cast — see restriction 6 |
| Chime sounds cut off before the message starts | Cast started playback slowly — see restriction 7 |
| Delete button is missing on a recording | You are not the owner and not an administrator — see restriction 13 |

## Development

```bash
pip install -r requirements_test.txt
python -m pytest tests/ -v   # integration tests — use `python -m pytest`, not bare `pytest`;
                              # only `-m` puts the repo root on sys.path, which is what makes
                              # `custom_components` importable from the test modules

npm install
npm test                  # card tests
npm run build              # bundle the card into custom_components/hass_broadcast/www/
```

## License

MIT

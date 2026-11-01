<img src="https://github.com/ToMeRhh/hass_broadcast/blob/master/custom_components/hass_broadcast/brand/icon.png?raw=true" alt="" width="96">

# Voice Broadcast for Home Assistant

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/docs/faq/custom_repositories/)
[![Home Assistant 2024.12+](https://img.shields.io/badge/Home%20Assistant-2024.12%2B-41BDF5.svg)](https://www.home-assistant.io/)
[![CI](https://github.com/ToMeRhh/hass_broadcast/actions/workflows/ci.yml/badge.svg)](https://github.com/ToMeRhh/hass_broadcast/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Talk into your dashboard, hear it on your speakers. A simple intercom for Home
Assistant, in two cards:

<div align="center">

| <img src="https://github.com/ToMeRhh/hass_broadcast/blob/master/docs/images/card-light.png?raw=true" alt="The Voice Broadcast card: a recorded message's waveform above a large record button, with Discard and Send beside it and a speaker picker below" width="440"> | <img src="https://github.com/ToMeRhh/hass_broadcast/blob/master/docs/images/tile-light.png?raw=true" alt="The broadcast tile, idle: a large record button above its name and the speakers it plays on" width="220"> |
| :---: | :---: |
| **The card**: record, check, choose who hears it. | **The tile**: hold, speak, let go. Done. |

</div>

|  | Card | Tile |
| --- | --- | --- |
| **Best for** | Any message, to anyone | The call you make every day ("Dinner's ready!") |
| **Speakers** | Picked each time: dropdown, chips or list | Fixed when you set it up |
| **Before sending** | Play it back, then Send or Discard | Letting go sends it; let go on the bin to discard |
| **Recording** | Hold to talk, or tap to start and stop | Hold to talk |
| **Extras** | Recent messages to replay or re-send; broadcast volume | Shows ✓ Sent, or names the speakers that missed it |
| **Sizes** | Full or compact | Square (grows as you resize it) or horizontal |

Both cards play on several speakers at once, and can ring a chime first or
pause what was playing and resume it afterwards. Installing adds the two cards
and nothing else: no entities, no services.

<a id="https-required"></a>

> [!IMPORTANT]
> **Recording needs HTTPS.** Browsers only allow the microphone on secure pages,
> so on plain `http://<ip>:8123` the record button stays disabled. Home Assistant
> Cloud, Tailscale, a reverse proxy with a certificate and the Companion app all
> work. See [Requirements](#hard-requirements) for a quick workaround.

## Installation

[![Open your Home Assistant instance and open this repository inside HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=ToMeRhh&repository=hass_broadcast&category=integration)

1. Click the button above (or in HACS, add `https://github.com/ToMeRhh/hass_broadcast`
   under **⋮ → Custom repositories** as an **Integration**).
2. Install **Voice Broadcast** and restart Home Assistant.
3. Add the integration under **Settings → Devices & services → Add integration**
   ([open it directly](https://my.home-assistant.io/redirect/config_flow_start/?domain=hass_broadcast)).
4. Edit a dashboard, **Add card**, and pick **Voice Broadcast** or **Voice Broadcast Tile**.

That's it — the card registers itself with your dashboards; there is no
resource to add by hand. (Without HACS, copy `custom_components/hass_broadcast/`
into your `config/custom_components/` and restart.)

To try new versions before their release, open **Voice Broadcast** in HACS,
choose **⋮ → Redownload**, tick **Show beta versions** and pick the newest.
Untick it to go back to releases only.

## The card

1. **Hold** the big red button and speak; let go to stop.
2. **Play** it back if you like, or **Discard** it.
3. **Pick** one or more speakers.
4. **Send.**

Recent messages sit behind the history button: tap one to load it back into the
card, ready to play or re-send. The volume button sets how loud the message
plays; each speaker goes back to its own volume afterwards.

Every message you send is kept in Recent messages. Turn off **Keep sent
messages** and they are deleted once they have played; the card's **Save**
button then keeps the ones you want.

Everything is set from the card editor:

<p align="center">
  <img src="https://github.com/ToMeRhh/hass_broadcast/blob/master/docs/images/editor-light.png?raw=true" alt="The card editor: a Name field, then Appearance with picture choices for the layout and the speaker picker, a Recent messages menu and a Volume control switch, then Speakers with the speakers on the card and the ones selected when it opens" width="420">
</p>

Short on space? The **compact** layout fits the card into two rows, with recent
messages and volume in a ⋮ menu:

<p align="center">
  <img src="https://github.com/ToMeRhh/hass_broadcast/blob/master/docs/images/card-compact-light.png?raw=true" alt="The compact layout: the record button beside a recorded waveform, a speaker picker and Send" width="360">
</p>

<details>
<summary>Card options in YAML</summary>

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
| `layout` | `full` | `full` or `compact` |
| `speaker_picker` | `dropdown` | `dropdown`, `chips` or `list`. Compact always uses the dropdown |
| `recent_messages` | `button` | `button` (a header button that opens them in a dialog), `list` (the last three below the card) or `off`. In Compact, anything but `off` puts them in the ⋮ menu |
| `volume_control` | `true` | Whether the card offers the broadcast volume control |
| `speakers` | every speaker | The speakers the card offers, in the order listed. Left out, the card offers every media player that supports playback; an empty list offers none. A speaker named here appears even while it is unavailable |
| `selected` | `[]` | Speakers ticked when the card opens. One that is not in `speakers` is ignored, and never broadcast to |
| `record_mode` | `push_to_talk` | `push_to_talk` (hold to record, release to stop) or `start_stop` (tap to start, tap again to stop) |
| `max_duration` | `60` | Recording stops automatically after this many seconds. Clamped to **5–300**; invalid values fall back to 60 |
| `noise_suppression` | `false` | The browser's noise suppression: filters out a TV, fan or kitchen in the background. Leave it off in a quiet room — it can make a voice sound slightly processed |
| `keep_messages` | `true` | Adds every message to Recent messages. Off: messages are deleted after they play; the card's Save button keeps one |
| `mode` | `plain` | What the speakers do: `plain` just plays the message, `chime` plays a chime first, `restore` pauses what was playing and puts it back, volume included — see [Behavioural restrictions](#behavioural-restrictions) |

</details>

<a id="broadcast-tile"></a>

## The tile

Hold the tile, speak, let go: the message goes straight to the speakers you
chose, with no review step and no picker. It names those speakers under its
label, shows ✓ when every speaker played it, and names any that did not. Its
recordings show up in the card's recent messages like any other.

Changed your mind mid-message? Slide onto the bin that appears while you
record and let go there, or press Escape: the message is discarded, not sent.

The tile is always hold-to-talk, since letting go is what sends. Make a square
tile bigger and its button grows with it.

<details>
<summary>Tile options in YAML</summary>

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
| `name` | `Voice Broadcast` | The tile's label |
| `speakers` | first speaker found | Every message goes to all of these. A tile with none is disabled |
| `shape` | `square` | `square` or `horizontal` |
| `mode` | `plain` | As for the card |
| `max_duration` | `60` | As for the card |
| `noise_suppression` | `false` | As for the card |
| `keep_messages` | `true` | As for the card, except the tile has no Save button |

</details>

## Requirements and restrictions

Most problems people run into are covered here, so please read this before
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
  integration. A card or tile with **Keep sent messages** off deletes its messages once
  they have played. Removing the integration deletes all recordings. Past recordings are also
  browsable in the Media panel, in a "Voice Broadcast" folder.
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
| `Custom element doesn't exist: hass-broadcast-card` on mobile, with Lovelace in YAML mode | Add the resource yourself — see below |

In **YAML mode** your dashboard resources are yours to manage, so the integration
won't write to them. Its fallback works in desktop browsers but not reliably in
the Companion apps; add the resource by hand:

```yaml
lovelace:
  mode: yaml
  resources:
    - url: /api/hass_broadcast/static/hass-broadcast-card.js
      type: module
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development setup, tests and releases.

## License

[MIT](LICENSE)

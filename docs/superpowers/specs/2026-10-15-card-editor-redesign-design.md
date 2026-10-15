# Card editor redesign: native form, flat config

## Goal

Setting the card up is the hard part, not using it. The current editor is a
stack of equal-weight fields, five hint paragraphs, a section list that mixes
show/hide, ordering and styling (and offers ordering for header icons where it
does nothing), and a show-list/hide-list pair with set semantics. The card's
own look is fine and does not change.

This redesign replaces both editors with Home Assistant's native form
(`getConfigForm()`), and reshapes the config so every editor control maps to
exactly one key. The integration has never been installed anywhere, so the
config is replaced outright — no legacy readers, no migration.

The options were compared as real renders in HA's frontend (see *Editor
tooling*); the canvas with the mockups and renders is
https://claude.ai/artifact/AEG9UYYVmqnXRxBBaERvL1.

## Decisions

| Topic | Decision |
|---|---|
| Card visuals | Unchanged. Layouts, slots and `check:layout` guarantees stay as they are |
| Editor technology | `static getConfigForm()` on both cards; HA renders the form. No custom editor element |
| Why not custom | `ha-form` and the `ha-*` selectors are internal; hosting them in our own element needs a lazy-load workaround that has broken custom cards before. A fully custom editor is robust but never native |
| Ordering | Gone. The config has no order; the layouts place everything |
| Speakers | One whitelist, pre-filled with every speaker when the card is created |
| Playback | `mode` stays `plain` \| `chime` \| `restore`; backend untouched |
| Legacy config | Removed, not migrated |

## Configuration

### Card

```yaml
type: custom:hass-broadcast-card
title: Kitchen intercom             # optional; absent or blank → "Voice Broadcast"
layout: full                        # full | compact
speaker_picker: dropdown            # dropdown | chips | list
recent_messages: button             # off | button | list
volume_control: true
speakers: [media_player.kitchen]    # whitelist; absent → every speaker, [] → none
selected: [media_player.kitchen]    # ticked when the card opens
record_mode: push_to_talk           # push_to_talk | start_stop
max_duration: 60                    # seconds, 5–300
mode: restore                       # plain | chime | restore
```

| Key | Default | Meaning |
|---|---|---|
| `title` | `Voice Broadcast` | Card heading |
| `layout` | `full` | `full` or `compact` |
| `speaker_picker` | `dropdown` | How the speakers are picked in `full`. `compact` always uses the dropdown |
| `recent_messages` | `button` | `off`; `button` (header icon opening the dialog); `list` (three rows below the record core). In `compact`, anything but `off` puts it in the ⋮ menu |
| `volume_control` | `true` | The volume override (header icon in `full`, ⋮ menu in `compact`) |
| `speakers` | every speaker | The speakers the card offers, in the order listed. Absent means every media player that supports `PLAY_MEDIA`; `[]` means none. A speaker named here appears even while unavailable |
| `selected` | `[]` | Speakers ticked when the card opens. Entries not in `speakers` are ignored, and never broadcast to |
| `record_mode` | `push_to_talk` | `push_to_talk` or `start_stop` |
| `max_duration` | `60` | Recording time limit in seconds, clamped to 5–300 |
| `mode` | `plain` | `plain`, `chime` or `restore` |

Removed keys: `sections`, `player_list`, `show_history`, `show_players`,
`hide_players`, `targets` (the card's `targets` is now `selected`).

Fixed placement, previously configurable through `sections` order: in `full`,
the speaker picker sits directly below the record core and the recent-messages
list (when `list`) below it; header icons are recent messages then volume. In
`compact`, the ⋮ menu lists recent messages then volume.

`speakers` absent vs `[]` was checked against HA's real entity picker:
removing the last entity saves `speakers: []`, it does not drop the key. So an
emptied list never silently turns into "every speaker". A card with no
speakers shows the existing empty state ("No speakers found").

### Tile

```yaml
type: custom:hass-broadcast-tile
name: Kids' rooms
speakers: [media_player.kids_room, media_player.bedroom]   # was `targets`
shape: square        # square | horizontal
max_duration: 30
mode: plain
```

The tile still sends to all of its `speakers` on release; no `selected`.

## Editor

Both editors are `getConfigForm()` schemas. Labels come from `computeLabel`;
`computeHelper` is used only where the label cannot carry the meaning.

### Card form

| Section (expandable, icon) | Field | Selector |
|---|---|---|
| — | Name (`title`) | `text`; helper "Leave empty for “Voice Broadcast”" |
| Appearance (`mdi:palette-outline`, expanded) | Layout | `select`, `mode: box`, picture options Full / Compact |
| | Speaker picker | `select`, `mode: box`, picture options Dropdown / Chips / List; `visible` only when `layout` is `full` |
| | Recent messages | `select` dropdown: Off / Button in the header / List below the card |
| | Volume control | `boolean` |
| Speakers (`mdi:speaker`, expanded) | Speakers on the card (`speakers`) | `entity`, `multiple`, `filter: {domain: media_player}` |
| | Selected when the card opens (`selected`) | same |
| Recording (`mdi:microphone`) | Recording (`record_mode`) | `select`, `mode: box`, with descriptions: Hold to talk / Tap to start and stop |
| | Time limit (`max_duration`) | `number`, slider, 5–300, step 5, unit `s` |
| Playback (`mdi:volume-high`) | When it plays (`mode`) | `select`, `mode: box`, one column, with descriptions: Just play it · Chime first · Pause, then resume |

Picture options are inline SVG data URIs with `src` and `src_dark` variants,
drawn as schematic thumbnails of the card (same visual language as the
mockups).

### Tile form

Name · Speakers (`entity`, multiple) · Shape (`select` box with pictures:
Square / Horizontal) · Time limit · When it plays — the last two shared with
the card form.

### Stub configs

- Card `getStubConfig(hass)`: every discovered playback-capable speaker in
  `speakers`, nothing `selected`, everything else at its default.
- Tile `getStubConfig(hass)`: the first discovered speaker in `speakers`
  (unchanged behaviour: a one-tap button should not default to the whole
  house).

### Version tolerance

`hacs.json` requires Home Assistant 2024.11. The plan must verify against
the frontend source, before implementation, the release in which each of
these landed, and record the result here:

- `getConfigForm()` for custom cards;
- `select` `mode: box` with `image` / `description`;
- `visible` on schema fields (blog post dated 2026-07-31, so 2026.8).

Where a feature is newer than 2024.11, the form must still work there: an
unknown `visible` showing the speaker-picker field in `compact` too is
acceptable; a missing `box` mode falling back to a plain select is
acceptable. If `getConfigForm()` itself is newer than 2024.11, raise the
`hacs.json` minimum to that release.

## Code structure

```
frontend/src/
  config.ts         resolveConfig(): defaults, speakers absent vs [],
                    selected ∩ speakers, compact ⇒ dropdown. Replaces sections.ts.
                    The only place config is interpreted.
  forms.ts          shared schema pieces: speakers field, time limit,
                    playback mode, SVG thumbnails, label/helper maps
  card.ts           static getConfigForm(), getStubConfig(hass); reads resolveConfig()
  tile.ts           same, for the tile
  layouts/*.ts      read resolved flags instead of Section[] (visuals unchanged)
  players.ts        visiblePlayers/allowedTargets take the whitelist
```

Deleted: `editor.ts`, `editor-fields.ts` (its `clampMaxDuration` moves to
`config.ts`), `tile-editor.ts`, `sections.ts`.

CLAUDE.md's *Card configuration keys* section is rewritten for the new keys,
and its pointer to `resolveSections` becomes `resolveConfig`.

## Editor tooling: `npm run dev:editor`

`npm run dev` can no longer show the editor, because HA draws it. The
replacement is HA's own design gallery, run locally:

- `frontend/dev/editor/` holds a committed gallery page and a script.
- The script shallow-clones `home-assistant/frontend` at a pinned release tag
  (initially `20260930.3`) into a gitignored cache, provisions Node 24 and
  pnpm there without touching the system install, copies the page into
  `gallery/src/pages/misc/`, and runs the gallery with
  `SKIP_FETCH_NIGHTLY_TRANSLATIONS=1` (otherwise it stops for a GitHub login).
- The page imports our real `card.ts` and `tile.ts`, wraps each in HA's
  `hui-card-element-editor` against the gallery's fake `hass` with six demo
  speakers, and shows the live card beside it, in light and dark.
- `npm run dev:editor -- --screenshots` drives it with `playwright-core` and
  writes the README's editor images.
- Not in CI (it would clone a large repo), same policy as `check:layout`.

`frontend/dev/README.md` documents it; the dev harness drops its embedded
editors and gets a YAML box for card config instead.

## README

Rewritten in the same change:

- Card options table and YAML example (new keys, removed keys gone, no
  legacy paragraph).
- *Layouts and sections* becomes *Appearance*: layout, speaker picker,
  recent messages, volume control.
- *Broadcast tile*: `speakers` instead of `targets`, new options table.
- Restriction notes that name old keys (`restore` mode notes stay — `mode` is
  unchanged).
- New editor screenshots, light and dark (via `dev:editor --screenshots`),
  using the existing `<picture>` light/dark pattern. Card screenshots are
  retaken only where something visible changed.

## Testing

- `config.test.ts`: defaults; `speakers` absent → all discovered, `[]` →
  none; `selected` filtered to `speakers`; `compact` forces the dropdown;
  `max_duration` clamping.
- Form tests: every key in the config table has exactly one field across
  `getConfigForm().schema` (walking grids and expandables), and no field names
  a removed key; same for the tile.
- `getStubConfig` with a fake `hass`: card lists every playback-capable
  speaker, tile the first.
- Existing card/tile tests move to the new keys; editor tests are deleted
  with the editors.
- `npm run check:layout` passes for every layout × speaker_picker ×
  recent_messages combination it already covers.
- CI's bundle-is-rebuilt check still passes; `pytest` unchanged.

## Out of scope

- Any change to the card's or tile's visuals.
- Backend changes, including combining chime with restore (considered and
  dropped).
- An "Add all speakers" button (`ha-form` has no button field; the pre-filled
  stub covers new cards).

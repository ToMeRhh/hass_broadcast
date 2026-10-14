# Record-first card layouts, configurable sections, and a broadcast tile

## Goal

The card is too tall for a dashboard and gives every control the same weight.
This redesign makes it compact, puts the record button first, and lets users
choose what else the card shows — without ever letting the card move under
the user's thumb.

It also adds a second card: a walkie-talkie tile that records and sends to a
fixed set of speakers in one gesture.

The mockups these decisions came from live in `.superpowers/brainstorm/`
(git-ignored); this document is the record.

## Decisions

| Topic | Decision |
|---|---|
| Layouts | `full` (record-first, ~4 rows) and `compact` (2 rows) |
| Customisation | Locked record core; speakers, recent messages and volume are reorderable, restylable, hideable "sections" |
| Recording animation | A blob behind the mic whose size follows the live level, plus a countdown arc on the button's rim |
| Recording strip | Only a `● 0:07` timer — no live waveform |
| Review | The recorded waveform draws itself in once, left to right |
| Send | Always rendered; disabled until there is a take |
| Layout shift | None between states: every state-dependent element has a fixed slot |
| Tile | A separate card, `custom:hass-broadcast-tile` |

## Configuration

### Main card

```yaml
type: custom:hass-broadcast-card
title: Voice Broadcast
layout: full                 # full | compact
sections:                    # order = render order
  - type: speakers
    style: pill              # pill | chips | rows
  - type: history
    style: list              # list | icon
  - type: volume             # icon (the only style)
record_mode: push_to_talk
mode: plain
max_duration: 60
targets: []
show_players: []
hide_players: []
```

Rules, all implemented by `resolveSections()` in `sections.ts`:

- A section absent from `sections` is hidden.
- `speakers` cannot be hidden. If it is missing it is inserted first, as a pill.
  Without it the card could only send to its saved `targets`, which is the
  tile's job.
- Unknown types and duplicates are dropped; the first occurrence wins.
- In `compact`, speakers is always a pill (chips and rows do not fit), and the
  other sections live in the ⋮ menu in list order.
- In `full`, `icon`-style sections are buttons in the header; every other
  section stacks below the record core, in list order.

**Legacy cards** (no `sections` key) resolve to:

- `speakers` with style from `player_list`: `rows`→`rows`, `chips`→`chips`,
  `dropdown`→`pill`; absent → `rows`
- `history` as `list`, unless `show_history: false`
- `volume` as `icon`

An absent `layout` means `full`. Once the editor saves a card, it writes
`layout` and `sections` and removes `player_list` and `show_history`.

### Tile

```yaml
type: custom:hass-broadcast-tile
name: Kids' rooms
targets: [media_player.kids_room, media_player.bedroom]
shape: square        # square | horizontal
mode: plain
max_duration: 30
```

The tile is push-to-talk only: releasing sends straight away. `icon` is
deliberately not supported yet; the tile always draws the mic.

## States

`idle → recording → review ⇄ sending`. Discard returns from review to idle.
Recording again from review replaces the clip. Loading a recent message goes
straight to review. "Review" is not a separate phase in code: it is
`phase === "idle"` with a clip loaded.

### No layout shift

Each state-dependent region is a **layered slot**: a fixed-size grid cell
with every layer stacked in the same cell (`grid-area: 1/1`). A state change
only toggles which layer has `opacity: 1`, over 180 ms. Discard has its own
reserved slot and fades/scales in; Send is always present. Nothing enters or
leaves the layout flow, and slot heights come from CSS, never from content.

`npm run check:layout` drives the dev harness through every
layout × state combination in a headless browser and fails if any slot's
position or size differs between states.

### Recording

- The blob's scale is `1 + level × 0.35`, capped, where `level` is the latest
  peak the `LevelEnvelope` appended (about 20 updates a second). It also
  wobbles continuously via a CSS keyframe.
- The countdown arc on the rim is a CSS animation whose duration is
  `max_duration`; it restarts on every take because it is only applied while
  recording.
- The strip shows only the elapsed time. In the last 10 seconds — or the last
  quarter of the limit, whichever is shorter — it turns `--warning-color`.
- In start-stop mode the mic icon crossfades to ■ while recording.

### Review

The recorded waveform's bars grow from the centre line, left to right, over
~0.6 s, once per clip. Tapping or dragging the waveform still seeks.

### Status messages

Errors and confirmations become another layer of the strip (full) or of row
1 (compact). They show for 4 s, then the slot returns to its normal content.
They are mirrored in an `aria-live` region. Long text is ellipsised, with the
full text in `title`. The insecure-context and microphone-denied errors are
sticky and disable the mic until the next attempt.

### Reduced motion

`prefers-reduced-motion: reduce` swaps the blob for a static ring and turns
off the waveform draw-in and the crossfades. The countdown arc still
advances, because it carries information.

## Layouts

**Full.** Header (title + icon-style sections) · 40 px strip · 132 px core of
`[discard] [mic 96px] [send]` · non-icon sections below.

**Compact.** 72 px mic on the left. On the right, row 1 is a 30 px layered
slot (title + hint / timer / play + waveform + discard / status) followed by
an always-present ⋮ button; row 2 is the speaker pill and Send. The ⋮ menu
lists the remaining sections: recent messages opens the existing dialog;
volume expands into the toggle and slider inside the menu.

## Tile

A square tile (mic over name and hint) or a horizontal one (mic beside them),
using the same mic component and animation. On release it uploads and sends
at once, then shows ✓ / partly sent / ✕ for 2.5 s. A press under 0.4 s says
"Hold to talk" instead of sending. A tile with no targets is disabled with
"Pick speakers in the card editor". Recordings from a tile are uploaded the
same way as the card's, so they appear in the card's recent messages.

## Code structure

```
frontend/src/
  recording.ts       RecordingController: phase, elapsed, level, press handling,
                     max-duration timer, teardown guards (moved from card.ts)
  sending.ts         upload-once + send, outcome → message
  sections.ts        config types, resolveSections(), legacy mapping
  card.ts            the main card
  tile.ts            hass-broadcast-tile
  tile-editor.ts     its editor
  editor.ts          main editor: layout + sections list
  editor-fields.ts   fields both editors share
  layouts/full.ts    full layout template
  layouts/compact.ts compact layout template
  ui/mic.ts          record button + blob + countdown arc
  ui/strip.ts        layered slot helper
  ui/icons.ts        inline SVG icons
```

`ui/player.ts` is removed; play and discard move into the strip and the core.
One bundle defines both custom elements and registers both `customCards`
entries. There are no Python changes.

## Sizing

- `getCardSize()`: full is 5 plus 1 for chips, 4 for rows and 3 for the
  history list; compact is 2; the tile is 3 (square) or 1 (horizontal).
- `getGridOptions()`: the main card leaves `rows` undefined so the sections
  view sizes it to its content, with `columns: 12, min_columns: 6`. The tile
  asks for `rows: 2, columns: 3` square and `rows: 1, columns: 6` horizontal.

## Editors

**Main card:** Card name · Layout (Full | Compact) · Card sections (↑/↓
reorder, style select, show/hide; speakers cannot be hidden; in compact the
other styles are hidden with a hint about the ⋮ menu) · Recording · Playback
mode · Players to show/hide · Maximum length. Reordering uses buttons rather
than drag and drop, which does not work with touch in the companion app.

**Tile:** Name · Speakers (checkbox list → `targets`) · Shape · Playback mode
· Maximum length. `getStubConfig` preselects the first discovered player.

## Testing

- vitest: `recording.test.ts`, `sections.test.ts`, `sending.test.ts`,
  `tile.test.ts`, `tile-editor.test.ts`, plus updated `card.test.ts` and
  `editor.test.ts`. The race and guard cases from `card.test.ts` move with the
  code they test.
- `npm run check:layout` (Playwright, not in CI) for geometry.
- `npx tsc --noEmit` stays clean.

## Delivery

Two stacked PRs: (1) layouts, sections and the controller split; (2) the tile.
Both commit the rebuilt bundle. The release workflow bumps the version, so a
merge reaches users only once a release is cut.

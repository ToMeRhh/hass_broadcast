# Voice Broadcast card — UI redesign

Date: 2026-08-22

## Goal

Rebuild the Lovelace card's interface around one idea: a card that never
reflows. Recording, listening back, choosing speakers and broadcasting all
happen in a fixed skeleton whose regions change content and enabled-state but
never appear, disappear or resize.

Three changes drive it:

1. Recording can be **push-to-talk** or **start-stop**, chosen per card.
2. The card is rebuilt: a large waveform strip, a large centred record button,
   an in-card player instead of a browser `<audio controls>` element, a speaker
   list in one of three styles, and a Broadcast button that is always visible
   and disabled when it cannot act.
3. Selecting a message from history **loads** it into the card instead of
   broadcasting it immediately. A loaded historical message is
   indistinguishable from one just recorded: it plays locally and Broadcast is
   enabled.

## Configuration

Two new keys, both written by the editor:

| key | values | default |
| --- | --- | --- |
| `record_mode` | `push_to_talk` \| `start_stop` | `push_to_talk` |
| `player_list` | `rows` \| `chips` \| `dropdown` | `rows` |

`title`, `mode`, `show_players`, `hide_players`, `max_duration` and
`show_history` keep their current meaning.

**An absent `record_mode` means `push_to_talk`.** Cards installed before this
change therefore switch to hold-to-talk on upgrade. This is deliberate and
confirmed: one default for every card beats a default that depends on when the
card was created. `getStubConfig` writes the key explicitly so a new card's YAML
states its mode rather than relying on the fallback.

## Layout

```
┌──────────────────────────────────────┐
│ Voice Broadcast                      │  ha-card header
│                                      │
│  ▃▅█▇▅▃▂▄▆█▇▅▃▂▁▂▃▂▁▁▁▁              │  waveform strip, fixed 64px
│  ▇▅▃▂▃▅▆▄▂▁▂▄▆▇█▇▅▃▂▁▁▁              │
│  ▶   0:03 / 0:08                 ✕   │  player row, fixed height
│                                      │
│              ( ◉ )                   │  record button, 96px, centred
│           Hold to talk               │  status line, fixed height
│                                      │
│  Speakers                    2 of 8  │
│  ┆ list in the configured style   ┆  │
│                                      │
│          [   Broadcast   ]           │  always shown; disabled when idle
│                                      │
│  Recent messages                     │
│  5 minutes ago       0:03        🗑   │
│  Today 14:02         0:08        🗑   │
└──────────────────────────────────────┘
```

Every region is present in every state. The status line is the single place for
the elapsed timer, microphone errors, send results and load failures, so an
error never shifts the card. The `dropdown` speaker style opens as an overlay
above the content below it rather than pushing it down — the one element that
would otherwise reflow.

## The waveform strip

One element serving three states:

- **Idle** — a flat baseline of minimum-height bars.
- **Recording** — a live scrolling tail: the most recent ~40 peaks, mirrored
  around the horizontal axis, newest on the right.
- **Loaded** — the full envelope of the loaded clip resampled to the strip's bar
  count, with a playhead. Bars behind the playhead are filled, ahead of it
  dimmed. Tapping or dragging the strip seeks.

### Where the peaks come from

`Recorder.onLevel` fires once per 128-frame render quantum — at 16 kHz that is
125 callbacks per second, each currently a Lit update. `levels.ts` coalesces
them: keep the running maximum, flush at most every 50 ms. Each flush appends
one peak to a growing envelope and the live view renders its tail.

When recording stops, that same envelope **is** the clip's waveform. A fresh
recording therefore needs no decoding at all.

A clip loaded from history has no envelope, so its audio is decoded once with
`AudioContext.decodeAudioData` — which handles both the WAV the card uploads and
the MP3 the integration transcodes to when ffmpeg is available. The decode
result is reduced to one peak per bar. If decoding fails or `AudioContext` is
unavailable, the strip falls back to the flat baseline and still shows a moving
playhead, so playback and seeking keep working.

Bars are plain elements with CSS heights, not a canvas: testable without a DOM
renderer, and consistent with the harness's "plain HTML plus inline SVG" rule.

## The loaded clip

```ts
type ClipSource = { kind: "fresh"; blob: Blob } | { kind: "stored"; id: string };

interface Clip {
  source: ClipSource;
  url: string;        // object URL, for the <audio> element
  duration: number;
  peaks: number[];    // envelope for the strip; empty when decoding failed
}
```

The card holds at most one `Clip`, plus `phase: "idle" | "recording" | "sending"`
and a status line.

**Fresh recording.** `Recorder.stop()` gives blob and duration; the accumulated
envelope gives peaks. Source is `{kind: "fresh"}`.

**Loading from history.** The media view is `requires_auth`, so a bare
`<audio src>` would answer 401. The card fetches the bytes with the bearer token
it already uses for upload:

```
GET /api/hass_broadcast/media/<id>.<extension>
Authorization: Bearer <hass.auth.data.access_token>
```

The response blob becomes an object URL and the source is `{kind: "stored", id}`.
The previous clip's object URL is revoked. A failed fetch writes to the status
line and leaves the current clip alone.

Fetching rather than pointing an `<audio>` at the URL also means the dev
harness's existing fetch mock serves history playback with no new plumbing.

**Replacement.** Loading from history replaces an un-broadcast fresh recording
silently. It was never uploaded, so it is gone — accepted, no confirmation
dialog.

**Broadcast resolves by source.** `fresh` uploads, then sends the returned id.
`stored` sends the id directly: a message loaded from history is never
re-uploaded. After a fresh clip uploads successfully its source is rewritten to
`{kind: "stored", id}`, so retrying after a partial failure does not upload a
second copy.

**A clip survives a successful broadcast.** Today the card discards on success.
Keeping it is consistent with history loading, allows sending the same message to
another speaker, and avoids a reflow. `✕` clears it.

**Broadcast is enabled** iff a clip is loaded, at least one allowed target is
selected, and `phase === "idle"` — not merely `phase !== "sending"`: broadcasting
while a take is recording strands the recorder, because every stop path
(`onPressEnd`, the `max_duration` timer) is gated on `phase === "recording"`, and
sending flips phase away from it before the take can ever be stopped. It is
rendered in every state.

## Recording interaction

`start_stop` keeps today's click-to-toggle behaviour.

`push_to_talk` starts on `pointerdown` and stops on `pointerup`,
`pointercancel` or `pointerleave`. The button sets `touch-action: none` and
suppresses the context menu so a long press on a phone neither scrolls nor
selects. Space and Enter hold from the keyboard, with `event.repeat` guarded so
key auto-repeat does not restart the recording.

Releasing before `Recorder.start()` resolves sets a stop-requested flag that
fires as soon as the start settles. This extends the existing `busy` and
`disconnected` guards in `card.ts` rather than replacing them; those guards
already exist because `Recorder.stop()` throws when there is no active session,
and push-to-talk makes the race far easier to hit.

A press shorter than 400 ms is discarded with a "Hold to talk" hint rather than
producing a clip of near-zero length.

`max_duration` auto-stops both modes, unchanged.

## Speaker list

Three styles over the same data, chosen by `player_list`. Each is a pure render
function taking the visible players, the current selection and callbacks; all
three show the same `n of m` counter and use the existing
`visiblePlayers`/`allowedTargets` filtering.

- **`rows`** — one row per speaker: name, an "unavailable" marker where the
  entity state says so, and a checkbox. Scrolls past about five rows.
- **`chips`** — today's pills, restyled; selected pills filled.
- **`dropdown`** — a summary bar ("Kitchen, Living Room +1") opening an overlay
  panel of the same rows.

## History

Header "Recent messages" with a count. Each row shows a relative timestamp
("5 minutes ago", "Today 14:02") and the duration, and loads the clip when
tapped; the loaded row is highlighted. The delete control appears only where the
server reports `can_delete`, and the existing `not_authorized` handling stays.

The per-row "Play" button — which broadcast immediately — is removed, along with
the card's `replay()` method. Broadcasting an old message is now: tap the row,
then tap Broadcast.

Empty history renders a fixed-height "Nothing recorded yet" so the card does not
change height. `show_history: false` removes the section entirely, as today.

## File layout

One custom element still: sub-elements would fragment CSS custom properties
across shadow roots and complicate tests for no gain here.

| file | contents |
| --- | --- |
| `frontend/src/card.ts` | the element: state machine, orchestration, event wiring |
| `frontend/src/clip.ts` | `Clip`, `ClipSource`, loading a stored clip, resolving a broadcast source |
| `frontend/src/levels.ts` | peak coalescing, the envelope, resampling to bar counts |
| `frontend/src/format.ts` | `mm:ss` and relative timestamps |
| `frontend/src/styles.ts` | the card's stylesheet |
| `frontend/src/ui/visualizer.ts` | the strip |
| `frontend/src/ui/player.ts` | the slim player row |
| `frontend/src/ui/targets.ts` | the three speaker-list styles |
| `frontend/src/ui/history.ts` | the recent-messages section |

`ui/*` export pure functions returning `TemplateResult`. `editor.ts` gains the
two new fields.

## Testing

New vitest coverage for: peak coalescing and envelope resampling; time
formatting; clip-source resolution (fresh uploads then sends, stored sends
directly, a sent fresh clip becomes stored); the push-to-talk press/release
machine including release-before-start and the sub-400 ms press; loading from
history including the failure path; and the Broadcast enable conditions. The
three speaker-list styles are asserted through the card's render output, as the
existing tests do.

Existing card tests are updated for the removed `replay()` and the clip that now
survives a successful send. The Python suite is untouched — no integration code
changes.

## Dev harness

- The two new config fields arrive through the real editor, so both record modes
  and all three list styles are switchable in the harness without new controls.
- New scenario toggle: **media fetch fails**, so the history-load error path is
  reachable.
- Confirm the fake recorder's level signal has enough dynamic range to exercise
  the strip, and that `fakeSpeech` clips decode for the loaded-clip waveform.
- `MockBackend.upload` already prepends to history, which is what the post-send
  refresh shows.

## Delivery

`npm run build` and commit the regenerated
`custom_components/hass_broadcast/www/hass-broadcast-card.js` in the same commit
as the source change, per CLAUDE.md. The version bump belongs to the Release
workflow; nothing reaches users until a release is cut.

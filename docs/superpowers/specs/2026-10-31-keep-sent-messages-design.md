# Keep sent messages: optional recording history

## Why

A user wrote: "it felt a bit odd having past recordings of random things I said
over the speakers especially when they were silly." They tried setting the
integration's "recordings to keep" to 0 and found the minimum is 1.

That option is the size of the history, not a way to turn it off. Today the
integration has no way to turn it off. Every broadcast is uploaded into the
history, and the history is the only place a clip can live while the speakers
fetch it.

## What we're building

A per-card setting, **Keep sent messages** (`keep_messages`). When it's off, a
message plays on the speakers and is then deleted. On the card (not the tile), a
**Save** button keeps the clip that's currently loaded.

Mockups: https://claude.ai/artifact/G1BqZTMkGELBG59MSqN4LS. Option A ("Save in
the clip strip") and the editor frame are the ones agreed. B and C were
rejected.

## Goals

- Someone can use the card without leaving a trail of recordings in Recent
  messages, the media browser, or `<config>/hass_broadcast/`.
- They can still keep a specific message, deliberately, with one tap.
- Existing installs behave exactly as before until someone flips the switch.

## Non-goals

- A household-wide switch. The setting belongs to each card. A card with it on
  and a card with it off can sit on the same dashboard.
- Changing what the integration's `retention` option means. It stays "how many
  saved recordings to keep" (minimum 1). Temporary clips don't count toward it.
- A Save button on the tile. The tile has no room for one and no review step
  (its release sends). It gets only the editor switch.

## Anti-goals

- **Breaking or silently changing existing cards.** A card with no
  `keep_messages` key keeps saving, as it does today. See "Defaults" below.
- **Cutting off playback.** A temporary clip must stay fetchable for as long as
  any speaker might still request it, including restore mode's volume tail
  and speakers that fetch twice.
- **Layout shift.** The Save button lives inside the existing review layer of
  the strip. It never appears or disappears in a way that moves other elements.
  `npm run check:layout` must still pass.
- **A new Home Assistant service.** Saving goes over the websocket, beside
  list, delete and send (see CLAUDE.md, "The integration registers no Home
  Assistant service").
- **Deleting files the store doesn't own.** Cleanup only ever removes files
  for temporary entries the store itself created, never by scanning the
  directory.

## Defaults and compatibility (decided)

- `resolveConfig` / `resolveTileConfig`: `keepMessages = config.keep_messages
  !== false`. If the key is absent, messages are kept, as they are today.
- `getStubConfig` for both cards writes `keep_messages: false`, so any card
  added after this release starts with history off.
- Server: the upload takes an optional `temporary` form field. If it's
  absent, the upload is a normal saved recording. That keeps old cached
  bundles working. The Android WebView can keep serving the previous bundle
  for a while after the update, and it never sends the field.

## The integration

### Temporary recordings

The upload view accepts a `temporary` form field. A truthy value (the card
sends `"1"`) stores the recording as temporary. A temporary recording:

- is hidden from `hass_broadcast/list` and from media-source browse;
- can still be resolved by media source and served by the media view, which
  is how the speakers play it;
- can still be sent with `hass_broadcast/send`, for retries and sending to
  another speaker;
- doesn't count toward `retention` and is never pruned by it;
- is deleted 10 minutes after it was uploaded or last sent, whichever is
  later. A send pushes the deadline back. Ten minutes covers the 300 s
  maximum clip length plus restore mode's tail with room to spare. Expiry
  must happen even if nobody touches the card again, so it needs a timer, not
  just a sweep on the next request;
- is deleted when the integration loads if it is still there, for example
  after a restart, a crash, or a reload from changing the integration's
  options. It is not reloaded as a live temporary. Timers are cancelled on
  unload;
- is deleted with everything else by `async_remove_all`.

How it's stored is the builder's call. A `temporary` flag plus an `expires`
time on the metadata entry, persisted, works. So does keeping temporaries out
of the persisted list and tracking them separately. Either way, cleanup after
a crash must work from what the store recorded, never from scanning the
directory (see the anti-goal above).

### `hass_broadcast/save`

A new websocket command `{type: "hass_broadcast/save", message_id}`.

- Same authorization as delete: an admin, or the user who uploaded it.
- Turns a temporary recording into a saved one. It joins the history as the
  newest entry, its expiry timer is cancelled, and retention pruning runs.
- On a recording that's already saved, it succeeds and changes nothing, so
  the card can treat "Saved" as idempotent.
- On an unknown id, it returns error `not_found`, like send does.
- The result is `{saved: true}`.

## The card

### Config and editor

- New key `keep_messages` (boolean) on both the card and the tile, read only
  through `resolveConfig` / `resolveTileConfig`.
- The field carries `default: true` in its schema, so an existing card (key
  absent) opens in the editor with the switch **on**, matching what it does.
  This is the first boolean in `forms.ts` that is on when absent. It works
  on both ends: `ha-form` passes a non-required field's `default` to the
  selector as `placeholder`, and `ha-selector-boolean` renders
  `checked = value ?? placeholder === true`. Checked in home-assistant/frontend
  at `dev` and at `20241127.4` (the 2024.12 floor's frontend). Cover it with
  a test in `forms.test.ts`.
- The editor field is a boolean selector placed next to `noise_suppression`
  in both forms:
  - label "Keep sent messages"
  - helper text "Adds every message you send to Recent messages."

  The helper text describes what *on* does, and stays short (the user asked
  for this wording style).
- `forms.test.ts`'s every-key-has-one-field check covers it. The README's
  options tables get the new row for both cards.
- CLAUDE.md's list of card configuration keys gets `keep_messages` for both.

### Sending

- When `keepMessages` is off, `sendClip` uploads with `temporary`. When it's
  on, it uploads exactly as today.
- A temporary clip that was already uploaded is reused for retries and other
  speakers, as stored clips are today. If send returns `not_found` for a
  temporary clip (it expired while still loaded), the card re-uploads from
  the audio it still holds and sends again. It does not show "That recording
  was deleted." That message stays for saved clips deleted elsewhere.

### The Save button (option A)

- Shown only when `keepMessages` is off. With it on, everything is saved
  already and the button isn't rendered.
- It sits at the end of the strip: in full, after the clip length; in
  compact, beside Discard in row 1, as an icon-only button (row 1 has no room
  for the text pill; same size in both looks).
- It is also drawn at the same position in the strip's **status** layer,
  whenever a clip is loaded. `view` returns `"status"` while any status
  message shows: "Sent to …" for `STATUS_MS` after a send, and sticky errors
  until the next attempt. Without this, Save would be hidden at exactly the
  moment it is wanted, and a failed save's error would cover the button you'd
  tap to retry. The text crossfades between layers while the button stays
  put (decided with Tomer). With no clip loaded, the status layer has no
  button.
- It has two looks, at the same size so nothing moves:
  - **Save** (outline bookmark): the clip isn't kept yet. That covers a fresh
    clip not yet sent, or a temporary one already sent.
  - **Saved** (filled bookmark, not clickable): the clip is in the history.
    That covers one just saved, or one loaded from Recent messages.
- Tapping Save:
  - on a clip not yet uploaded, it uploads it as saved;
  - on a temporary clip, it calls `hass_broadcast/save`;
  - on a temporary clip that has expired (`not_found`), it re-uploads as saved.

  It then refreshes the history, so the message shows in Recent messages.
- A failure shows in the status line, like other errors. A success needs no
  status message: the button turning into Saved is the confirmation.
- The button needs an accessible label ("Save to history" / "Saved to
  history").

### The tile

The tile reads `keepMessages` and uploads with `temporary` when it's off.
Nothing else changes.

## Calls made in this design (not discussed with Tomer)

- The key is named `keep_messages`.
- The temporary lifetime is 10 minutes after upload or last send.
- Discard doesn't delete a sent temporary clip right away; it expires on its
  own. Deleting it immediately could cut off a speaker that is still fetching
  or playing it.
- The Save button is shown whether or not `recent_messages` is on. A saved
  message is still reachable from another card and the media browser.
- In compact, Save is icon-only.
- A reload of the entry (changing its options) clears temporaries like a
  restart does. A card holding one re-uploads on `not_found`.
- "Saved" is a final state on the card. To un-keep a message, delete it from
  Recent messages, as today.

## Verification

- Integration tests:
  - temporary recordings are hidden from list and browse, but resolvable,
    servable and sendable;
  - they expire on the timer, and a send extends the deadline;
  - they're purged on load;
  - retention ignores them;
  - save's authorization, idempotence and `not_found`;
  - an upload without the field is saved, so old bundles still work.
- Card tests:
  - `resolveConfig` defaults (absent → keep, `false` → don't);
  - stub configs write `false`;
  - the temporary flag is sent;
  - the Save/Saved states;
  - save on a fresh, temporary and expired clip;
  - re-upload on `not_found` for temporary clips.
- `npm run check:layout` passes, and the review state includes the button.
- Run the integration suite against the 2024.12 floor by hand (CLAUDE.md),
  since this touches the store and adds a timer.
- `npm run build`, and commit the bundle with the source change.

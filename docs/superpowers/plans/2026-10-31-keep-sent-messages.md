# Keep Sent Messages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A per-card `keep_messages` switch (default on). When it's off, broadcasts upload as temporary recordings that expire after playback. A Save button on the card keeps the loaded clip.

**Architecture:** The store marks entries `temporary` in the same metadata list. List, browse and retention skip them, and a per-entry `async_call_later` deletes them 600 s after upload or last send. Uploads take a `temporary` form field. A new `hass_broadcast/save` websocket command clears the flag. The card gains a third clip source, `temporary`, which keeps its blob for re-upload. A Save button is drawn at the end of the strip in both the review and status layers.

**Tech Stack:** Home Assistant custom integration (Python 3.12+ syntax, pytest-homeassistant-custom-component). Lit + TypeScript card (vitest unit + browser).

**Spec:** `docs/superpowers/specs/2026-10-31-keep-sent-messages-design.md`

## Global Constraints

- Absent `keep_messages` → keep. Only an explicit `false` makes messages temporary. Both stubs write `keep_messages: true`.
- Absent `temporary` upload field → saved recording (old cached bundles).
- Temporary lifetime: `TEMPORARY_TTL = 600` seconds after upload or last send.
- No Home Assistant service. Saving is the websocket command `hass_broadcast/save`.
- Cleanup removes only files for entries the store recorded. It never scans the directory.
- No layout shift: Save lives inside the existing strip layers. `npm run check:layout` passes.
- Editor copy: label "Keep sent messages", helper "Adds every message you send to Recent messages." The field has `default: true`.
- mypy strict, no `# type: ignore`. No `Array.prototype.at` in `frontend/`. Ruff `py312`.
- Any `frontend/src/` change ships with `npm run build` output in the same commit.
- Commits use Conventional Commits and end with the session's attribution lines.

## Review Focus

1. **Save tapped twice, or while sending.** It must not double-upload. The button is disabled while a save or send is in flight. Test in Task 5.
2. **The clip is discarded or replaced while a save is in flight.** The new clip must not be rewritten as "stored". Test in Task 5, same guard as `onStored`.
3. **The expiry timer fires for an entry already saved or deleted.** It must be a no-op and must not delete a saved recording. Test in Task 1.
4. **A temporary clip is sent after the entry reloaded** (options changed). The server answers `not_found`, and the card must re-upload silently, not show "That recording was deleted." Test in Task 4.
5. **A non-owner, non-admin calls save on someone else's temporary.** The answer is `not_authorized` and the entry stays temporary. Test in Task 2.

---

### Task 1: Temporary recordings in the store

**Files:**
- Modify: `custom_components/hass_broadcast/const.py`
- Modify: `custom_components/hass_broadcast/storage.py`
- Modify: `custom_components/hass_broadcast/__init__.py` (`async_unload_entry`)
- Test: `tests/test_storage.py`, `tests/test_init.py`

**Interfaces:**
- Produces:
  - `TEMPORARY_TTL: int = 600` in `const.py`.
  - `BroadcastStore.async_add(data, *, extension, duration, user_id, temporary: bool = False) -> str`.
  - `BroadcastStore.async_touch(message_id: str) -> None`: restarts the TTL if the entry is temporary, otherwise a no-op.
  - `BroadcastStore.async_keep(message_id: str) -> bool`: clears the flag, moves the entry to the newest position, cancels its timer, runs prune, saves. Returns `False` for an unknown id and `True` otherwise (also when it was already saved).
  - `BroadcastStore.async_shutdown() -> None` (`@callback`): cancels all timers.
  - `async_list()` excludes temporaries. `async_get` / `async_path` / `async_delete` include them.
  - Metadata entries carry `"temporary": True` only while temporary. The key is absent on saved entries, so stored data stays version 1.

- [ ] **Step 1: Write the failing tests** in `tests/test_storage.py`. Each uses `BroadcastStore(hass, retention=...)` with `await store.async_load()`, as the existing tests do. Use `async_fire_time_changed` from `pytest_homeassistant_custom_component.common` with `dt_util.utcnow() + timedelta(seconds=...)`.
  - `test_temporary_is_hidden_from_list_but_gettable`: add temp → `async_list() == []`, `async_get(id)["temporary"] is True`, `async_path(id).read_bytes() == data`.
  - `test_temporary_expires_after_ttl`: add temp. Fire at +599 s → still present. Fire at +601 s, then `await hass.async_block_till_done()` → `async_get(id) is None` and the file is gone.
  - `test_touch_pushes_the_deadline_back`: add temp. Fire at +500 s, `await store.async_touch(id)`, fire at +900 s → present. Fire at +1101 s → gone.
  - `test_keep_makes_it_saved_and_newest`: add saved A, add temp T, add saved B. `async_keep(T)` → True. `[m["id"] for m in async_list()] == [T, B, A]` and `"temporary" not in async_get(T)`. Fire at +601 s → T still present (Review Focus 3).
  - `test_keep_is_idempotent_and_false_for_unknown`: `async_keep(saved_id) is True` and unchanged; `async_keep("nope") is False`.
  - `test_expiry_after_delete_is_harmless`: add temp, `async_delete`, fire at +601 s → no exception, the list is empty.
  - `test_retention_ignores_temporaries`: `retention=2`. Add temp T, then saved A, B, C → list `[C, B]`, T still gettable. Keeping T (now 3 saved) prunes B, leaving `[T, C]`.
  - `test_load_purges_leftover_temporaries`: store 1 adds temp T and saved S. Store 2 (a new `BroadcastStore` on the same hass, `async_load()`) → `async_get(T) is None`, T's file is deleted, S is still there.
  - `test_remove_all_cancels_timers`: add temp, `async_remove_all()`, fire at +601 s → no error.
  - In `tests/test_init.py`, `test_unload_cancels_expiry_timers`: set up the entry, add a temp through `entry.runtime_data.store`, unload the entry, fire at +601 s, `async_block_till_done` → no error, and the file is still on disk (the next load purges it, not a stray timer).

- [ ] **Step 2: Run them to see them fail**

  Run: `.venv/bin/python -m pytest -q tests/test_storage.py tests/test_init.py`
  Expected: the new tests FAIL (unexpected keyword `temporary` / no attribute `async_keep`).

- [ ] **Step 3: Implement**
  - Timers: `self._expiry: dict[str, CALLBACK_TYPE]`, scheduled with `homeassistant.helpers.event.async_call_later(hass, TEMPORARY_TTL, ...)`. The callback runs `hass.async_create_task(self._async_expire(message_id))`.
  - `_async_expire` deletes the entry only if it is still present and still temporary.
  - `async_delete` and `async_keep` cancel the entry's timer.
  - `_async_prune` counts and drops only non-temporary entries, oldest first.
  - `async_load` unlinks files for, and drops, entries with `temporary`, then saves if any were dropped.
  - `async_remove_all` calls `async_shutdown()` first.
  - `async_unload_entry` calls `entry.runtime_data.store.async_shutdown()` before returning `True`.

- [ ] **Step 4: Run the tests to see them pass, plus lint and types**

  Run: `.venv/bin/python -m pytest -q && .venv/bin/ruff check . && .venv/bin/ruff format --check . && .venv/bin/mypy`
  Expected: all pass, no errors.

- [ ] **Step 5: Commit** — `feat: temporary recordings in the store`

### Task 2: Upload field, `hass_broadcast/save`, send extends the deadline

**Files:**
- Modify: `custom_components/hass_broadcast/http.py` (`BroadcastUploadView.post`)
- Modify: `custom_components/hass_broadcast/websocket.py`
- Test: `tests/test_http_upload.py`, `tests/test_websocket.py`, `tests/test_media_source.py`

**Interfaces:**
- Consumes: Task 1's `async_add(..., temporary=)`, `async_touch`, `async_keep`.
- Produces:
  - Upload form field `temporary`. The values `"1"` or `"true"` (case-insensitive) store the recording as temporary. Absent, or anything else, stores it saved.
  - Websocket `{type: "hass_broadcast/save", message_id: str}` → result `{saved: true}`. Errors: `not_setup`, `not_found`, `not_authorized`. Authorization: `connection.user.is_admin or connection.user.id == message["user_id"]`, as delete does.
  - `ws_send` calls `await store.async_touch(message_id)` after the lookup and before `async_broadcast`.

- [ ] **Step 1: Write the failing tests**
  - `test_http_upload.py::test_upload_can_be_temporary`: post with `"temporary": "1"` → `store.async_get(id)["temporary"] is True` and `await store.async_list() == []`.
  - `test_http_upload.py::test_upload_without_the_field_is_saved`: post without the field → the id is in `async_list()` (old bundles).
  - `test_websocket.py::test_save_keeps_a_temporary_recording`: temp added with `user_id=admin_user` → save → `success`, `result == {"saved": True}`, and the id is in `async_list()`.
  - `test_websocket.py::test_save_unknown_is_not_found`: → `error.code == "not_found"`.
  - `test_websocket.py::test_non_owner_cannot_save`: temp with `user_id="some_other_user_id"` and a client from `hass_read_only_access_token` → `not_authorized`, still temporary (Review Focus 5).
  - `test_websocket.py::test_send_extends_a_temporary_deadline`: patch `custom_components.hass_broadcast.websocket.async_broadcast` to return `[]`. Add temp, fire at +500 s, send, fire at +900 s → still present.
  - `test_media_source.py::test_temporary_resolves_but_is_not_browsed`: a temp resolves to `/api/hass_broadcast/media/<id>.<ext>`, and browse `children == []`.

- [ ] **Step 2: Run them to see them fail**

  Run: `.venv/bin/python -m pytest -q tests/test_http_upload.py tests/test_websocket.py tests/test_media_source.py`
  Expected: the new tests FAIL. The media source test may already pass, since resolve and browse need no change. Keep it as a guard.

- [ ] **Step 3: Implement** `ws_save` beside `ws_delete`, with a docstring that says why it isn't a service (as `ws_send`'s does). Register it in `async_register_websocket_commands`. In the upload view, read `temporary` the way `duration` is read, ignoring a file part.

- [ ] **Step 4: Run the whole suite, lint and types**

  Run: `.venv/bin/python -m pytest -q && .venv/bin/ruff check . && .venv/bin/ruff format --check . && .venv/bin/mypy`
  Expected: all pass.

- [ ] **Step 5: Commit** — `feat: temporary uploads and the save command`

### Task 3: `keep_messages` config and editor field

**Files:**
- Modify: `frontend/src/config.ts`, `frontend/src/forms.ts`, `frontend/src/card.ts` (`getStubConfig`), `frontend/src/tile.ts` (`getStubConfig`)
- Modify: `README.md` (both options tables, next to `noise_suppression`), `CLAUDE.md` (the "Card configuration keys" paragraph: add `keep_messages` to both lists)
- Test: `frontend/test/config.test.ts`, `frontend/test/forms.test.ts`, `frontend/test/card.test.ts`, `frontend/test/tile.test.ts`

**Interfaces:**
- Produces: `CardConfig.keep_messages?: boolean`, `TileConfig.keep_messages?: boolean`, `ResolvedConfig.keepMessages: boolean`, `ResolvedTileConfig.keepMessages: boolean`. Both resolve as `config.keep_messages !== false`.

- [ ] **Step 1: Write the failing tests**
  - config: for both resolvers, `{}` → `keepMessages === true`, `{keep_messages: true}` → true, `{keep_messages: false}` → false.
  - forms: add `"keep_messages"` to `CARD_KEYS` and `TILE_KEYS`. New test, run for both forms: the `keep_messages` field has `default: true`, `selector: { boolean: {} }`, no `required`, `computeLabel` → `"Keep sent messages"` and `computeHelper` → `"Adds every message you send to Recent messages."`.
  - stubs: `HassBroadcastCard.getStubConfig(undefined).keep_messages === true`, and the same for `HassBroadcastTile`.

- [ ] **Step 2: Run them to see them fail**

  Run: `npx vitest run --project unit frontend/test/config.test.ts frontend/test/forms.test.ts frontend/test/card.test.ts frontend/test/tile.test.ts`
  Expected: the new assertions FAIL.

- [ ] **Step 3: Implement.** In `forms.ts`, add one shared `keepMessagesField = { name: "keep_messages", default: true, selector: { boolean: {} } }` with a comment. The comment says it is the only boolean that is on when absent, and that `ha-form` passes a non-required field's `default` as the selector's placeholder, which `ha-selector-boolean` renders as checked, from 2024.12 on. Place the field after `noiseSuppressionField` in both Recording sections, and add the label and helper to `LABELS` / `HELPERS`. README rows: default `true`, "Adds every message to Recent messages. Off: messages are deleted after they play; the card's Save button keeps one." The tile row is "As for the card", except the tile has no Save button.

- [ ] **Step 4: Run the tests, tsc and the build**

  Run: `npx tsc --noEmit && npm test && npm run build`
  Expected: all pass. The bundle is rebuilt.

- [ ] **Step 5: Commit** (with the bundle) — `feat: keep_messages option on the card and tile`

### Task 4: Temporary uploads from the card and tile

**Files:**
- Modify: `frontend/src/api.ts`, `frontend/src/clip.ts`, `frontend/src/sending.ts`, `frontend/src/tile.ts`, `frontend/src/card.ts` (`broadcast` only)
- Test: `frontend/test/api.test.ts`, `frontend/test/sending.test.ts`, `frontend/test/tile.test.ts`, `frontend/test/card.test.ts`

**Interfaces:**
- Consumes: Task 2's upload field and `hass_broadcast/save`; Task 3's `keepMessages`.
- Produces:
  - `uploadRecording(hass, blob, duration, temporary = false): Promise<string>`: appends `temporary=1` only when true.
  - `saveRecording(hass, id: string): Promise<void>`: sends `{type: "hass_broadcast/save", message_id: id}` and rejects with the websocket error object, as `deleteMessage` does.
  - `ClipSource` gains `| { kind: "temporary"; id: string; blob: Blob }`.
  - `storedId(clip)` keeps returning the id for `stored` only. New `uploadedId(clip): string | undefined` returns the id for `stored` or `temporary`.
  - `SendOptions` gains `keep: boolean`. `onStored` becomes `onStored?: (source: ClipSource) => void`. `sendClip` uploads a fresh clip with `temporary = !keep` and reports `{kind: keep ? "stored" : "temporary", id, ...}`. A `temporary` clip sends by id, and on a `not_found` rejection it re-uploads its blob as temporary, reports the new source, and sends again once.

- [ ] **Step 1: Write the failing tests**
  - api: `uploadRecording(hass, blob, 1, true)` → `body.get("temporary") === "1"`. Without the flag → `body.get("temporary") === null`. `saveRecording` → `sendMessagePromise` called with `{type: "hass_broadcast/save", message_id: "abc"}`.
  - sending:
    - `keep: false` on a fresh clip → the upload body has `temporary`, and `onStored` gets `{kind: "temporary", id: "abc", blob}`;
    - `keep: true` → no field, `{kind: "stored", id: "abc"}`;
    - a temporary clip whose first send throws `{code: "not_found"}` → one upload, `onStored` with the new id, a second send with the new id, and outcome `sent`;
    - a *stored* clip throwing `not_found` → rejects (unchanged).
  - tile: with `keep_messages: false` the upload carries `temporary=1`; with the key absent it doesn't.
  - card: `card.setConfig({..., keep_messages: false})`, then `broadcast()` → `card.clip.source.kind === "temporary"`, and a second broadcast does no upload. A temporary clip whose send throws `not_found` keeps the clip, does not show "That recording was deleted.", and its source holds the new id (Review Focus 4).
  - Update the existing "uploads a fresh clip once" expectation: a card with no key → `{kind: "stored", id: "abc"}`, unchanged.

- [ ] **Step 2: Run them to see them fail**

  Run: `npx vitest run --project unit frontend/test/api.test.ts frontend/test/sending.test.ts frontend/test/tile.test.ts frontend/test/card.test.ts`
  Expected: the new tests FAIL.

- [ ] **Step 3: Implement.**
  - `card.broadcast` passes `keep: this.resolved.keepMessages`, and its `onStored` swaps in the reported source, keeping the existing `this.clip === clip` guard.
  - The card's `not_found` branch ("That recording was deleted.") stays keyed on `storedId(clip) !== undefined`, so temporaries never reach it.
  - The tile passes `keep: this.resolved.keepMessages`.
  - `historyProps().loadedId` keeps using `storedId`.

- [ ] **Step 4: Run the tests, tsc and the build**

  Run: `npx tsc --noEmit && npm test && npm run build`
  Expected: all pass.

- [ ] **Step 5: Commit** (with the bundle) — `feat: send temporary recordings when keep_messages is off`

### Task 5: The Save button

**Files:**
- Modify: `frontend/src/card.ts`, `frontend/src/layouts/parts.ts`, `frontend/src/layouts/full.ts`, `frontend/src/layouts/compact.ts`, `frontend/src/ui/icons.ts`, `frontend/src/styles.ts`
- Test: `frontend/test/card.test.ts`, `frontend/test/card.browser.test.ts`

**Interfaces:**
- Consumes: Task 4's `ClipSource`, `uploadRecording`, `saveRecording`; Task 3's `keepMessages`.
- Produces:
  - `CardParts.save: (variant: "pill" | "icon") => TemplateResult | typeof nothing`. It returns `nothing` when `keepMessages` is on or no clip is loaded.
  - `bookmarkIcon` and `bookmarkOutlineIcon` in `icons.ts`, using MDI paths:
    - `bookmark`: `M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z`
    - `bookmark-outline`: `M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15-5-2.18L7 18V5h10v13z`
  - Private `card.saveClip(): Promise<void>` and `@state() saving = false`.

- [ ] **Step 1: Write the failing unit tests** in `card.test.ts`, in a new `describe("card saving")`. Build a card the way `cardWithClip` does, with `keep_messages: false`.
  - `renderedText()` with a fresh clip includes "Save"; with `keep_messages` absent it includes neither "Save" nor "Saved".
  - Fresh clip → `saveClip()` → exactly one upload without `temporary`, `clip.source` is `{kind: "stored", id: "abc"}`, and the render shows "Saved".
  - Temporary clip → `saveClip()` → `hass_broadcast/save` was sent with its id, no upload, and the source is now `stored` with the same id.
  - Temporary clip and the save throws `{code: "not_found"}` → one upload without `temporary`, and the source is `stored` with the new id.
  - Save throws another error → `status.kind === "error"` and the text starts with "Could not save:". The clip is unchanged.
  - Clip cleared during an in-flight save (the save resolves after `clearClip()`) → `card.clip` stays undefined (Review Focus 2).
  - A second `saveClip()` while `saving` is true does nothing; while `rec.phase === "sending"` the button is disabled (Review Focus 1).
  - A stored clip loaded from history with `keep_messages: false` renders "Saved", and clicking it does nothing.
  - With a status showing (right after `broadcast()`), the render still includes "Save" (status layer).

- [ ] **Step 2: Write the failing browser test** in `card.browser.test.ts`. With `keep_messages: false` and a clip loaded, the Save button's bounding box is identical in the `review` and `status` views, for both `layout: full` and `layout: compact`.

- [ ] **Step 3: Run them to see them fail**

  Run: `npm test`
  Expected: the new tests FAIL.

- [ ] **Step 4: Implement**
  - `saveClip`, by source kind:
    - fresh → `uploadRecording(hass, blob, duration, false)`;
    - temporary → `saveRecording`, falling back to an upload on `not_found`;
    - stored → nothing.

    Then swap the source to `stored` only if `this.clip === clip`, run `refreshHistory()`, and send errors to `fail("Could not save: …")`.
  - The button:
    - pill (full) shows icon + "Save" / "Saved"; icon (compact) shows the icon only, same box in both states;
    - accessible labels "Save to history" / "Saved to history";
    - "Saved" uses `aria-disabled="true"` and its click is a no-op;
    - disabled while `saving` or `rec.phase === "sending"`.
  - Layouts:
    - full: the strip's `review` layer appends `${parts.save("pill")}` after the clip length, and the `status` layer becomes `${statusText(parts.status)}${parts.save("pill")}`;
    - compact: the same in `compact-status`, with `"icon"`, after Discard.
  - In `styles.ts`, the status text takes `flex: 1; min-width: 0` so the button sits at the same right edge in both layers.

- [ ] **Step 5: Run everything, including layout**

  Run: `npx tsc --noEmit && npm test && npm run build && npm run check:layout`
  Expected: all pass. `check:layout` reports no moved slot.

- [ ] **Step 6: Look at it** in `npm run dev` with `keep_messages: false` (full and compact, light and dark): record, send, save, and an error. Fix anything that looks off, then re-run Step 5.

- [ ] **Step 7: Commit** (with the bundle) — `feat: save the loaded message from the card`

### Task 6: Floor check and final verification

**Files:** none are expected to change. Fix forward only if the floor run fails.

- [ ] **Step 1: Run the integration suite against the 2024.12 floor.** Use a Python 3.12 venv with `pytest-homeassistant-custom-component==0.13.190`, `home-assistant-frontend==20241127.4` and `josepy<2`, as CLAUDE.md describes:

  Run: `<floor-venv>/bin/python -m pytest -q`
  Expected: all pass.

- [ ] **Step 2: Run the full local CI equivalent**

  Run: `.venv/bin/python -m pytest -q && .venv/bin/ruff check . && .venv/bin/ruff format --check . && .venv/bin/mypy && npx tsc --noEmit && npm test && npm run build && git diff --exit-code custom_components/hass_broadcast/www/ && npm run check:layout`
  Expected: all pass, and the bundle has no diff.

- [ ] **Step 3: Update the test counts** in CLAUDE.md's Commands block (`# integration tests (N)`, `# card tests ... (N)`) to the numbers just printed. Commit as `docs: update test counts`.

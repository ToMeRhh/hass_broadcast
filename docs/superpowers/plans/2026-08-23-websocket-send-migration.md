# Websocket Send Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the public `hass_broadcast.send` Home Assistant service with a
private `hass_broadcast/send` websocket command, so installing this integration
adds a Lovelace card and no user-visible API.

**Architecture:** `websocket.py` already owns the card's RPC surface (`list`,
`delete`); `send` joins it there. `playback.py` sheds its service plumbing and
store access, exposing one function — `async_broadcast()` — that plays an
already-loaded message on a list of targets and reports which ones failed. The
websocket handler does the store lookup and error reporting, mirroring the
existing `ws_delete` shape exactly.

**Tech Stack:** Python 3.12 / Home Assistant 2025.1.4 (`pytest-homeassistant-custom-component` 0.13.205), TypeScript + Lit, vitest, esbuild.

**Spec:** No separate spec document. The design was settled in conversation and
is restated in full under *Background* below — this plan is self-contained.

---

## Background: why this change

A Home Assistant service is **published the moment it is registered**. There is
no visibility flag: `hass.services.async_register` puts the service in Developer
Tools → Actions, in the automation editor's action picker, and in
`/api/services`, and `services.yaml` is a UI contract, not documentation.

Broadcasting is card RPC. Its required `message_id` field is an opaque storage
id that no automation author can obtain without reading `.storage` by hand, so
the automation surface is advertised in the UI and unusable in practice — the
signature of accidental exposure rather than a designed API.

The integration already has the right channel for this: `hass_broadcast/list`
and `hass_broadcast/delete` are websocket commands precisely because they are
card RPC. `send` was the odd one out. The original design document
(`docs/superpowers/specs/2026-08-21-hass-broadcast-design.md:51`) never settled
it, recording the option as "WS `hass_broadcast/send` (or service call)".

**Behaviour does not change.** In particular `_async_restore_tail` runs via
`hass.async_create_task`, so it already outlives the service call and equally
outlives the websocket message. No timing, mode, or restore semantics move.

## Global Constraints

- **`.venv` lives in the main checkout, not this worktree.** Run tests with
  `.venv/bin/python -m pytest -q`. A bare `python` or a
  worktree-relative `.venv/bin/python` will not work.
- **Baseline is green at 58 Python tests and 147 card tests.** Any task that
  ends with a different total must account for the difference explicitly.
- **Do not touch the toolchain.** Python 3.12, HA 2025.1.4 and
  `pytest-homeassistant-custom-component==0.13.205` stay pinned. (2025.1.4 is
  the last HA release that runs on Python 3.12 — HA 2025.2.0 requires ≥3.13.0 —
  so this is an interpreter constraint, not a preference. Out of scope here.)
- **Do not touch `media_source.py`.** The media source stays registered and
  browsable. Deliberate decision; not part of this work.
- **Do not change `manifest.json`'s `"integration_type": "service"`.**
  Investigated: HA's `service` means "provides a single service" in the
  DuckDNS/Speedtest sense and is unrelated to `hass.services`. Per
  `loader.py:415-450`, only the value `helper` changes any behaviour, and its
  effect is to move the integration to the Helpers tab. Leave it alone.
- **Do not bump `manifest.json`'s `version` by hand.** The Release workflow owns
  it.
- **Whenever anything under `frontend/src/` changes, run `npm run build` and
  commit the regenerated
  `custom_components/hass_broadcast/www/hass-broadcast-card.js` in the same
  commit.** CI rebuilds and fails on a mismatch.
- **No deprecation shim and no breaking-change ceremony.** `v0.2.0` is the only
  release and the project is unpublished, so the service is removed outright.
- Commit subjects follow Conventional Commits (`feat:`, `fix:`, `refactor:`,
  `docs:`, `test:`, `chore:`).

---

### Task 1: Add the `hass_broadcast/send` websocket command

Extract the playback mechanics behind a plain function and expose them over the
websocket. **The service stays registered in this task** — the card still calls
it, and removing both halves at once would leave no working commit between here
and Task 3. `test_playback.py` converts to drive the websocket command, which
leaves the service registered but untested; Task 3 deletes it.

**Files:**
- Modify: `custom_components/hass_broadcast/playback.py` (replace
  `_async_handle_send` with `async_broadcast`; keep `async_register_services`)
- Modify: `custom_components/hass_broadcast/websocket.py` (add `ws_send`)
- Test: `tests/test_playback.py` (convert all 12 tests)

**Interfaces:**
- Consumes: `async_get_store(hass)` from `.storage`; `MODE_PLAIN`, `MODE_CHIME`,
  `MODE_RESTORE`, `MODES`, `CHIME_URL`, `DOMAIN` from `.const`.
- Produces:
  - `playback.async_broadcast(hass: HomeAssistant, message: dict[str, Any], targets: list[str], mode: str) -> list[str]`
    — plays `message` on every target, returns the entity ids that failed.
  - Websocket command `hass_broadcast/send` with fields `message_id` (str,
    required), `targets` (list of entity ids, required), `mode` (one of `MODES`,
    default `plain`). Result: `{"failed": [entity_id, ...]}`. Errors:
    `not_setup`, `not_found`.

- [ ] **Step 1: Convert `test_playback.py` to drive the websocket command**

Replace the module docstring and add a send helper just below the `play_calls`
fixture:

```python
"""Tests for broadcasting a recording to media players."""
```

```python
async def _send(
    client,
    message_id: str,
    targets: list[str],
    mode: str | None = None,
    msg_id: int = 1,
) -> dict:
    """Issue hass_broadcast/send and return the reply message."""
    payload = {
        "id": msg_id,
        "type": "hass_broadcast/send",
        "message_id": message_id,
        "targets": targets,
    }
    if mode is not None:
        payload["mode"] = mode
    await client.send_json(payload)
    return await client.receive_json()
```

Now rewrite each of the 12 tests. Add `hass_ws_client` to the signature, create
the client after `setup_entry` has run, and replace the
`hass.services.async_call(DOMAIN, "send", {...}, blocking=True)` block. The
mechanical mapping is:

| Before | After |
|---|---|
| `await hass.services.async_call(DOMAIN, "send", {...}, blocking=True)` | `client = await hass_ws_client(hass)` then `await _send(client, message_id, [...])` |
| `..., blocking=True, return_response=True)` → `response` | `msg = await _send(...)` then `msg["result"]` |
| `assert response == {"failed": [...]}` | `assert msg["result"] == {"failed": [...]}` |
| `with pytest.raises(HomeAssistantError):` | `assert msg["success"] is False` |

Worked example — `test_send_fans_out_to_every_target` becomes:

```python
async def test_send_fans_out_to_every_target(
    hass: HomeAssistant, setup_entry, play_calls, hass_ws_client
) -> None:
    """Each target receives a play_media call with the media source id."""
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    client = await hass_ws_client(hass)
    msg = await _send(
        client, message_id, ["media_player.kitchen", "media_player.office"]
    )

    assert msg["success"] is True
    assert len(play_calls) == 2
    targets = {call.data["entity_id"] for call in play_calls}
    assert targets == {"media_player.kitchen", "media_player.office"}
    # Targets are dispatched concurrently, so don't assume arrival order.
    content_ids = {call.data["media_content_id"] for call in play_calls}
    assert content_ids == {f"media-source://{DOMAIN}/{message_id}"}
    content_types = {call.data["media_content_type"] for call in play_calls}
    assert content_types == {"music"}
```

Worked example — `test_send_rejects_unknown_message` becomes, in full (the
`HomeAssistantError` import goes away with it):

```python
async def test_send_rejects_unknown_message(
    hass: HomeAssistant, setup_entry, play_calls, hass_ws_client
) -> None:
    """An unknown message id is reported as an error and plays nothing."""
    client = await hass_ws_client(hass)
    msg = await _send(client, "nope", ["media_player.kitchen"])

    assert msg["success"] is False
    assert msg["error"]["code"] == "not_found"
    assert len(play_calls) == 0
```

Worked example — a response-asserting test,
`test_send_reports_which_targets_failed`, becomes:

```python
async def test_send_reports_which_targets_failed(
    hass: HomeAssistant, setup_entry, hass_ws_client
) -> None:
    """The reply names the targets that could not play.

    Without this the card cannot tell "played everywhere" from "played
    nowhere" -- three unreachable speakers would look like a success.
    """
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    async def handler(call) -> None:
        if call.data["entity_id"] == "media_player.broken":
            raise TimeoutError("device did not respond")

    hass.services.async_register("media_player", "play_media", handler)

    client = await hass_ws_client(hass)
    msg = await _send(
        client, message_id, ["media_player.broken", "media_player.kitchen"]
    )

    assert msg["result"] == {"failed": ["media_player.broken"]}
```

Worked example — a mode-passing test, `test_chime_mode_plays_chime_first`, keeps
its `monkeypatch` line and becomes:

```python
    client = await hass_ws_client(hass)
    msg = await _send(client, message_id, ["media_player.kitchen"], mode="chime")

    assert msg["success"] is True
    assert len(play_calls) == 2
    assert play_calls[0].data["media_content_id"].endswith("chime.wav")
    assert play_calls[1].data["media_content_id"] == (
        f"media-source://{DOMAIN}/{message_id}"
    )
```

Apply the same treatment to the remaining tests, leaving every assertion body
and docstring otherwise untouched:
`test_one_failing_target_does_not_stop_the_others`,
`test_one_failing_target_survives_non_home_assistant_error`,
`test_send_reports_no_failures_when_every_target_plays`,
`test_restore_mode_returns_before_the_restore_tail`,
`test_restore_tail_puts_the_volume_back`,
`test_restore_tail_failure_is_logged_not_raised`,
`test_restore_uses_native_announce_when_the_target_supports_it`,
`test_restore_falls_back_when_the_target_lacks_announce`.

Three carry-over notes:
- Several restore tests call `await hass.async_block_till_done()` immediately
  after the service call, to let the detached tail run. Keep that line, directly
  after the `_send(...)` that replaces the service call — the tail is still a
  detached task and still needs draining.
- `test_restore_tail_failure_is_logged_not_raised` asserts on the response;
  change `response == {"failed": []}` to `msg["result"] == {"failed": []}` and
  keep its trailing comment about why the target is not reported as failed.
- `test_restore_mode_returns_before_the_restore_tail` still finds and cancels
  the detached tail task by name. Leave that block exactly as it is — awaiting
  the websocket reply is the same synchronisation point `blocking=True` was.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `.venv/bin/python -m pytest tests/test_playback.py -q`
Expected: FAIL — every test errors with `unknown_command` for
`hass_broadcast/send`, because the command is not registered yet.

- [ ] **Step 3: Replace the service handler in `playback.py` with `async_broadcast`**

Replace the body of `_async_handle_send` — which currently does the store
lookup, the fan-out and the response shaping in one function — by lifting the
fan-out into a new module-level `async_broadcast`. Add it directly above
`_async_handle_send`:

```python
async def async_broadcast(
    hass: HomeAssistant,
    message: dict[str, Any],
    targets: list[str],
    mode: str,
) -> list[str]:
    """Play `message` on every target; return the ids that could not play.

    Takes an already-loaded message rather than an id: the caller looked it
    up to answer "does this recording exist?", and re-reading the store here
    would duplicate that lookup and its failure mode. Keeps this module free
    of storage concerns.

    An empty return means every target played. The per-target result is what
    lets the card surface partial failures instead of reporting success for a
    broadcast nobody heard.
    """
    content_id = f"media-source://{DOMAIN}/{message['id']}"
    duration = float(message.get("duration") or 0)

    # Dispatched concurrently: sequential dispatch means each target's own
    # mode-driven delay (the chime gap) stacks on top of every earlier
    # target's, turning a broadcast into a slow relay. Each coroutine keeps
    # its own try/except (above) so one target's failure cannot cancel or
    # otherwise affect the others. Restore's post-playback wait is not in
    # this gather at all -- it runs as a detached task per target.
    results = await asyncio.gather(
        *(
            _async_send_to_target_isolated(hass, entity_id, content_id, mode, duration)
            for entity_id in targets
        )
    )
    return [entity_id for entity_id in results if entity_id is not None]
```

Leave `async_register_services` and `SEND_SCHEMA` exactly as they are — the
service must keep working until Task 2 moves the card off it. Reduce
`_async_handle_send` to a thin adapter over the new function:

```python
async def _async_handle_send(call: ServiceCall) -> ServiceResponse:
    """Handle hass_broadcast.send. Deleted in Task 3."""
    hass = call.hass
    store = async_get_store(hass)
    if store is None:
        raise HomeAssistantError("Voice Broadcast is not set up")
    message = await store.async_get(call.data["message_id"])
    if message is None:
        raise HomeAssistantError(f"Unknown recording {call.data['message_id']}")
    failed = await async_broadcast(
        hass, message, call.data["targets"], call.data["mode"]
    )
    return {"failed": failed}
```

- [ ] **Step 4: Register the `hass_broadcast/send` command in `websocket.py`**

Add these imports at the top of `websocket.py`, alongside the existing ones:

```python
import homeassistant.helpers.config_validation as cv

from .const import MODE_PLAIN, MODES
from .playback import async_broadcast
```

Add the handler after `ws_delete`:

```python
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hass_broadcast/send",
        vol.Required("message_id"): str,
        vol.Required("targets"): [cv.entity_id],
        vol.Optional("mode", default=MODE_PLAIN): vol.In(MODES),
    }
)
@websocket_api.async_response
async def ws_send(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Broadcast a recording to media players.

    Deliberately NOT a Home Assistant service. Registering one publishes it to
    Developer Tools and the automation editor -- there is no private service --
    and `message_id` is an opaque storage id no automation author can obtain.
    This is card RPC, so it belongs on the websocket beside list and delete.

    Returns once playback has been dispatched, not when it ends: restore mode's
    volume tail runs as a detached task and deliberately outlives this reply.
    """
    store = async_get_store(hass)
    if store is None:
        connection.send_error(msg["id"], "not_setup", "Voice Broadcast is not set up")
        return

    message = await store.async_get(msg["message_id"])
    if message is None:
        connection.send_error(
            msg["id"], "not_found", f"Unknown recording {msg['message_id']}"
        )
        return

    failed = await async_broadcast(hass, message, msg["targets"], msg["mode"])
    connection.send_result(msg["id"], {"failed": failed})
```

Register it in `async_register_websocket_commands`:

```python
    websocket_api.async_register_command(hass, ws_send)
```

- [ ] **Step 5: Run the full Python suite to verify it passes**

Run: `.venv/bin/python -m pytest -q`
Expected: PASS — 58 passed. The count is unchanged; tests were converted, not
added.

- [ ] **Step 6: Commit**

```bash
git add custom_components/hass_broadcast/playback.py custom_components/hass_broadcast/websocket.py tests/test_playback.py
git commit -m "feat: serve broadcasts over a websocket command"
```

---

### Task 2: Point the card at the websocket command

The card, its tests, and the dev harness all move off `hass.callService`. Done
before the service is removed so no commit leaves the card calling something
that does not exist.

**Files:**
- Modify: `frontend/src/api.ts:63-82`
- Modify: `frontend/test/api.test.ts` (3 send tests)
- Modify: `frontend/test/card.test.ts` (2 `callService` stubs, 8 `cardWithClip`
  call sites, 3 positional-arg assertions)
- Modify: `frontend/dev/mock-hass.ts` (header comment, `backend.send`, routing)
- Modify: `custom_components/hass_broadcast/www/hass-broadcast-card.js` (rebuilt)

**Interfaces:**
- Consumes: websocket command `hass_broadcast/send` from Task 1, returning
  `{"failed": string[]}`.
- Produces: `sendBroadcast(hass, id, targets, mode): Promise<BroadcastResult>`,
  unchanged signature and return type; only its transport changes.

- [ ] **Step 1: Update the three send tests in `api.test.ts`**

Replace the test named `"sends a broadcast through the service, asking for the
response"` with:

```typescript
  it("sends a broadcast over the websocket", async () => {
    const hass = fakeHass();
    hass.connection.sendMessagePromise.mockResolvedValue({ failed: [] });

    await sendBroadcast(hass, "abc", ["media_player.kitchen"], "plain");

    expect(hass.connection.sendMessagePromise).toHaveBeenCalledWith({
      type: "hass_broadcast/send",
      message_id: "abc",
      targets: ["media_player.kitchen"],
      mode: "plain",
    });
  });
```

Replace `"returns the targets the service reported as failed"` with:

```typescript
  it("returns the targets the backend reported as failed", async () => {
    const hass = fakeHass();
    hass.connection.sendMessagePromise.mockResolvedValue({
      failed: ["media_player.broken"],
    });

    const result = await sendBroadcast(
      hass,
      "abc",
      ["media_player.kitchen", "media_player.broken"],
      "plain",
    );

    expect(result.failed).toEqual(["media_player.broken"]);
  });
```

**Delete** the test named `"reports no failures when the service response is
missing"` outright. It existed only to defend against a Home Assistant frontend
that ignores `returnResponse`, and `sendMessagePromise` has no such failure
mode — a websocket command either resolves with the result or rejects. Keeping
it would mean keeping dead defensive code to satisfy it.

Finally, remove the now-unused `callService` line from `fakeHass()`:

```typescript
function fakeHass() {
  return {
    connection: { sendMessagePromise: vi.fn().mockResolvedValue({ messages: [] }) },
    auth: { data: { access_token: "tok" } },
  } as any;
}
```

- [ ] **Step 2: Run the api tests to verify they fail**

Run: `npx vitest run frontend/test/api.test.ts`
Expected: FAIL — `sendBroadcast` still calls `hass.callService`, which no longer
exists on `fakeHass()`, so both send tests throw.

- [ ] **Step 3: Rewrite `sendBroadcast` in `api.ts`**

Replace the whole function (and drop its two stale comments):

```typescript
export async function sendBroadcast(
  hass: any,
  id: string,
  targets: string[],
  mode: BroadcastMode,
): Promise<BroadcastResult> {
  const result = await hass.connection.sendMessagePromise({
    type: "hass_broadcast/send",
    message_id: id,
    targets,
    mode,
  });
  return { failed: result.failed };
}
```

Leave the `BroadcastResult` interface and its doc comment above it unchanged.

- [ ] **Step 4: Run the api tests to verify they pass**

Run: `npx vitest run frontend/test/api.test.ts`
Expected: PASS.

- [ ] **Step 5: Update the two `callService` stubs in `card.test.ts`**

In `cardWithClip` (around line 217), replace the `callService` property:

```typescript
    card.hass = {
      auth: { data: { access_token: "tok" } },
      states: {
        "media_player.broken": { attributes: { friendly_name: "Garage" } },
      },
      connection: {
        sendMessagePromise: async (message: any) => {
          calls.push(message);
          return response;
        },
      },
    };
```

In the test `"does not broadcast to a preselected speaker that is now hidden"`
(around line 542), replace the assignment:

```typescript
    card.hass.connection = {
      sendMessagePromise: async (message: any) => {
        calls.push(message);
        return { failed: [] };
      },
    };
```

Now flatten the response shape at all 8 `cardWithClip` call sites — the
websocket resolves with the result directly, where `callService` wrapped it in
`{ response: ... }`:

| Before | After |
|---|---|
| `cardWithClip({ response: { failed: [] } })` | `cardWithClip({ failed: [] })` |
| `cardWithClip({ response: { failed: ["media_player.broken"] } })` | `cardWithClip({ failed: ["media_player.broken"] })` |
| `cardWithClip({ response: { failed: ["media_player.kitchen", "media_player.broken"] } })` | `cardWithClip({ failed: ["media_player.kitchen", "media_player.broken"] })` |

And update the three assertions that indexed into positional `callService`
arguments, since `calls` now holds message objects rather than argument arrays:

| Line | Before | After |
|---|---|---|
| ~256 | `expect(state.calls[1][2].message_id).toBe("abc")` | `expect(state.calls[1].message_id).toBe("abc")` |
| ~301 | `expect(state.calls[0][2].message_id).toBe("from-history")` | `expect(state.calls[0].message_id).toBe("from-history")` |
| ~559 | `expect(calls[0][2].targets).toEqual(["media_player.kitchen"])` | `expect(calls[0].targets).toEqual(["media_player.kitchen"])` |

- [ ] **Step 6: Run the full card suite to verify it passes**

Run: `npm test`
Expected: PASS — 146 passed. One fewer than the 147 baseline, because Step 1
deleted the obsolete missing-response test.

- [ ] **Step 7: Update the dev harness**

In `frontend/dev/mock-hass.ts`, change the header comment lines 6–7 to:

```typescript
 *   hass.connection.sendMessagePromise  — hass_broadcast/list, /delete and /send
 *   hass.auth.data.access_token         — the bearer token the upload sends
```

Change the doc comment on the `sendThrows` scenario flag (line 34) to read:

```typescript
/** hass_broadcast/send throws instead of answering. */
```

Change `backend.send` to return the flat shape:

```typescript
  async send(targets: string[]): Promise<{ failed: string[] }> {
    await this.delay();
    if (this.scenario.sendThrows) {
      throw new Error("Speaker is unreachable");
    }
    if (this.scenario.broadcast === "all-fail") {
      return { failed: [...targets] };
    }
    if (this.scenario.broadcast === "partial") {
      // Fail every other target, so the message names some but not all.
      return { failed: targets.filter((_, index) => index % 2 === 0) };
    }
    return { failed: [] };
  }
```

Route it in `sendMessagePromise`, and **delete the entire `callService`
property** — nothing calls it any more:

```typescript
    connection: {
      sendMessagePromise: async (message: any) => {
        if (message.type === "hass_broadcast/list") {
          return { messages: await backend.list() };
        }
        if (message.type === "hass_broadcast/delete") {
          return { deleted: await backend.remove(message.message_id) };
        }
        if (message.type === "hass_broadcast/send") {
          return backend.send(message.targets ?? []);
        }
        throw new Error(`mock hass: unhandled websocket message ${message.type}`);
      },
    },
  };
}
```

- [ ] **Step 8: Typecheck, rebuild the bundle, and verify both suites**

Run: `npx tsc --noEmit`
Expected: no output (clean).

Run: `npm run build`
Expected: writes `custom_components/hass_broadcast/www/hass-broadcast-card.js`.

Run: `npm test`
Expected: PASS — 146 passed.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/api.ts frontend/test/api.test.ts frontend/test/card.test.ts frontend/dev/mock-hass.ts custom_components/hass_broadcast/www/hass-broadcast-card.js
git commit -m "refactor(card): call the send websocket command instead of a service"
```

---

### Task 3: Remove the service

Nothing calls `hass_broadcast.send` any more. Delete it and lock the absence in
with a test.

**Files:**
- Modify: `custom_components/hass_broadcast/playback.py` (drop service plumbing)
- Modify: `custom_components/hass_broadcast/__init__.py:25,159`
- Delete: `custom_components/hass_broadcast/services.yaml`
- Test: `tests/test_playback.py` (add the guard test)

**Interfaces:**
- Consumes: `playback.async_broadcast` from Task 1.
- Produces: `playback.py` exporting no `async_register_services`. Any caller
  importing it will fail to import.

- [ ] **Step 1: Write the failing guard test**

Add to the end of `tests/test_playback.py`:

```python
async def test_no_broadcast_service_is_registered(
    hass: HomeAssistant, setup_entry
) -> None:
    """Broadcasting is card RPC, not a public service.

    Home Assistant publishes a service the moment it is registered -- to
    Developer Tools, to the automation editor's action picker, and to
    /api/services. There is no private service, so the only way to keep this
    integration's surface to "one Lovelace card" is not to register one.

    This asserts the absence directly, because the natural instinct when
    adding a backend capability is to reach for a service, and nothing else
    in the suite would notice.
    """
    assert not hass.services.has_service(DOMAIN, "send")
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `.venv/bin/python -m pytest tests/test_playback.py::test_no_broadcast_service_is_registered -q`
Expected: FAIL — the service is still registered by `async_setup_entry`.

- [ ] **Step 3: Strip the service plumbing from `playback.py`**

Delete `SERVICE_SEND`, `SEND_SCHEMA`, the `_async_handle_send` adapter added in
Task 1, and `async_register_services`.

Then prune the imports these leave behind. The file should import only what
remains in use:

```python
from __future__ import annotations

import asyncio
import logging
from typing import Any

from homeassistant.components.media_player import (
    ATTR_MEDIA_ANNOUNCE,
    ATTR_MEDIA_CONTENT_ID,
    ATTR_MEDIA_CONTENT_TYPE,
    DOMAIN as MEDIA_PLAYER_DOMAIN,
    SERVICE_PLAY_MEDIA,
    MediaPlayerEntityFeature,
    MediaType,
)
from homeassistant.const import ATTR_ENTITY_ID, ATTR_SUPPORTED_FEATURES
from homeassistant.core import HomeAssistant

from .const import CHIME_URL, DOMAIN, MODE_CHIME, MODE_RESTORE
```

Gone: `voluptuous as vol`, `ServiceCall`, `ServiceResponse`, `SupportsResponse`,
`HomeAssistantError`, `config_validation as cv`, `async_get_store`, and the
`MODE_PLAIN` / `MODES` names (now used by `websocket.py` instead). Update the
module docstring:

```python
"""Playing a recorded message on media players."""
```

- [ ] **Step 4: Drop the registration from `__init__.py`**

Remove the import at line 25:

```python
from .playback import async_register_services
```

and the call at line 159:

```python
    async_register_services(hass)
```

- [ ] **Step 5: Delete `services.yaml`**

```bash
git rm custom_components/hass_broadcast/services.yaml
```

`strings.json` and `translations/en.json` contain no `services` key, so neither
needs touching — confirm with
`grep -c services custom_components/hass_broadcast/strings.json` returning `0`.

- [ ] **Step 6: Run the full Python suite to verify it passes**

Run: `.venv/bin/python -m pytest -q`
Expected: PASS — 59 passed. One more than the 58 baseline: the guard test.

- [ ] **Step 7: Commit**

```bash
git add -A custom_components/hass_broadcast tests/test_playback.py
git commit -m "refactor: drop the public send service"
```

---

### Task 4: Update the documentation

The README currently teaches `hass_broadcast.send` as a feature. Remove that and
correct the two stale test counts in CLAUDE.md, which the recent UI-redesign
merge left behind.

**Files:**
- Modify: `README.md:74-102`, `README.md:154`
- Modify: `CLAUDE.md` (test counts; new section on the absent service API)

- [ ] **Step 1: Delete the automation section from the README**

Remove `README.md` lines 74–102 in full — the `### Using it from an automation`
heading, both YAML blocks, the paragraph between them, and the trailing blank
line — so that the `player_list` table row is followed directly by
`## Requirements and restrictions`.

- [ ] **Step 2: Add a closing line to the Usage section**

The absence of a service is worth one sentence, so nobody goes hunting for one.
After the numbered list in `## Usage` (which ends with "4. Press
**Broadcast**."), add:

```markdown
Broadcasting happens from the card. This integration deliberately registers no
Home Assistant service and creates no entities — installing it adds the card and
nothing else.
```

- [ ] **Step 3: Fix the stale automation reference at line 154**

In restriction 6, change:

```
   background task: the card (or your automation) is released as soon as playback has been
   dispatched and does not wait out the whole message.
```

to:

```
   background task: the card is released as soon as playback has been
   dispatched and does not wait out the whole message.
```

- [ ] **Step 4: Correct the test counts in CLAUDE.md**

In the `## Commands` block, the two counts predate the UI-redesign merge and are
now wrong even before this plan's changes. Set them to the post-Task-3 totals:

```bash
.venv/bin/python -m pytest -q   # integration tests (59)
npm test                        # card tests, vitest (146)
```

- [ ] **Step 5: Record the decision in CLAUDE.md**

Add this section immediately after the `## Card configuration keys` section, so
a future session does not helpfully re-add a service:

```markdown
## The integration registers no Home Assistant service

Broadcasting is reached over the `hass_broadcast/send` websocket command, beside
`/list` and `/delete` in `websocket.py`. It was a service, `hass_broadcast.send`,
and that was a mistake: `hass.services.async_register` has no visibility flag, so
registering one publishes it to Developer Tools, to the automation editor's
action picker and to `/api/services`. There is no such thing as a private
service.

That surface was also unusable in practice — the required `message_id` is an
opaque storage id no automation author can obtain without reading `.storage` by
hand — so it was advertised API that nobody could call.

Installing this integration should add a Lovelace card and nothing else.
`tests/test_playback.py::test_no_broadcast_service_is_registered` asserts the
absence, because the instinct when adding a backend capability is to reach for a
service and nothing else in the suite would notice.

The media source in `media_source.py` is the deliberate exception: it stays
registered and browsable, because `play_media` resolving `media-source://` ids is
what lets Home Assistant own URL signing across versions.
```

- [ ] **Step 6: Verify no stale references remain**

Run: `grep -rn "hass_broadcast.send\|services.yaml\|async_register_services" README.md CLAUDE.md custom_components/ frontend/src/ tests/`
Expected: no matches. (Matches under `docs/superpowers/` are historical records
of the original design and this plan — leave those alone.)

- [ ] **Step 7: Run both suites one final time**

Run: `.venv/bin/python -m pytest -q`
Expected: PASS — 59 passed.

Run: `npm test`
Expected: PASS — 146 passed.

Run: `npm run build && git diff --exit-code custom_components/hass_broadcast/www/hass-broadcast-card.js`
Expected: exit 0 — the committed bundle already matches a fresh build, which is
what CI checks.

- [ ] **Step 8: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: describe the card as the only interface"
```

---

## Done when

- `hass_broadcast.send` does not appear in Developer Tools → Actions on a live
  install, and `tests/test_playback.py::test_no_broadcast_service_is_registered`
  holds that.
- The card broadcasts exactly as before, including chime mode, restore mode,
  native announce, and partial-failure reporting.
- 59 Python tests and 146 card tests pass; the committed bundle matches a fresh
  `npm run build`.
- No file outside `docs/superpowers/` mentions `hass_broadcast.send`.

## Not in scope

Recorded so they are not re-litigated mid-execution:

- **The media source stays.** "Voice Broadcast" remains a browsable folder in
  the Media panel. Removing it would mean signing playback URLs by hand instead
  of letting `async_process_play_media_url` do it.
- **The toolchain stays.** Python 3.12 caps Home Assistant at 2025.1.4. Moving
  off it is a separate piece of work.
- **`manifest.json` is unchanged**, including `"integration_type": "service"`.
- **Per-target entity permissions are not enforced.** `_async_play` calls
  `media_player.play_media` without a user context, so target permissions are
  bypassed. This is pre-existing and unchanged by this migration — noted here
  so it reads as a carry-over rather than something introduced.
- **No card↔backend responsibility rebalance.** Investigated separately: the
  card's bulk is `getUserMedia`, `AudioWorklet`, WAV encoding, and Lit
  rendering, none of which can move server-side, and the two authority-sensitive
  values (duration, `can_delete`) are already server-derived.

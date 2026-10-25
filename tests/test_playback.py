"""Tests for broadcasting a recording to media players."""

import asyncio
from contextlib import suppress

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.setup import async_setup_component
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_mock_service,
)

from custom_components.hass_broadcast import playback
from custom_components.hass_broadcast.const import DOMAIN

# MediaPlayerEntityFeature.MEDIA_ANNOUNCE, spelled out so the test pins the
# wire value rather than restating whatever the import happens to resolve to.
ANNOUNCE_FEATURE = 1048576


@pytest.fixture
async def setup_entry(hass: HomeAssistant) -> MockConfigEntry:
    """Set up the integration."""
    assert await async_setup_component(hass, "media_source", {})
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


@pytest.fixture
def play_calls(hass: HomeAssistant):
    """Capture media_player.play_media calls."""
    return async_mock_service(hass, "media_player", "play_media")


async def _send(
    client,
    message_id: str,
    targets: list[str],
    mode: str | None = None,
    volume: float | None = None,
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
    if volume is not None:
        payload["volume"] = volume
    await client.send_json(payload)
    return await client.receive_json()


async def test_send_fans_out_to_every_target(
    hass: HomeAssistant, setup_entry, play_calls, hass_ws_client
) -> None:
    """Each target receives a play_media call with the media source id."""
    store = setup_entry.runtime_data.store
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


async def test_send_rejects_unknown_message(
    hass: HomeAssistant, setup_entry, play_calls, hass_ws_client
) -> None:
    """An unknown message id is reported as an error and plays nothing."""
    client = await hass_ws_client(hass)
    msg = await _send(client, "nope", ["media_player.kitchen"])

    assert msg["success"] is False
    assert msg["error"]["code"] == "not_found"
    assert len(play_calls) == 0


async def test_chime_mode_plays_chime_first(
    hass: HomeAssistant, setup_entry, play_calls, monkeypatch, hass_ws_client
) -> None:
    """Chime mode issues the chime before the message.

    The real gap is a wall-clock guess at Cast dispatch latency; patch it to
    zero rather than making every run of this test wait it out.
    """
    monkeypatch.setattr(playback, "CHIME_GAP_S", 0)

    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    client = await hass_ws_client(hass)
    msg = await _send(client, message_id, ["media_player.kitchen"], mode="chime")

    assert msg["success"] is True
    assert len(play_calls) == 2
    assert play_calls[0].data["media_content_id"] == f"media-source://{DOMAIN}/chime"
    assert play_calls[1].data["media_content_id"] == (
        f"media-source://{DOMAIN}/{message_id}"
    )


async def test_one_failing_target_does_not_stop_the_others(
    hass: HomeAssistant, setup_entry, caplog, hass_ws_client
) -> None:
    """A target that errors is logged; remaining targets still play."""
    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    played: list[str] = []

    async def handler(call) -> None:
        entity_id = call.data["entity_id"]
        if entity_id == "media_player.broken":
            raise HomeAssistantError("nope")
        played.append(entity_id)

    hass.services.async_register("media_player", "play_media", handler)

    client = await hass_ws_client(hass)
    msg = await _send(
        client, message_id, ["media_player.broken", "media_player.kitchen"]
    )

    assert msg["success"] is True
    assert played == ["media_player.kitchen"]
    assert "media_player.broken" in caplog.text


async def test_one_failing_target_survives_non_home_assistant_error(
    hass: HomeAssistant, setup_entry, caplog, hass_ws_client
) -> None:
    """A target raising a non-HomeAssistantError still isolates cleanly.

    With `blocking=True`, HA's service dispatch propagates whatever a
    target handler raises without wrapping it in `HomeAssistantError` --
    e.g. a slow/unreachable Cast device can raise `TimeoutError`. This
    reproduces that: catching only `HomeAssistantError` would let this
    abort the whole broadcast and leave later targets silent.
    """
    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    played: list[str] = []

    async def handler(call) -> None:
        entity_id = call.data["entity_id"]
        if entity_id == "media_player.broken":
            raise TimeoutError("device did not respond")
        played.append(entity_id)

    hass.services.async_register("media_player", "play_media", handler)

    client = await hass_ws_client(hass)
    msg = await _send(
        client, message_id, ["media_player.broken", "media_player.kitchen"]
    )

    assert msg["success"] is True
    assert played == ["media_player.kitchen"]
    assert "media_player.broken" in caplog.text


async def test_send_reports_which_targets_failed(
    hass: HomeAssistant, setup_entry, hass_ws_client
) -> None:
    """The reply names the targets that could not play.

    Without this the card cannot tell "played everywhere" from "played
    nowhere" -- three unreachable speakers would look like a success.
    """
    store = setup_entry.runtime_data.store
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


async def test_send_reports_no_failures_when_every_target_plays(
    hass: HomeAssistant, setup_entry, play_calls, hass_ws_client
) -> None:
    """A fully successful broadcast reports an empty failure list."""
    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    client = await hass_ws_client(hass)
    msg = await _send(
        client, message_id, ["media_player.kitchen", "media_player.office"]
    )

    assert msg["result"] == {"failed": []}
    assert len(play_calls) == 2


async def test_restore_mode_returns_before_the_restore_tail(
    hass: HomeAssistant, setup_entry, play_calls, hass_ws_client
) -> None:
    """The service returns once playback is dispatched, not when it ends.

    The restore tail waits out the whole message. Awaiting it inside the
    handler pinned the card at phase = "sending" for 61+ seconds on a
    one-minute recording, and a websocket reconnect in that window made the
    card report a failure for a broadcast that had actually played.
    """
    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=60, user_id=None
    )
    volume_calls = async_mock_service(hass, "media_player", "volume_set")
    hass.states.async_set("media_player.kitchen", "playing", {"volume_level": 0.4})

    client = await hass_ws_client(hass)
    await _send(client, message_id, ["media_player.kitchen"], mode="restore")

    # Returned promptly despite a 60s message, with the volume restore still
    # pending in its own task.
    assert len(play_calls) == 1
    assert volume_calls == []

    tail = next(
        task
        for task in asyncio.all_tasks()
        if task.get_name().startswith(f"{DOMAIN} restore")
    )
    assert not tail.done()
    tail.cancel()
    with suppress(asyncio.CancelledError):
        await tail


async def test_restore_tail_puts_the_volume_back(
    hass: HomeAssistant, setup_entry, play_calls, monkeypatch, hass_ws_client
) -> None:
    """The detached tail still restores the snapshotted volume."""
    monkeypatch.setattr(playback, "RESTORE_TAIL_MARGIN_S", 0)

    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=0, user_id=None
    )
    volume_calls = async_mock_service(hass, "media_player", "volume_set")
    hass.states.async_set("media_player.kitchen", "idle", {"volume_level": 0.4})

    client = await hass_ws_client(hass)
    await _send(client, message_id, ["media_player.kitchen"], mode="restore")
    await hass.async_block_till_done()

    assert len(volume_calls) == 1
    assert volume_calls[0].data["volume_level"] == 0.4


async def test_restore_tail_failure_is_logged_not_raised(
    hass: HomeAssistant, setup_entry, play_calls, monkeypatch, caplog, hass_ws_client
) -> None:
    """A failure in the detached tail is caught and logged.

    Nothing awaits this task, so an escaping exception would surface as an
    unhandled task exception at garbage-collection time rather than as a
    reported failure.
    """
    monkeypatch.setattr(playback, "RESTORE_TAIL_MARGIN_S", 0)

    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=0, user_id=None
    )

    async def volume_handler(call) -> None:
        raise HomeAssistantError("speaker went away")

    hass.services.async_register("media_player", "volume_set", volume_handler)
    hass.states.async_set("media_player.kitchen", "idle", {"volume_level": 0.4})

    client = await hass_ws_client(hass)
    msg = await _send(client, message_id, ["media_player.kitchen"], mode="restore")
    await hass.async_block_till_done()

    assert "media_player.kitchen" in caplog.text
    assert "speaker went away" in caplog.text
    # The message itself played; only the restore failed, so the target is
    # deliberately not reported as failed.
    assert msg["result"] == {"failed": []}


async def test_restore_uses_native_announce_when_the_target_supports_it(
    hass: HomeAssistant, setup_entry, play_calls, hass_ws_client
) -> None:
    """A player advertising MEDIA_ANNOUNCE ducks and resumes itself.

    The sleep-based tail is a workaround for players that cannot do this: it
    guesses when the message finished and puts the volume back. Where the
    integration implements announce, that guess is both unnecessary and worse
    than what the device does natively, so hand the work over.
    """
    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=0, user_id=None
    )
    volume_calls = async_mock_service(hass, "media_player", "volume_set")
    hass.states.async_set(
        "media_player.study",
        "playing",
        {"volume_level": 0.4, "supported_features": ANNOUNCE_FEATURE},
    )

    client = await hass_ws_client(hass)
    await _send(client, message_id, ["media_player.study"], mode="restore")
    await hass.async_block_till_done()

    assert len(play_calls) == 1
    assert play_calls[0].data.get("announce") is True
    assert not volume_calls, "the device restores itself; don't also fight it"


async def test_restore_falls_back_when_the_target_lacks_announce(
    hass: HomeAssistant, setup_entry, play_calls, monkeypatch, hass_ws_client
) -> None:
    """Without the feature bit the sleep-based tail still runs."""
    monkeypatch.setattr(playback, "RESTORE_TAIL_MARGIN_S", 0)

    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=0, user_id=None
    )
    volume_calls = async_mock_service(hass, "media_player", "volume_set")
    # PLAY_MEDIA only -- the announce bit is deliberately absent.
    hass.states.async_set(
        "media_player.kitchen",
        "idle",
        {"volume_level": 0.4, "supported_features": 512},
    )

    client = await hass_ws_client(hass)
    await _send(client, message_id, ["media_player.kitchen"], mode="restore")
    await hass.async_block_till_done()

    assert "announce" not in play_calls[0].data
    assert len(volume_calls) == 1
    assert volume_calls[0].data["volume_level"] == 0.4


async def test_volume_override_sets_and_restores_in_plain_mode(
    hass: HomeAssistant, setup_entry, play_calls, monkeypatch, hass_ws_client
) -> None:
    """A requested volume is set before playback and put back afterward."""
    monkeypatch.setattr(playback, "RESTORE_TAIL_MARGIN_S", 0)

    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=0, user_id=None
    )
    volume_calls = async_mock_service(hass, "media_player", "volume_set")
    hass.states.async_set("media_player.kitchen", "idle", {"volume_level": 0.4})

    client = await hass_ws_client(hass)
    await _send(client, message_id, ["media_player.kitchen"], mode="plain", volume=0.8)
    await hass.async_block_till_done()

    assert len(play_calls) == 1
    assert [call.data["volume_level"] for call in volume_calls] == [0.8, 0.4]


async def test_no_volume_calls_when_no_override_is_requested(
    hass: HomeAssistant, setup_entry, play_calls, hass_ws_client
) -> None:
    """Without a volume override, plain mode never touches volume_set."""
    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=0, user_id=None
    )
    volume_calls = async_mock_service(hass, "media_player", "volume_set")
    hass.states.async_set("media_player.kitchen", "idle", {"volume_level": 0.4})

    client = await hass_ws_client(hass)
    await _send(client, message_id, ["media_player.kitchen"], mode="plain")
    await hass.async_block_till_done()

    assert len(play_calls) == 1
    assert volume_calls == []


async def test_volume_override_applies_before_the_chime_too(
    hass: HomeAssistant, setup_entry, play_calls, monkeypatch, hass_ws_client
) -> None:
    """Chime mode sets the override once, before the chime, not per clip."""
    monkeypatch.setattr(playback, "CHIME_GAP_S", 0)
    monkeypatch.setattr(playback, "RESTORE_TAIL_MARGIN_S", 0)

    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=0, user_id=None
    )
    volume_calls = async_mock_service(hass, "media_player", "volume_set")
    hass.states.async_set("media_player.kitchen", "idle", {"volume_level": 0.4})

    client = await hass_ws_client(hass)
    await _send(client, message_id, ["media_player.kitchen"], mode="chime", volume=0.8)
    await hass.async_block_till_done()

    assert len(play_calls) == 2
    assert play_calls[0].data["media_content_id"] == f"media-source://{DOMAIN}/chime"
    assert [call.data["volume_level"] for call in volume_calls] == [0.8, 0.4]


async def test_volume_override_combines_with_restore_mode(
    hass: HomeAssistant, setup_entry, play_calls, monkeypatch, hass_ws_client
) -> None:
    """Restore mode both sets the override and puts the original back."""
    monkeypatch.setattr(playback, "RESTORE_TAIL_MARGIN_S", 0)

    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=0, user_id=None
    )
    volume_calls = async_mock_service(hass, "media_player", "volume_set")
    hass.states.async_set("media_player.kitchen", "idle", {"volume_level": 0.4})

    client = await hass_ws_client(hass)
    await _send(
        client, message_id, ["media_player.kitchen"], mode="restore", volume=0.8
    )
    await hass.async_block_till_done()

    assert len(play_calls) == 1
    assert [call.data["volume_level"] for call in volume_calls] == [0.8, 0.4]


async def test_volume_override_skipped_for_native_announce_targets(
    hass: HomeAssistant, setup_entry, play_calls, hass_ws_client
) -> None:
    """A player that ducks itself is left alone, override or not."""
    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=0, user_id=None
    )
    volume_calls = async_mock_service(hass, "media_player", "volume_set")
    hass.states.async_set(
        "media_player.study",
        "playing",
        {"volume_level": 0.4, "supported_features": ANNOUNCE_FEATURE},
    )

    client = await hass_ws_client(hass)
    await _send(client, message_id, ["media_player.study"], mode="restore", volume=0.8)
    await hass.async_block_till_done()

    assert len(play_calls) == 1
    assert not volume_calls, "the device handles its own announce volume"


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

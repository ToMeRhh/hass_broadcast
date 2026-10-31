"""Tests for the storage module."""

from datetime import timedelta
from unittest.mock import MagicMock, patch

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import async_fire_time_changed

from custom_components.hass_broadcast.storage import BroadcastStore


async def test_add_creates_file_and_metadata(hass: HomeAssistant) -> None:
    """Adding a recording writes the file and records metadata."""
    store = BroadcastStore(hass, retention=10)
    await store.async_load()

    message_id = await store.async_add(
        b"RIFFfake", extension="wav", duration=1.5, user_id="abc"
    )

    path = await store.async_path(message_id)
    assert path is not None
    assert path.read_bytes() == b"RIFFfake"

    listing = await store.async_list()
    assert len(listing) == 1
    assert listing[0]["id"] == message_id
    assert listing[0]["duration"] == 1.5
    assert listing[0]["extension"] == "wav"
    assert listing[0]["user_id"] == "abc"


async def test_list_is_newest_first(hass: HomeAssistant) -> None:
    """Listing returns newest recordings first."""
    store = BroadcastStore(hass, retention=10)
    await store.async_load()

    first = await store.async_add(b"a", extension="wav", duration=1, user_id=None)
    second = await store.async_add(b"b", extension="wav", duration=1, user_id=None)

    assert [item["id"] for item in await store.async_list()] == [second, first]


async def test_retention_prunes_oldest_and_deletes_file(hass: HomeAssistant) -> None:
    """Exceeding retention deletes the oldest recording and its file."""
    store = BroadcastStore(hass, retention=2)
    await store.async_load()

    oldest = await store.async_add(b"a", extension="wav", duration=1, user_id=None)
    oldest_path = await store.async_path(oldest)
    await store.async_add(b"b", extension="wav", duration=1, user_id=None)
    await store.async_add(b"c", extension="wav", duration=1, user_id=None)

    listing = await store.async_list()
    assert len(listing) == 2
    assert oldest not in [item["id"] for item in listing]
    assert not oldest_path.exists()


async def test_delete_removes_file_and_entry(hass: HomeAssistant) -> None:
    """Deleting removes both the metadata entry and the file."""
    store = BroadcastStore(hass, retention=10)
    await store.async_load()
    message_id = await store.async_add(b"a", extension="wav", duration=1, user_id=None)
    path = await store.async_path(message_id)

    assert await store.async_delete(message_id) is True
    assert not path.exists()
    assert await store.async_list() == []
    assert await store.async_delete(message_id) is False


async def test_path_is_none_for_unknown_id(hass: HomeAssistant) -> None:
    """An unknown id resolves to no path."""
    store = BroadcastStore(hass, retention=10)
    await store.async_load()
    assert await store.async_path("nope") is None


async def _add(
    store: BroadcastStore, data: bytes = b"a", *, temporary: bool = False
) -> str:
    """Add a one-second wav, saved unless `temporary`."""
    return await store.async_add(
        data, extension="wav", duration=1, user_id=None, temporary=temporary
    )


async def _advance(hass: HomeAssistant, seconds: int) -> None:
    """Fire the timers due `seconds` from now and let their tasks finish."""
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=seconds))
    await hass.async_block_till_done()


async def test_temporary_is_hidden_from_list_but_gettable(
    hass: HomeAssistant,
) -> None:
    """A temporary recording is playable by id but not listed."""
    store = BroadcastStore(hass, retention=10)
    await store.async_load()

    message_id = await _add(store, b"temp", temporary=True)

    assert await store.async_list() == []
    message = await store.async_get(message_id)
    assert message is not None
    assert message["temporary"] is True
    path = await store.async_path(message_id)
    assert path is not None
    assert path.read_bytes() == b"temp"
    store.async_shutdown()


async def test_temporary_expires_after_ttl(hass: HomeAssistant) -> None:
    """A temporary recording and its file vanish once the TTL passes."""
    store = BroadcastStore(hass, retention=10)
    await store.async_load()
    message_id = await _add(store, temporary=True)
    path = await store.async_path(message_id)
    assert path is not None

    await _advance(hass, 599)
    assert await store.async_get(message_id) is not None

    await _advance(hass, 601)
    assert await store.async_get(message_id) is None
    assert not path.exists()


async def test_touch_pushes_the_deadline_back(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """Touching a temporary recording restarts its TTL."""
    store = BroadcastStore(hass, retention=10)
    await store.async_load()
    message_id = await _add(store, temporary=True)

    # The clock must really move, or the touch would schedule from "now".
    freezer.tick(500)
    await _advance(hass, 0)
    await store.async_touch(message_id)
    freezer.tick(400)
    await _advance(hass, 0)
    assert await store.async_get(message_id) is not None

    freezer.tick(201)
    await _advance(hass, 0)
    assert await store.async_get(message_id) is None


async def test_keep_makes_it_saved_and_newest(hass: HomeAssistant) -> None:
    """Keeping a temporary recording lists it first and cancels its expiry."""
    store = BroadcastStore(hass, retention=10)
    await store.async_load()
    a = await _add(store, b"a")
    t = await _add(store, b"t", temporary=True)
    b = await _add(store, b"b")

    assert await store.async_keep(t) is True

    assert [m["id"] for m in await store.async_list()] == [t, b, a]
    message = await store.async_get(t)
    assert message is not None
    assert "temporary" not in message
    await _advance(hass, 601)
    assert await store.async_get(t) is not None


async def test_keep_is_idempotent_and_false_for_unknown(
    hass: HomeAssistant,
) -> None:
    """Keeping a saved recording changes nothing; an unknown id is False."""
    store = BroadcastStore(hass, retention=10)
    await store.async_load()
    saved = await _add(store)
    await _add(store, b"b")
    before = await store.async_list()

    assert await store.async_keep(saved) is True
    assert await store.async_list() == before
    assert await store.async_keep("nope") is False


async def test_expiry_after_delete_is_harmless(hass: HomeAssistant) -> None:
    """Deleting a temporary recording leaves no timer to trip over."""
    store = BroadcastStore(hass, retention=10)
    await store.async_load()
    message_id = await _add(store, temporary=True)
    assert await store.async_delete(message_id) is True

    await _advance(hass, 601)
    assert await store.async_list() == []


async def test_retention_ignores_temporaries(hass: HomeAssistant) -> None:
    """Only saved recordings count against, or are dropped by, retention."""
    store = BroadcastStore(hass, retention=2)
    await store.async_load()
    t = await _add(store, b"t", temporary=True)
    await _add(store, b"a")
    b = await _add(store, b"b")
    c = await _add(store, b"c")

    assert [m["id"] for m in await store.async_list()] == [c, b]
    assert await store.async_get(t) is not None

    await store.async_keep(t)
    assert [m["id"] for m in await store.async_list()] == [t, c]


async def test_load_purges_leftover_temporaries(hass: HomeAssistant) -> None:
    """Temporaries from a previous run are dropped, files included."""
    first = BroadcastStore(hass, retention=10)
    await first.async_load()
    t = await _add(first, b"t", temporary=True)
    s = await _add(first, b"s")
    t_path = await first.async_path(t)
    assert t_path is not None
    first.async_shutdown()

    second = BroadcastStore(hass, retention=10)
    await second.async_load()

    assert await second.async_get(t) is None
    assert not t_path.exists()
    assert await second.async_get(s) is not None


async def test_remove_all_cancels_timers(hass: HomeAssistant) -> None:
    """Removing everything leaves no expiry timer behind."""
    store = BroadcastStore(hass, retention=10)
    await store.async_load()
    cancel = MagicMock()
    with patch(
        "custom_components.hass_broadcast.storage.async_call_later",
        return_value=cancel,
    ):
        await _add(store, temporary=True)

    await store.async_remove_all()

    cancel.assert_called_once_with()
    await _advance(hass, 601)

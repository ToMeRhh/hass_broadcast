"""Tests for the storage module."""

from homeassistant.core import HomeAssistant

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

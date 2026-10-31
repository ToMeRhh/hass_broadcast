"""Tests for hass_broadcast setup."""

from datetime import timedelta
from pathlib import Path

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.hass_broadcast.const import DOMAIN, STORAGE_DIR, STORAGE_KEY
from custom_components.hass_broadcast.storage import async_get_store


async def test_setup_and_unload(hass: HomeAssistant) -> None:
    """The config entry sets up and unloads cleanly."""
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.LOADED

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.NOT_LOADED


async def test_store_is_found_only_while_the_entry_is_loaded(
    hass: HomeAssistant,
) -> None:
    """The http, websocket and media source lookup sees only a loaded entry.

    Before setup and after unload there is no store, and the callers answer
    "not set up" rather than reaching into a stale or missing runtime_data.
    """
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert async_get_store(hass) is None

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert async_get_store(hass) is entry.runtime_data.store

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert async_get_store(hass) is None


async def test_removing_the_entry_deletes_the_recordings(
    hass: HomeAssistant, hass_storage
) -> None:
    """Uninstalling purges the recordings directory and its metadata.

    Otherwise removing the integration leaves every household member's voice
    recordings in <config>/hass_broadcast/ (and in every later backup) with
    no UI left to delete them.
    """
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    store = entry.runtime_data.store
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )
    recording = Path(hass.config.path(STORAGE_DIR)) / f"{message_id}.wav"
    assert recording.is_file()
    assert STORAGE_KEY in hass_storage

    await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()

    # The audio and the metadata both go. (The directory itself is only
    # rmdir'd when empty, which it is not here: this test config directory is
    # shared with the rest of the session.)
    assert not recording.exists()
    assert STORAGE_KEY not in hass_storage


async def test_unload_cancels_expiry_timers(hass: HomeAssistant) -> None:
    """Unloading leaves no timer: the next load purges, not a stray callback."""
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    store = entry.runtime_data.store
    message_id = await store.async_add(
        b"t", extension="wav", duration=1, user_id=None, temporary=True
    )
    path = await store.async_path(message_id)

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=601))
    await hass.async_block_till_done()

    assert path is not None
    assert path.exists()

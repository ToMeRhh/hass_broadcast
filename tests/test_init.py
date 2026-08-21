"""Tests for hass_broadcast setup."""

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_broadcast.const import DOMAIN


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


async def test_removing_the_entry_deletes_the_recordings(
    hass: HomeAssistant, hass_storage
) -> None:
    """Uninstalling purges the recordings directory and its metadata.

    Otherwise removing the integration leaves every household member's voice
    recordings in <config>/hass_broadcast/ (and in every later backup) with
    no UI left to delete them.
    """
    from pathlib import Path

    from custom_components.hass_broadcast.const import (
        DATA_STORE,
        STORAGE_DIR,
        STORAGE_KEY,
    )

    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    store = hass.data[DOMAIN][entry.entry_id][DATA_STORE]
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

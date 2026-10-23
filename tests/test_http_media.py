"""Tests for the media serving endpoint."""

from datetime import timedelta
from http import HTTPStatus

from homeassistant.components.http.auth import async_sign_path
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_broadcast.const import DATA_STORE, DOMAIN


@pytest.fixture
async def setup_entry(hass: HomeAssistant) -> MockConfigEntry:
    """Set up the integration."""
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_serves_stored_recording(
    hass: HomeAssistant, setup_entry, hass_client
) -> None:
    """A stored recording is served with its bytes intact."""
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    client = await hass_client()
    resp = await client.get(f"/api/hass_broadcast/media/{message_id}.wav")
    assert resp.status == HTTPStatus.OK
    assert await resp.read() == b"RIFFdata"


async def test_unknown_recording_is_not_found(
    hass: HomeAssistant, setup_entry, hass_client
) -> None:
    """An unknown id returns 404."""
    client = await hass_client()
    resp = await client.get("/api/hass_broadcast/media/deadbeef.wav")
    assert resp.status == HTTPStatus.NOT_FOUND


async def test_extension_mismatch_is_not_found(
    hass: HomeAssistant, setup_entry, hass_client
) -> None:
    """Requesting the wrong extension for a real id returns 404.

    The id exists but the stored file is a .wav; serving it for a .mp3
    request would hand back WAV bytes labelled audio/mpeg.
    """
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    client = await hass_client()
    resp = await client.get(f"/api/hass_broadcast/media/{message_id}.mp3")
    assert resp.status == HTTPStatus.NOT_FOUND


async def test_media_requires_authentication(
    hass: HomeAssistant, setup_entry, hass_client_no_auth
) -> None:
    """Unauthenticated, unsigned requests are rejected."""
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    client = await hass_client_no_auth()
    resp = await client.get(f"/api/hass_broadcast/media/{message_id}.wav")
    assert resp.status == HTTPStatus.UNAUTHORIZED


async def test_signed_path_grants_access(
    hass: HomeAssistant, setup_entry, hass_client_no_auth
) -> None:
    """A signed path works without a token — this is how Cast fetches."""
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    signed = async_sign_path(
        hass, f"/api/hass_broadcast/media/{message_id}.wav", timedelta(seconds=60)
    )

    client = await hass_client_no_auth()
    resp = await client.get(signed)
    assert resp.status == HTTPStatus.OK

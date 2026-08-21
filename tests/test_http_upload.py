"""Tests for the upload endpoint."""

from http import HTTPStatus

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_broadcast.const import DOMAIN


@pytest.fixture
async def setup_entry(hass: HomeAssistant) -> MockConfigEntry:
    """Set up the integration."""
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def _wav_bytes() -> bytes:
    """Return a minimal valid WAV header plus a little silence."""
    return b"RIFF$\x00\x00\x00WAVEfmt " + b"\x00" * 32


async def test_upload_requires_authentication(
    hass: HomeAssistant, setup_entry, hass_client_no_auth
) -> None:
    """Anonymous uploads are rejected."""
    client = await hass_client_no_auth()
    resp = await client.post("/api/hass_broadcast/upload")
    assert resp.status == HTTPStatus.UNAUTHORIZED


async def test_non_admin_user_can_upload(
    hass: HomeAssistant, setup_entry, hass_client, hass_read_only_access_token
) -> None:
    """A non-admin user can upload. This is deliberate — see the spec."""
    client = await hass_client(hass_read_only_access_token)
    resp = await client.post(
        "/api/hass_broadcast/upload",
        data={"file": _wav_bytes(), "duration": "1.5"},
    )
    assert resp.status == HTTPStatus.OK
    body = await resp.json()
    assert "message_id" in body


async def test_upload_rejects_oversized_file(
    hass: HomeAssistant, setup_entry, hass_client
) -> None:
    """Files beyond the size ceiling are rejected."""
    client = await hass_client()
    resp = await client.post(
        "/api/hass_broadcast/upload",
        data={"file": b"x" * (10 * 1024 * 1024 + 1), "duration": "1"},
    )
    assert resp.status == HTTPStatus.REQUEST_ENTITY_TOO_LARGE


async def test_upload_rejects_missing_file(
    hass: HomeAssistant, setup_entry, hass_client
) -> None:
    """A request without a file field is a bad request."""
    client = await hass_client()
    resp = await client.post("/api/hass_broadcast/upload", data={"duration": "1"})
    assert resp.status == HTTPStatus.BAD_REQUEST


async def test_upload_stores_the_recording(
    hass: HomeAssistant, setup_entry, hass_client
) -> None:
    """A successful upload is retrievable from the store."""
    from custom_components.hass_broadcast import DATA_STORE

    client = await hass_client()
    resp = await client.post(
        "/api/hass_broadcast/upload",
        data={"file": _wav_bytes(), "duration": "2.0"},
    )
    message_id = (await resp.json())["message_id"]

    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    assert (await store.async_get(message_id))["duration"] == 2.0


async def test_upload_survives_options_reload(
    hass: HomeAssistant, setup_entry, hass_client
) -> None:
    """The endpoint keeps working after an options-triggered reload.

    `_async_update_listener` calls `async_reload`, which re-runs
    `async_setup_entry` (and therefore `async_register_views`) without ever
    unregistering the view first. This asserts, empirically, that HA's
    router tolerates re-registration rather than raising or duplicating the
    route.
    """
    await hass.config_entries.async_reload(setup_entry.entry_id)
    await hass.async_block_till_done()

    client = await hass_client()
    resp = await client.post(
        "/api/hass_broadcast/upload",
        data={"file": _wav_bytes(), "duration": "1.0"},
    )
    assert resp.status == HTTPStatus.OK
    body = await resp.json()
    assert "message_id" in body

"""Tests for the upload endpoint."""

from http import HTTPStatus
import io
import wave

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


def _real_wav_bytes(*, seconds: float, rate: int = 16000) -> bytes:
    """Return a genuine, parseable WAV of a known duration."""
    frames = int(rate * seconds)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as writer:
        writer.setnchannels(1)
        writer.setsampwidth(2)
        writer.setframerate(rate)
        writer.writeframes(b"\x00\x00" * frames)
    return buf.getvalue()


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
        data={"file": io.BytesIO(_wav_bytes()), "duration": "1.5"},
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
        data={
            "file": io.BytesIO(b"x" * (10 * 1024 * 1024 + 1)),
            "duration": "1",
        },
    )
    assert resp.status == HTTPStatus.REQUEST_ENTITY_TOO_LARGE


async def test_upload_rejects_missing_file(
    hass: HomeAssistant, setup_entry, hass_client
) -> None:
    """A request without a file field is a bad request."""
    client = await hass_client()
    resp = await client.post("/api/hass_broadcast/upload", data={"duration": "1"})
    assert resp.status == HTTPStatus.BAD_REQUEST


async def test_upload_records_the_uploading_user(
    hass: HomeAssistant,
    setup_entry,
    hass_client,
    hass_read_only_user,
    hass_read_only_access_token,
) -> None:
    """The uploader's user id is stored with the recording.

    The whole ownership-based delete model reads this field: if uploads stop
    recording who made them, every recording becomes undeletable by its own
    owner (and the websocket delete check silently degrades to admin-only).
    """
    client = await hass_client(hass_read_only_access_token)
    resp = await client.post(
        "/api/hass_broadcast/upload",
        data={"file": io.BytesIO(_wav_bytes()), "duration": "1.0"},
    )
    assert resp.status == HTTPStatus.OK
    message_id = (await resp.json())["message_id"]

    store = setup_entry.runtime_data.store
    stored = await store.async_get(message_id)
    assert stored["user_id"] == hass_read_only_user.id


async def test_upload_rejects_non_wave_riff_file(
    hass: HomeAssistant, setup_entry, hass_client
) -> None:
    """A RIFF file that is not a WAVE (e.g. WebP, AVI) is rejected.

    "RIFF" alone is the container magic for a whole family of formats; only
    the WAVE form type at bytes 8-12 makes it a WAV. Accepting one here means
    serving it back later as audio/wav.
    """
    client = await hass_client()
    webp = b"RIFF$\x00\x00\x00WEBPVP8 " + b"\x00" * 32
    resp = await client.post(
        "/api/hass_broadcast/upload",
        data={"file": io.BytesIO(webp), "duration": "1"},
    )
    assert resp.status == HTTPStatus.BAD_REQUEST


async def test_upload_stores_the_recording(
    hass: HomeAssistant, setup_entry, hass_client
) -> None:
    """A successful upload is retrievable from the store."""
    client = await hass_client()
    resp = await client.post(
        "/api/hass_broadcast/upload",
        data={"file": io.BytesIO(_wav_bytes()), "duration": "2.0"},
    )
    message_id = (await resp.json())["message_id"]

    store = setup_entry.runtime_data.store
    assert (await store.async_get(message_id))["duration"] == 2.0


async def test_upload_derives_duration_from_wav_data(
    hass: HomeAssistant, setup_entry, hass_client
) -> None:
    """Stored duration comes from the WAV's real length, not the form field.

    The client-supplied `duration` is untrusted (and here is deliberately
    wrong); the server must parse the actual WAV frames/framerate instead.
    """
    client = await hass_client()
    resp = await client.post(
        "/api/hass_broadcast/upload",
        data={
            "file": io.BytesIO(_real_wav_bytes(seconds=2.5)),
            "duration": "999",  # deliberately wrong -- must be ignored
        },
    )
    assert resp.status == HTTPStatus.OK
    message_id = (await resp.json())["message_id"]

    store = setup_entry.runtime_data.store
    stored = await store.async_get(message_id)
    assert stored["duration"] == pytest.approx(2.5)


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
        data={"file": io.BytesIO(_wav_bytes()), "duration": "1.0"},
    )
    assert resp.status == HTTPStatus.OK
    body = await resp.json()
    assert "message_id" in body

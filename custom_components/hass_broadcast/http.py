"""HTTP views for hass_broadcast."""

from __future__ import annotations

from http import HTTPStatus
import logging
from typing import Any

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .audio_processing import async_transcode_to_mp3
from .const import DOMAIN, MAX_UPLOAD_BYTES

_LOGGER = logging.getLogger(__name__)


def _first_entry_data(hass: HomeAssistant) -> dict[str, Any] | None:
    """Return the data for the single config entry, if set up."""
    entries = hass.data.get(DOMAIN, {})
    return next(iter(entries.values()), None)


class BroadcastUploadView(HomeAssistantView):
    """Accept a recorded WAV.

    Authenticated but intentionally NOT admin-gated: Home Assistant's own
    upload view is admin-only, which would stop non-admin household members
    from using the card.
    """

    url = "/api/hass_broadcast/upload"
    name = "api:hass_broadcast:upload"

    async def post(self, request: web.Request) -> web.Response:
        """Store an uploaded recording."""
        hass: HomeAssistant = request.app["hass"]
        entry_data = _first_entry_data(hass)
        if entry_data is None:
            return web.json_response(
                {"message": "Voice Broadcast is not set up"},
                status=HTTPStatus.SERVICE_UNAVAILABLE,
            )

        from . import DATA_STORE

        store = entry_data[DATA_STORE]

        try:
            data = await request.post()
        except ValueError:
            return web.json_response(
                {"message": "Malformed upload"}, status=HTTPStatus.BAD_REQUEST
            )

        file_field = data.get("file")
        if file_field is None:
            return web.json_response(
                {"message": "Missing file field"}, status=HTTPStatus.BAD_REQUEST
            )

        raw = file_field.file.read() if hasattr(file_field, "file") else file_field
        if isinstance(raw, str):
            raw = raw.encode()

        if len(raw) > MAX_UPLOAD_BYTES:
            return web.json_response(
                {"message": "Recording too large"},
                status=HTTPStatus.REQUEST_ENTITY_TOO_LARGE,
            )

        if not raw.startswith(b"RIFF"):
            return web.json_response(
                {"message": "Only WAV uploads are accepted"},
                status=HTTPStatus.BAD_REQUEST,
            )

        try:
            duration = float(data.get("duration", 0))
        except (TypeError, ValueError):
            duration = 0.0

        payload, extension = raw, "wav"
        if (mp3 := await async_transcode_to_mp3(hass, raw)) is not None:
            payload, extension = mp3, "mp3"

        message_id = await store.async_add(
            payload,
            extension=extension,
            duration=duration,
            user_id=request["hass_user"].id if "hass_user" in request else None,
        )
        return web.json_response({"message_id": message_id})


def async_register_views(hass: HomeAssistant) -> None:
    """Register the HTTP views."""
    hass.http.register_view(BroadcastUploadView())

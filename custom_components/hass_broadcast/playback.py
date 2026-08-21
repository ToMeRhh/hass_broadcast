"""The hass_broadcast.send service."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

import voluptuous as vol

from homeassistant.components.media_player import (
    ATTR_MEDIA_CONTENT_ID,
    ATTR_MEDIA_CONTENT_TYPE,
    DOMAIN as MEDIA_PLAYER_DOMAIN,
    SERVICE_PLAY_MEDIA,
    MediaType,
)
from homeassistant.const import ATTR_ENTITY_ID
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError
import homeassistant.helpers.config_validation as cv

from .const import DOMAIN, MODE_CHIME, MODE_PLAIN, MODE_RESTORE, MODES

_LOGGER = logging.getLogger(__name__)

SERVICE_SEND = "send"
CHIME_URL = "/api/hass_broadcast/static/chime.wav"

SEND_SCHEMA = vol.Schema(
    {
        vol.Required("message_id"): cv.string,
        vol.Required("targets"): vol.All(cv.ensure_list, [cv.entity_id]),
        vol.Optional("mode", default=MODE_PLAIN): vol.In(MODES),
    }
)


def _store(hass: HomeAssistant):
    """Return the store, or None when not set up."""
    from . import DATA_STORE

    entry_data = next(iter(hass.data.get(DOMAIN, {}).values()), None)
    return entry_data[DATA_STORE] if entry_data else None


async def _async_play(
    hass: HomeAssistant, entity_id: str, content_id: str
) -> None:
    """Issue one play_media call."""
    await hass.services.async_call(
        MEDIA_PLAYER_DOMAIN,
        SERVICE_PLAY_MEDIA,
        {
            ATTR_ENTITY_ID: entity_id,
            ATTR_MEDIA_CONTENT_ID: content_id,
            ATTR_MEDIA_CONTENT_TYPE: MediaType.MUSIC,
        },
        blocking=True,
    )


async def _async_send_to_target(
    hass: HomeAssistant,
    entity_id: str,
    content_id: str,
    mode: str,
    duration: float,
) -> None:
    """Play a message on one target according to the mode."""
    snapshot: dict[str, Any] | None = None
    if mode == MODE_RESTORE:
        state = hass.states.get(entity_id)
        if state is not None:
            snapshot = {
                "volume": state.attributes.get("volume_level"),
                "state": state.state,
            }

    if mode == MODE_CHIME:
        await _async_play(hass, entity_id, CHIME_URL)
        await asyncio.sleep(0.4)

    await _async_play(hass, entity_id, content_id)

    if snapshot is not None:
        await asyncio.sleep(duration + 1)
        if snapshot["volume"] is not None:
            await hass.services.async_call(
                MEDIA_PLAYER_DOMAIN,
                "volume_set",
                {ATTR_ENTITY_ID: entity_id, "volume_level": snapshot["volume"]},
                blocking=True,
            )
        if snapshot["state"] == "playing":
            # Best effort only: Cast cannot reliably resume an app session.
            await hass.services.async_call(
                MEDIA_PLAYER_DOMAIN,
                "media_play",
                {ATTR_ENTITY_ID: entity_id},
                blocking=False,
            )


async def _async_handle_send(call: ServiceCall) -> None:
    """Handle hass_broadcast.send."""
    hass = call.hass
    store = _store(hass)
    if store is None:
        raise HomeAssistantError("Voice Broadcast is not set up")

    message_id = call.data["message_id"]
    message = await store.async_get(message_id)
    if message is None:
        raise HomeAssistantError(f"Unknown recording {message_id}")

    content_id = f"media-source://{DOMAIN}/{message_id}"
    mode = call.data["mode"]
    duration = float(message.get("duration") or 0)

    for entity_id in call.data["targets"]:
        try:
            await _async_send_to_target(hass, entity_id, content_id, mode, duration)
        except HomeAssistantError as err:
            _LOGGER.error("Broadcast to %s failed: %s", entity_id, err)


def async_register_services(hass: HomeAssistant) -> None:
    """Register the broadcast services."""
    if hass.services.has_service(DOMAIN, SERVICE_SEND):
        return
    hass.services.async_register(
        DOMAIN, SERVICE_SEND, _async_handle_send, schema=SEND_SCHEMA
    )

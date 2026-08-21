"""WebSocket commands for hass_broadcast."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN


def _store(hass: HomeAssistant):
    """Return the store, or None when not set up."""
    from . import DATA_STORE

    entry_data = next(iter(hass.data.get(DOMAIN, {}).values()), None)
    return entry_data[DATA_STORE] if entry_data else None


@websocket_api.websocket_command({vol.Required("type"): "hass_broadcast/list"})
@websocket_api.async_response
async def ws_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return stored recordings, newest first."""
    store = _store(hass)
    if store is None:
        connection.send_error(msg["id"], "not_setup", "Voice Broadcast is not set up")
        return
    connection.send_result(msg["id"], {"messages": await store.async_list()})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hass_broadcast/delete",
        vol.Required("message_id"): str,
    }
)
@websocket_api.async_response
async def ws_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a recording."""
    store = _store(hass)
    if store is None:
        connection.send_error(msg["id"], "not_setup", "Voice Broadcast is not set up")
        return
    deleted = await store.async_delete(msg["message_id"])
    connection.send_result(msg["id"], {"deleted": deleted})


@callback
def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register the websocket commands."""
    websocket_api.async_register_command(hass, ws_list)
    websocket_api.async_register_command(hass, ws_delete)

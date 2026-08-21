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
    messages = await store.async_list()
    # Replace user_id with can_delete bool for API consumers
    result_messages = []
    for message in messages:
        result_msg = dict(message)  # Create a copy to avoid mutating store's data
        user_id = result_msg.pop("user_id", None)
        # Can delete if user is admin or is the owner
        can_delete = (
            connection.user.is_admin or connection.user.id == user_id
        )
        result_msg["can_delete"] = can_delete
        result_messages.append(result_msg)
    connection.send_result(msg["id"], {"messages": result_messages})


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
    # Fetch the message to check ownership
    message = await store.async_get(msg["message_id"])
    # If not found, return success with deleted: false (not an error)
    if message is None:
        connection.send_result(msg["id"], {"deleted": False})
        return
    # Check authorization: user is admin or is the owner
    if not (connection.user.is_admin or connection.user.id == message.get("user_id")):
        connection.send_error(
            msg["id"],
            "not_authorized",
            "You do not have permission to delete this recording"
        )
        return
    # User is authorized, delete the recording
    deleted = await store.async_delete(msg["message_id"])
    connection.send_result(msg["id"], {"deleted": deleted})


@callback
def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register the websocket commands."""
    websocket_api.async_register_command(hass, ws_list)
    websocket_api.async_register_command(hass, ws_delete)

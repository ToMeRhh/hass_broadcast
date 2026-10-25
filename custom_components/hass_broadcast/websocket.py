"""WebSocket commands for hass_broadcast."""

from __future__ import annotations

from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
import homeassistant.helpers.config_validation as cv
import voluptuous as vol

from .const import MODE_PLAIN, MODES
from .playback import async_broadcast
from .storage import async_get_store


@websocket_api.websocket_command({vol.Required("type"): "hass_broadcast/list"})
@websocket_api.async_response
async def ws_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return stored recordings, newest first."""
    store = async_get_store(hass)
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
        can_delete = connection.user.is_admin or connection.user.id == user_id
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
    store = async_get_store(hass)
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
            "You do not have permission to delete this recording",
        )
        return
    # User is authorized, delete the recording
    deleted = await store.async_delete(msg["message_id"])
    connection.send_result(msg["id"], {"deleted": deleted})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hass_broadcast/send",
        vol.Required("message_id"): str,
        vol.Required("targets"): [cv.entity_id],
        vol.Optional("mode", default=MODE_PLAIN): vol.In(MODES),
        vol.Optional("volume"): vol.All(vol.Coerce(float), vol.Range(min=0, max=1)),
    }
)
@websocket_api.async_response
async def ws_send(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Broadcast a recording to media players.

    Deliberately NOT a Home Assistant service. Registering one publishes it to
    Developer Tools and the automation editor -- there is no private service --
    and `message_id` is an opaque storage id no automation author can obtain.
    This is card RPC, so it belongs on the websocket beside list and delete.

    Returns once playback has been dispatched, not when it ends: restore mode's
    volume tail runs as a detached task and deliberately outlives this reply.
    """
    store = async_get_store(hass)
    if store is None:
        connection.send_error(msg["id"], "not_setup", "Voice Broadcast is not set up")
        return

    message = await store.async_get(msg["message_id"])
    if message is None:
        connection.send_error(
            msg["id"], "not_found", f"Unknown recording {msg['message_id']}"
        )
        return

    failed = await async_broadcast(
        hass, message, msg["targets"], msg["mode"], msg.get("volume")
    )
    connection.send_result(msg["id"], {"failed": failed})


@callback
def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register the websocket commands."""
    websocket_api.async_register_command(hass, ws_list)
    websocket_api.async_register_command(hass, ws_delete)
    websocket_api.async_register_command(hass, ws_send)

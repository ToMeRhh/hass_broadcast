"""Tests for the websocket commands."""

from datetime import timedelta
from unittest.mock import patch

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.hass_broadcast.const import DOMAIN


@pytest.fixture
async def setup_entry(hass: HomeAssistant) -> MockConfigEntry:
    """Set up the integration."""
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


@pytest.fixture
async def admin_user(hass: HomeAssistant) -> str:
    """Get the admin user ID."""
    users = await hass.auth.async_get_users()
    return users[0].id


async def test_list_returns_recordings_newest_first(
    hass: HomeAssistant, setup_entry, hass_ws_client
) -> None:
    """The list command returns stored recordings, newest first."""
    store = setup_entry.runtime_data.store
    first = await store.async_add(b"a", extension="wav", duration=1, user_id=None)
    second = await store.async_add(b"b", extension="wav", duration=2, user_id=None)

    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hass_broadcast/list"})
    msg = await client.receive_json()

    assert msg["success"] is True
    assert [m["id"] for m in msg["result"]["messages"]] == [second, first]


async def test_delete_removes_a_recording(
    hass: HomeAssistant, setup_entry, hass_ws_client
) -> None:
    """The delete command removes a recording."""
    store = setup_entry.runtime_data.store
    message_id = await store.async_add(b"a", extension="wav", duration=1, user_id=None)

    client = await hass_ws_client(hass)
    await client.send_json(
        {"id": 1, "type": "hass_broadcast/delete", "message_id": message_id}
    )
    msg = await client.receive_json()

    assert msg["success"] is True
    assert msg["result"]["deleted"] is True
    assert await store.async_list() == []


async def test_delete_unknown_reports_false(
    hass: HomeAssistant, setup_entry, hass_ws_client
) -> None:
    """Deleting an unknown recording reports deleted: false."""
    client = await hass_ws_client(hass)
    await client.send_json(
        {"id": 1, "type": "hass_broadcast/delete", "message_id": "nope"}
    )
    msg = await client.receive_json()

    assert msg["success"] is True
    assert msg["result"]["deleted"] is False


async def test_list_includes_can_delete_and_not_user_id(
    hass: HomeAssistant, setup_entry, hass_ws_client, admin_user
) -> None:
    """List responses contain can_delete and do not contain user_id."""
    store = setup_entry.runtime_data.store
    # Add recording as someone else (use a different user_id)
    message_id = await store.async_add(
        b"a", extension="wav", duration=1, user_id="other_user"
    )

    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hass_broadcast/list"})
    msg = await client.receive_json()

    assert msg["success"] is True
    messages = msg["result"]["messages"]
    assert len(messages) == 1
    # Must have can_delete (admin can delete any recording)
    assert "can_delete" in messages[0]
    assert messages[0]["can_delete"] is True
    # Must NOT have user_id
    assert "user_id" not in messages[0]
    # Should still have other fields
    assert messages[0]["id"] == message_id


async def test_non_owner_cannot_delete(
    hass: HomeAssistant, setup_entry, hass_ws_client, hass_read_only_access_token
) -> None:
    """Non-admin, non-owner cannot delete a recording."""
    store = setup_entry.runtime_data.store
    # Add recording as someone else
    other_user_id = "some_other_user_id"
    message_id = await store.async_add(
        b"a", extension="wav", duration=1, user_id=other_user_id
    )

    # Connect as non-admin user
    client = await hass_ws_client(hass, hass_read_only_access_token)
    await client.send_json(
        {"id": 1, "type": "hass_broadcast/delete", "message_id": message_id}
    )
    msg = await client.receive_json()

    # Should get an error response
    assert msg["success"] is False
    assert msg["error"]["code"] == "not_authorized"
    # Recording should still exist
    assert len(await store.async_list()) == 1


async def test_owner_can_delete_own_recording(
    hass: HomeAssistant, setup_entry, hass_ws_client, admin_user
) -> None:
    """Owner can delete their own recording."""
    store = setup_entry.runtime_data.store
    # Add recording as the admin user (who is also the WebSocket client user)
    message_id = await store.async_add(
        b"a", extension="wav", duration=1, user_id=admin_user
    )

    client = await hass_ws_client(hass)
    await client.send_json(
        {"id": 1, "type": "hass_broadcast/delete", "message_id": message_id}
    )
    msg = await client.receive_json()

    assert msg["success"] is True
    assert msg["result"]["deleted"] is True
    assert await store.async_list() == []


async def test_admin_can_delete_any_recording(
    hass: HomeAssistant, setup_entry, hass_ws_client
) -> None:
    """Admin can delete a recording owned by someone else."""
    store = setup_entry.runtime_data.store
    # Add recording owned by someone else
    message_id = await store.async_add(
        b"a", extension="wav", duration=1, user_id="some_other_user"
    )

    # Admin client (default hass_ws_client is admin)
    client = await hass_ws_client(hass)
    await client.send_json(
        {"id": 1, "type": "hass_broadcast/delete", "message_id": message_id}
    )
    msg = await client.receive_json()

    assert msg["success"] is True
    assert msg["result"]["deleted"] is True
    assert await store.async_list() == []


async def test_save_keeps_a_temporary_recording(
    hass: HomeAssistant, setup_entry, hass_ws_client, admin_user
) -> None:
    """Saving turns a temporary recording into a listed one."""
    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"a", extension="wav", duration=1, user_id=admin_user, temporary=True
    )
    assert await store.async_list() == []

    client = await hass_ws_client(hass)
    await client.send_json(
        {"id": 1, "type": "hass_broadcast/save", "message_id": message_id}
    )
    msg = await client.receive_json()

    assert msg["success"] is True
    assert msg["result"] == {"saved": True}
    assert [m["id"] for m in await store.async_list()] == [message_id]


async def test_save_unknown_is_not_found(
    hass: HomeAssistant, setup_entry, hass_ws_client
) -> None:
    """Saving an unknown recording is an error."""
    client = await hass_ws_client(hass)
    await client.send_json(
        {"id": 1, "type": "hass_broadcast/save", "message_id": "nope"}
    )
    msg = await client.receive_json()

    assert msg["success"] is False
    assert msg["error"]["code"] == "not_found"


async def test_non_owner_cannot_save(
    hass: HomeAssistant, setup_entry, hass_ws_client, hass_read_only_access_token
) -> None:
    """Non-admin, non-owner cannot save someone else's recording."""
    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"a",
        extension="wav",
        duration=1,
        user_id="some_other_user_id",
        temporary=True,
    )

    client = await hass_ws_client(hass, hass_read_only_access_token)
    await client.send_json(
        {"id": 1, "type": "hass_broadcast/save", "message_id": message_id}
    )
    msg = await client.receive_json()

    assert msg["success"] is False
    assert msg["error"]["code"] == "not_authorized"
    assert await store.async_list() == []
    stored = await store.async_get(message_id)
    assert stored is not None
    assert stored["temporary"] is True
    store.async_shutdown()


async def test_send_extends_a_temporary_deadline(
    hass: HomeAssistant, setup_entry, hass_ws_client, freezer: FrozenDateTimeFactory
) -> None:
    """Sending restarts a temporary recording's TTL, so a replay still works."""
    store = setup_entry.runtime_data.store
    message_id = await store.async_add(
        b"a", extension="wav", duration=1, user_id=None, temporary=True
    )

    client = await hass_ws_client(hass)
    with patch(
        "custom_components.hass_broadcast.websocket.async_broadcast",
        return_value=[],
    ):
        freezer.tick(timedelta(seconds=500))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()
        await client.send_json(
            {
                "id": 1,
                "type": "hass_broadcast/send",
                "message_id": message_id,
                "targets": ["media_player.kitchen"],
            }
        )
        assert (await client.receive_json())["success"] is True

    freezer.tick(timedelta(seconds=400))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert await store.async_get(message_id) is not None
    store.async_shutdown()

"""Tests for the websocket commands."""

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_broadcast import DATA_STORE
from custom_components.hass_broadcast.const import DOMAIN


@pytest.fixture
async def setup_entry(hass: HomeAssistant) -> MockConfigEntry:
    """Set up the integration."""
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_list_returns_recordings_newest_first(
    hass: HomeAssistant, setup_entry, hass_ws_client
) -> None:
    """The list command returns stored recordings, newest first."""
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
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
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    message_id = await store.async_add(
        b"a", extension="wav", duration=1, user_id=None
    )

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

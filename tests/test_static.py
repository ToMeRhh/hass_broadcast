"""Tests for static asset serving."""

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


async def test_chime_is_served(
    hass: HomeAssistant, setup_entry, hass_client_no_auth
) -> None:
    """The chime is reachable without auth so any player can fetch it."""
    client = await hass_client_no_auth()
    resp = await client.get("/api/hass_broadcast/static/chime.wav")
    assert resp.status == HTTPStatus.OK


async def test_card_module_is_registered(hass: HomeAssistant, setup_entry) -> None:
    """The card JS is registered as a frontend extra module."""
    from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL

    manager = hass.data.get(DATA_EXTRA_MODULE_URL)
    assert manager is not None
    assert any("hass-broadcast-card.js" in url for url in manager.urls)

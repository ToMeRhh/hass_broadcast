"""The Voice Broadcast integration."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import CONF_RETENTION, DEFAULT_RETENTION, DOMAIN
from .http import async_register_views
from .playback import async_register_services
from .storage import BroadcastStore
from .websocket import async_register_websocket_commands

DATA_STORE = "store"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Voice Broadcast from a config entry."""
    store = BroadcastStore(
        hass, retention=entry.options.get(CONF_RETENTION, DEFAULT_RETENTION)
    )
    await store.async_load()
    async_register_views(hass)
    async_register_services(hass)
    async_register_websocket_commands(hass)
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = {DATA_STORE: store}
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    hass.data[DOMAIN].pop(entry.entry_id, None)
    return True


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the entry when options change."""
    await hass.config_entries.async_reload(entry.entry_id)

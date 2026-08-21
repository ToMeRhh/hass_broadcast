"""The Voice Broadcast integration."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import CONF_RETENTION, DEFAULT_RETENTION, DOMAIN
from .http import async_register_views
from .playback import async_register_services
from .storage import BroadcastStore
from .websocket import async_register_websocket_commands

DATA_STORE = "store"

STATIC_URL = "/api/hass_broadcast/static"
CARD_URL = f"{STATIC_URL}/hass-broadcast-card.js"


async def _async_register_static(hass: HomeAssistant) -> None:
    """Serve the card, worklet and chime, and register the card module."""
    if hass.data.get(f"{DOMAIN}_static_registered"):
        return
    hass.data[f"{DOMAIN}_static_registered"] = True

    component_dir = Path(__file__).parent
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(STATIC_URL, str(component_dir / "www"), False),
            StaticPathConfig(
                f"{STATIC_URL}/chime.wav", str(component_dir / "chime.wav"), True
            ),
        ]
    )
    add_extra_js_url(hass, CARD_URL)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Voice Broadcast from a config entry."""
    store = BroadcastStore(
        hass, retention=entry.options.get(CONF_RETENTION, DEFAULT_RETENTION)
    )
    await store.async_load()
    await _async_register_static(hass)
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

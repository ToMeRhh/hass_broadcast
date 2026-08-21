"""The Voice Broadcast integration."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import (
    CARD_URL,
    CHIME_URL,
    CONF_RETENTION,
    DATA_STORE,
    DEFAULT_RETENTION,
    DOMAIN,
    STATIC_URL,
)
from .http import async_register_views
from .playback import async_register_services
from .storage import BroadcastStore
from .websocket import async_register_websocket_commands


async def _async_register_static(hass: HomeAssistant) -> None:
    """Serve the card, worklet and chime, and register the card module."""
    # This sentinel deliberately lives at hass.data["hass_broadcast_static_registered"],
    # OUTSIDE hass.data[DOMAIN]. hass.data[DOMAIN] is a dict keyed by entry id
    # whose values are entry data dicts, and every store lookup takes the first
    # value in it -- putting a bare True in there would make those lookups
    # return True and fail with TypeError on the DATA_STORE subscript.
    if hass.data.get(f"{DOMAIN}_static_registered"):
        return
    hass.data[f"{DOMAIN}_static_registered"] = True

    component_dir = Path(__file__).parent
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(STATIC_URL, str(component_dir / "www"), False),
            StaticPathConfig(CHIME_URL, str(component_dir / "chime.wav"), True),
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


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Delete the recordings and metadata when the integration is removed.

    Runs after `async_unload_entry`, which has already dropped the live
    store, so this builds a throwaway one to reach the same files. Removing
    the integration and leaving every household member's voice recordings on
    disk -- and in every future backup -- is not a defensible default.
    """
    store = BroadcastStore(
        hass, retention=entry.options.get(CONF_RETENTION, DEFAULT_RETENTION)
    )
    await store.async_load()
    await store.async_remove_all()


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the entry when options change."""
    await hass.config_entries.async_reload(entry.entry_id)

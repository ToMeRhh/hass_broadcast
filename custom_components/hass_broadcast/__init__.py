"""The Voice Broadcast integration."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.const import CONF_ID, CONF_URL
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from .const import (
    CARD_URL,
    CHIME_URL,
    CONF_RETENTION,
    DEFAULT_RETENTION,
    DOMAIN,
    STATIC_URL,
)
from .http import async_register_views
from .storage import BroadcastConfigEntry, BroadcastData, BroadcastStore
from .websocket import async_register_websocket_commands

_LOGGER = logging.getLogger(__name__)

# Lovelace's own domain. Home Assistant 2025.2 replaced the plain
# `hass.data["lovelace"]` dict with a `LovelaceData` dataclass, but
# `LOVELACE_DATA` is a `HassKey` -- a `str` subclass holding this same value --
# so the lookup key is unchanged and only the container shape differs. Spelled
# out here rather than imported from `homeassistant.components.lovelace.const`
# to avoid depending on the layout of another integration's private module.
LOVELACE_DOMAIN = "lovelace"


def _lovelace_resources(hass: HomeAssistant) -> Any:
    """Return Lovelace's resource collection, or None when it has none.

    Typed `Any` on purpose. The container it comes out of is a dict before
    2025.2 and a `LovelaceData` dataclass after, and the collection is a
    storage-mode or a YAML-mode class that the callers tell apart by
    `hasattr`. Naming those classes would mean importing them from
    Lovelace's own modules, which this file avoids (see LOVELACE_DOMAIN).
    """
    data = hass.data.get(LOVELACE_DOMAIN)
    if data is None:
        return None
    if isinstance(data, dict):
        return data.get("resources")
    return getattr(data, "resources", None)


async def _async_register_card(hass: HomeAssistant) -> None:
    """Make the dashboard card module load in every frontend client.

    `add_extra_js_url` only gets the module into the index page, as a
    fire-and-forget `import()` that nothing awaits. That import does not run
    in the Home Assistant Android companion app's WebView, so the card element
    is never defined there and any dashboard using it renders "Custom element
    doesn't exist: hass-broadcast-card." -- even though the very same bundle
    imports and defines fine when fetched by hand from that same page.

    Lovelace resources are delivered over the live websocket connection
    instead, and the Lovelace panel awaits them before it creates any cards.
    That is how every HACS-installed card already loads on those clients, so
    it is the mechanism to use here too.

    The URL carries the integration version so that upgrading the integration
    changes the URL, forcing WebViews and browsers to re-fetch the bundle
    rather than serve a cached copy of the previous release.
    """
    integration = await async_get_integration(hass, DOMAIN)
    url = f"{CARD_URL}?v={integration.version}"
    collection = _lovelace_resources(hass)

    # YAML-mode Lovelace keeps resources in configuration.yaml and hands out a
    # read-only collection (no `async_create_item`), so an integration must not
    # write to it. Fall back to the index-page module there and tell the user
    # what to add if they want the more reliable delivery.
    if collection is None or not hasattr(collection, "async_create_item"):
        add_extra_js_url(hass, CARD_URL)
        if collection is not None:
            _LOGGER.info(
                "Lovelace is in YAML mode, so the Voice Broadcast card is loaded as a "
                "frontend module. If the card fails to appear on a client (notably the "
                "Android companion app), add this under lovelace/resources in "
                "configuration.yaml instead: {url: %s, type: module}",
                url,
            )
        return

    # The collection lazily loads its store; async_get_info() is what triggers
    # that, and without it async_items() reports an empty collection and we
    # would add a duplicate resource on every restart.
    await collection.async_get_info()
    for item in collection.async_items():
        if item[CONF_URL].startswith(CARD_URL):
            # Already registered -- by an earlier run, or by hand. Reuse the
            # row so upgrades re-point it instead of stacking up duplicates,
            # which would load the bundle twice and make the second evaluation
            # throw on an already-defined custom element name.
            if item[CONF_URL] != url:
                await collection.async_update_item(item[CONF_ID], {CONF_URL: url})
            return

    await collection.async_create_item({"res_type": "module", CONF_URL: url})


async def _async_unregister_card(hass: HomeAssistant) -> None:
    """Drop the Lovelace resource when the integration is removed.

    A resource pointing at a URL nothing serves any more makes every frontend
    client log a failed module load on every single page load, forever, with
    nothing in the UI explaining where it came from.
    """
    collection = _lovelace_resources(hass)
    if collection is None or not hasattr(collection, "async_delete_item"):
        return

    await collection.async_get_info()
    for item in list(collection.async_items()):
        if item[CONF_URL].startswith(CARD_URL):
            await collection.async_delete_item(item[CONF_ID])


async def _async_register_static(hass: HomeAssistant) -> None:
    """Serve the card, worklet and chime, and register the card module."""
    # This sentinel lives in hass.data, not in the entry's runtime_data,
    # because it has to outlive the entry: Home Assistant deletes runtime_data
    # on unload. It guards only the static paths. aiohttp rejects a duplicate
    # route, and there is no way to unregister one, so they are registered
    # once per Home Assistant run and survive the entry being unloaded or
    # removed. The Lovelace resource is the opposite -- it IS removed with the
    # entry -- so it must not share this guard, or re-adding the integration
    # in the same session would leave the card unregistered.
    # _async_register_card is idempotent instead.
    if not hass.data.get(f"{DOMAIN}_static_registered"):
        hass.data[f"{DOMAIN}_static_registered"] = True

        component_dir = Path(__file__).parent
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(STATIC_URL, str(component_dir / "www"), False),
                StaticPathConfig(CHIME_URL, str(component_dir / "chime.wav"), True),
            ]
        )

    await _async_register_card(hass)


async def async_setup_entry(hass: HomeAssistant, entry: BroadcastConfigEntry) -> bool:
    """Set up Voice Broadcast from a config entry."""
    store = BroadcastStore(
        hass, retention=entry.options.get(CONF_RETENTION, DEFAULT_RETENTION)
    )
    await store.async_load()
    await _async_register_static(hass)
    async_register_views(hass)
    async_register_websocket_commands(hass)
    entry.runtime_data = BroadcastData(store=store)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: BroadcastConfigEntry) -> bool:
    """Unload a config entry; Home Assistant drops its runtime_data."""
    # Expiry timers live on the event loop, not in runtime_data, so dropping
    # the store would leave them firing at a store nobody uses.
    entry.runtime_data.store.async_shutdown()
    return True


async def async_remove_entry(hass: HomeAssistant, entry: BroadcastConfigEntry) -> None:
    """Delete the recordings and metadata when the integration is removed.

    Runs after the entry is unloaded, when Home Assistant has already deleted
    its runtime_data, so this builds a throwaway store to reach the same
    files. Removing the integration and leaving every household member's
    voice recordings on disk -- and in every future backup -- is not a
    defensible default.
    """
    store = BroadcastStore(
        hass, retention=entry.options.get(CONF_RETENTION, DEFAULT_RETENTION)
    )
    await store.async_load()
    await store.async_remove_all()
    await _async_unregister_card(hass)


async def _async_update_listener(
    hass: HomeAssistant, entry: BroadcastConfigEntry
) -> None:
    """Reload the entry when options change."""
    await hass.config_entries.async_reload(entry.entry_id)

"""Tests for how the dashboard card module is delivered to the frontend.

The card used to be registered only with `add_extra_js_url`, which Home
Assistant turns into a fire-and-forget `import()` baked into the index page.
That import never ran in the Android companion app's WebView, so the card
element was never defined there and every dashboard using it rendered
"Custom element doesn't exist: hass-broadcast-card." — while the same
bundle imported and defined fine when fetched by hand from that same page.

Lovelace resources are delivered over the live websocket connection and are
awaited by the Lovelace panel before it creates any cards, which is how every
HACS-installed card on that device already loads. So the card is registered
as a resource, and `add_extra_js_url` is kept only for YAML-mode Lovelace,
where resources are user-managed and an integration must not write to them.
"""

from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_broadcast.const import CARD_URL, DOMAIN


def _resource_collection(hass: HomeAssistant):
    """Reach Lovelace's resource collection across Home Assistant versions.

    2025.2 replaced the plain `hass.data["lovelace"]` dict with a
    `LovelaceData` dataclass. `LOVELACE_DATA` is a `HassKey`, which subclasses
    `str` with the value "lovelace", so the lookup key is the same either way.
    """
    data = hass.data["lovelace"]
    return data["resources"] if isinstance(data, dict) else data.resources


async def _card_resources(hass: HomeAssistant) -> list[dict]:
    """Return the stored resources pointing at our card bundle."""
    collection = _resource_collection(hass)
    await collection.async_get_info()
    return [
        item for item in collection.async_items() if item["url"].startswith(CARD_URL)
    ]


async def _setup_entry(hass: HomeAssistant) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


@pytest.fixture
async def setup_entry(hass: HomeAssistant) -> MockConfigEntry:
    """Set up the integration with Lovelace in its default storage mode."""
    return await _setup_entry(hass)


async def test_card_is_registered_as_a_lovelace_resource(
    hass: HomeAssistant, setup_entry
) -> None:
    """The card is a Lovelace resource, not just a frontend extra module."""
    resources = await _card_resources(hass)
    assert len(resources) == 1
    assert resources[0]["type"] == "module"


async def test_card_resource_url_is_version_busted(
    hass: HomeAssistant, setup_entry
) -> None:
    """The URL carries the integration version so upgrades bust WebView caches."""
    from homeassistant.loader import async_get_integration

    integration = await async_get_integration(hass, DOMAIN)
    resources = await _card_resources(hass)
    assert resources[0]["url"] == f"{CARD_URL}?v={integration.version}"


async def test_storage_mode_does_not_also_register_an_extra_module(
    hass: HomeAssistant, setup_entry
) -> None:
    """Registering both ways would load the bundle twice from two URLs.

    The second evaluation hits `customElements.define` for the editor element,
    which throws because the name is already taken, so it must not happen.
    """
    from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL

    manager = hass.data.get(DATA_EXTRA_MODULE_URL)
    urls = manager.urls if manager is not None else set()
    assert not any("hass-broadcast-card.js" in url for url in urls)


async def test_existing_card_resource_is_updated_not_duplicated(
    hass: HomeAssistant,
) -> None:
    """A resource left over from a manual install is reused, not duplicated."""
    assert await async_setup_component(hass, "lovelace", {})
    collection = _resource_collection(hass)
    await collection.async_get_info()
    await collection.async_create_item({"res_type": "module", "url": CARD_URL})

    await _setup_entry(hass)

    resources = await _card_resources(hass)
    assert len(resources) == 1
    assert resources[0]["url"].startswith(f"{CARD_URL}?v=")


async def test_yaml_mode_falls_back_to_an_extra_module(hass: HomeAssistant) -> None:
    """YAML-mode resources are user-managed, so fall back to add_extra_js_url."""
    from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL

    assert await async_setup_component(hass, "lovelace", {"lovelace": {"mode": "yaml"}})
    await _setup_entry(hass)

    manager = hass.data.get(DATA_EXTRA_MODULE_URL)
    assert manager is not None
    assert any("hass-broadcast-card.js" in url for url in manager.urls)


async def test_card_resource_is_removed_with_the_integration(
    hass: HomeAssistant, setup_entry
) -> None:
    """A resource left behind would 404 in every client on every page load."""
    assert await _card_resources(hass)

    await hass.config_entries.async_remove(setup_entry.entry_id)
    await hass.async_block_till_done()

    assert await _card_resources(hass) == []


async def test_card_resource_returns_when_the_entry_is_re_added(
    hass: HomeAssistant, setup_entry
) -> None:
    """Re-adding the integration in the same session must restore the card.

    The static paths are registered once per Home Assistant run and guarded by
    a sentinel, but the resource is deleted on removal, so the two cannot share
    that guard.
    """
    await hass.config_entries.async_remove(setup_entry.entry_id)
    await hass.async_block_till_done()
    assert await _card_resources(hass) == []

    await _setup_entry(hass)

    assert len(await _card_resources(hass)) == 1

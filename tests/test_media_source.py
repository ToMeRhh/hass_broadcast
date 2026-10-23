"""Tests for the media source platform."""

from homeassistant.components import media_source
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_broadcast.const import DATA_STORE, DOMAIN


@pytest.fixture
async def setup_entry(hass: HomeAssistant) -> MockConfigEntry:
    """Set up the integration and media_source."""
    assert await async_setup_component(hass, "media_source", {})
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_resolves_to_signable_relative_url(
    hass: HomeAssistant, setup_entry
) -> None:
    """Resolution returns a root-relative URL with no query params."""
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    item = await media_source.async_resolve_media(
        hass, f"media-source://{DOMAIN}/{message_id}", None
    )

    assert item.url == f"/api/hass_broadcast/media/{message_id}.wav"
    assert "?" not in item.url
    assert item.mime_type == "audio/wav"


async def test_resolve_unknown_id_raises(hass: HomeAssistant, setup_entry) -> None:
    """An unknown id is unresolvable."""
    with pytest.raises(media_source.Unresolvable):
        await media_source.async_resolve_media(
            hass, f"media-source://{DOMAIN}/nope", None
        )


async def test_browse_lists_recordings(hass: HomeAssistant, setup_entry) -> None:
    """Browsing lists stored recordings as playable children."""
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    await store.async_add(b"RIFFdata", extension="wav", duration=1, user_id=None)

    browse = await media_source.async_browse_media(hass, f"media-source://{DOMAIN}")
    assert len(browse.children) == 1
    assert browse.children[0].can_play is True


async def test_browse_survives_a_corrupt_timestamp(
    hass: HomeAssistant, setup_entry
) -> None:
    """One unparseable `created` must not take down the whole listing.

    The title was built inside the children comprehension, so a single row
    whose timestamp could not be parsed raised AttributeError and made browse
    fail for every recording, not just the bad one.
    """
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    good_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )
    bad_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )
    (await store.async_get(bad_id))["created"] = "not-a-timestamp"

    browse = await media_source.async_browse_media(hass, f"media-source://{DOMAIN}")

    identifiers = {child.identifier for child in browse.children}
    assert identifiers == {good_id, bad_id}
    titles = {child.identifier: child.title for child in browse.children}
    assert titles[bad_id] == bad_id
    assert titles[good_id] != good_id

"""Tests for the broadcast service."""

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_broadcast import DATA_STORE
from custom_components.hass_broadcast.const import DOMAIN


@pytest.fixture
async def setup_entry(hass: HomeAssistant) -> MockConfigEntry:
    """Set up the integration."""
    from homeassistant.setup import async_setup_component

    assert await async_setup_component(hass, "media_source", {})
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


@pytest.fixture
def play_calls(hass: HomeAssistant):
    """Capture media_player.play_media calls."""
    from pytest_homeassistant_custom_component.common import async_mock_service

    return async_mock_service(hass, "media_player", "play_media")


async def test_send_fans_out_to_every_target(
    hass: HomeAssistant, setup_entry, play_calls
) -> None:
    """Each target receives a play_media call with the media source id."""
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    await hass.services.async_call(
        DOMAIN,
        "send",
        {
            "message_id": message_id,
            "targets": ["media_player.kitchen", "media_player.office"],
        },
        blocking=True,
    )

    assert len(play_calls) == 2
    targets = {call.data["entity_id"] for call in play_calls}
    assert targets == {"media_player.kitchen", "media_player.office"}
    # Targets are dispatched concurrently, so don't assume arrival order.
    content_ids = {call.data["media_content_id"] for call in play_calls}
    assert content_ids == {f"media-source://{DOMAIN}/{message_id}"}
    content_types = {call.data["media_content_type"] for call in play_calls}
    assert content_types == {"music"}


async def test_send_rejects_unknown_message(
    hass: HomeAssistant, setup_entry, play_calls
) -> None:
    """An unknown message id raises and plays nothing."""
    from homeassistant.exceptions import HomeAssistantError

    with pytest.raises(HomeAssistantError):
        await hass.services.async_call(
            DOMAIN,
            "send",
            {"message_id": "nope", "targets": ["media_player.kitchen"]},
            blocking=True,
        )
    assert len(play_calls) == 0


async def test_chime_mode_plays_chime_first(
    hass: HomeAssistant, setup_entry, play_calls
) -> None:
    """Chime mode issues the chime before the message."""
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    await hass.services.async_call(
        DOMAIN,
        "send",
        {
            "message_id": message_id,
            "targets": ["media_player.kitchen"],
            "mode": "chime",
        },
        blocking=True,
    )

    assert len(play_calls) == 2
    assert play_calls[0].data["media_content_id"].endswith("chime.wav")
    assert play_calls[1].data["media_content_id"] == (
        f"media-source://{DOMAIN}/{message_id}"
    )


async def test_one_failing_target_does_not_stop_the_others(
    hass: HomeAssistant, setup_entry, caplog
) -> None:
    """A target that errors is logged; remaining targets still play."""
    from homeassistant.exceptions import HomeAssistantError

    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    played: list[str] = []

    async def handler(call) -> None:
        entity_id = call.data["entity_id"]
        if entity_id == "media_player.broken":
            raise HomeAssistantError("nope")
        played.append(entity_id)

    hass.services.async_register("media_player", "play_media", handler)

    await hass.services.async_call(
        DOMAIN,
        "send",
        {
            "message_id": message_id,
            "targets": ["media_player.broken", "media_player.kitchen"],
        },
        blocking=True,
    )

    assert played == ["media_player.kitchen"]
    assert "media_player.broken" in caplog.text


async def test_one_failing_target_survives_non_home_assistant_error(
    hass: HomeAssistant, setup_entry, caplog
) -> None:
    """A target raising a non-HomeAssistantError still isolates cleanly.

    With `blocking=True`, HA's service dispatch propagates whatever a
    target handler raises without wrapping it in `HomeAssistantError` --
    e.g. a slow/unreachable Cast device can raise `TimeoutError`. This
    reproduces that: catching only `HomeAssistantError` would let this
    abort the whole broadcast and leave later targets silent.
    """
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    played: list[str] = []

    async def handler(call) -> None:
        entity_id = call.data["entity_id"]
        if entity_id == "media_player.broken":
            raise TimeoutError("device did not respond")
        played.append(entity_id)

    hass.services.async_register("media_player", "play_media", handler)

    await hass.services.async_call(
        DOMAIN,
        "send",
        {
            "message_id": message_id,
            "targets": ["media_player.broken", "media_player.kitchen"],
        },
        blocking=True,
    )

    assert played == ["media_player.kitchen"]
    assert "media_player.broken" in caplog.text

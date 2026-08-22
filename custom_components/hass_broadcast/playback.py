"""The hass_broadcast.send service."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

import voluptuous as vol

from homeassistant.components.media_player import (
    ATTR_MEDIA_ANNOUNCE,
    ATTR_MEDIA_CONTENT_ID,
    ATTR_MEDIA_CONTENT_TYPE,
    DOMAIN as MEDIA_PLAYER_DOMAIN,
    SERVICE_PLAY_MEDIA,
    MediaPlayerEntityFeature,
    MediaType,
)
from homeassistant.const import ATTR_ENTITY_ID, ATTR_SUPPORTED_FEATURES
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
)
from homeassistant.exceptions import HomeAssistantError
import homeassistant.helpers.config_validation as cv

from .const import CHIME_URL, DOMAIN, MODE_CHIME, MODE_PLAIN, MODE_RESTORE, MODES
from .storage import async_get_store

_LOGGER = logging.getLogger(__name__)

SERVICE_SEND = "send"

# The chime asset (Step 1) is two tones totaling 0.12 + 0.18 = 0.3s.
CHIME_DURATION_S = 0.3
# Heuristic margin for dispatch/start latency between issuing the chime
# play_media call and the speaker audibly finishing it. `blocking=True` only
# confirms the command was accepted, not that playback completed, so this is
# a timing guess, not a completion guarantee. Polling for actual playback
# state is out of scope here.
CHIME_LATENCY_MARGIN_S = 0.3
CHIME_GAP_S = CHIME_DURATION_S + CHIME_LATENCY_MARGIN_S

# Extra wait before restore mode puts the volume back, on top of the
# message's own duration -- the same dispatch-latency guess as the chime gap.
RESTORE_TAIL_MARGIN_S = 1

SEND_SCHEMA = vol.Schema(
    {
        vol.Required("message_id"): cv.string,
        vol.Required("targets"): vol.All(cv.ensure_list, [cv.entity_id]),
        vol.Optional("mode", default=MODE_PLAIN): vol.In(MODES),
    }
)


def _supports_announce(state: Any | None) -> bool:
    """Return whether this target implements native announce.

    Read from the entity's advertised `supported_features` rather than from
    its platform: the capability varies by integration (Sonos, Music
    Assistant and ESPHome media players implement it, Cast does not), and
    matching on device type would go stale every time an integration gains
    support. The card already picks targets the same way, off the PLAY_MEDIA
    bit.
    """
    if state is None:
        return False
    features = state.attributes.get(ATTR_SUPPORTED_FEATURES) or 0
    return bool(features & MediaPlayerEntityFeature.MEDIA_ANNOUNCE)


async def _async_play(
    hass: HomeAssistant,
    entity_id: str,
    content_id: str,
    announce: bool = False,
) -> None:
    """Issue one play_media call."""
    data: dict[str, Any] = {
        ATTR_ENTITY_ID: entity_id,
        ATTR_MEDIA_CONTENT_ID: content_id,
        ATTR_MEDIA_CONTENT_TYPE: MediaType.MUSIC,
    }
    # Only set when announcing: passing announce=False explicitly is not the
    # same as omitting it for every integration, and plain broadcasts must
    # keep behaving exactly as they did.
    if announce:
        data[ATTR_MEDIA_ANNOUNCE] = True
    await hass.services.async_call(
        MEDIA_PLAYER_DOMAIN,
        SERVICE_PLAY_MEDIA,
        data,
        blocking=True,
    )


async def _async_send_to_target(
    hass: HomeAssistant,
    entity_id: str,
    content_id: str,
    mode: str,
    duration: float,
) -> None:
    """Play a message on one target according to the mode."""
    state = hass.states.get(entity_id)

    # Restore mode means "duck, play, put it back". Where the target's own
    # integration implements that, let it: the device knows when playback
    # actually ended, while the fallback below can only guess from the
    # message duration and sleep. Prefer the native path and skip the
    # snapshot entirely, so the two mechanisms never both act on one target.
    announce = mode == MODE_RESTORE and _supports_announce(state)

    snapshot: dict[str, Any] | None = None
    if mode == MODE_RESTORE and not announce and state is not None:
        snapshot = {
            "volume": state.attributes.get("volume_level"),
            "state": state.state,
        }

    if mode == MODE_CHIME:
        await _async_play(hass, entity_id, CHIME_URL)
        await asyncio.sleep(CHIME_GAP_S)

    await _async_play(hass, entity_id, content_id, announce=announce)

    if snapshot is not None:
        # Dispatch-and-return: the tail waits out the whole message, so
        # awaiting it here would keep the service call open for
        # `duration + 1` seconds and pin the card at phase = "sending" for a
        # minute on a one-minute recording -- with a websocket reconnect in
        # that window making the card report a failure for a broadcast that
        # actually played, inviting a duplicate send. Playback has already
        # been dispatched at this point, so the caller has its answer.
        hass.async_create_task(
            _async_restore_tail(hass, entity_id, snapshot, duration),
            f"{DOMAIN} restore {entity_id}",
        )


async def _async_restore_tail(
    hass: HomeAssistant,
    entity_id: str,
    snapshot: dict[str, Any],
    duration: float,
) -> None:
    """Wait out the message, then restore volume and best-effort resume.

    Runs detached from the service call, so it owns its own error handling:
    the same broad catch as `_async_send_to_target_isolated` (see its
    docstring for why `Exception` and not `HomeAssistantError`), because an
    escaping exception here would be an unhandled task exception rather than
    a failure attributed to a target. `BaseException` stays uncaught so
    shutdown cancellation still propagates.

    A failure here is deliberately NOT reported in the service's `failed`
    list: the message did play on this target: only putting the volume back
    went wrong, and the send response has long since been returned.
    """
    try:
        await asyncio.sleep(duration + RESTORE_TAIL_MARGIN_S)
        if snapshot["volume"] is not None:
            await hass.services.async_call(
                MEDIA_PLAYER_DOMAIN,
                "volume_set",
                {ATTR_ENTITY_ID: entity_id, "volume_level": snapshot["volume"]},
                blocking=True,
            )
        if snapshot["state"] == "playing":
            # Best effort only: this path exists precisely because the target
            # has no native announce, and such players (Cast among them)
            # cannot reliably resume an interrupted app session.
            await hass.services.async_call(
                MEDIA_PLAYER_DOMAIN,
                "media_play",
                {ATTR_ENTITY_ID: entity_id},
                blocking=False,
            )
    except Exception as err:  # noqa: BLE001 - detached task, must not escape
        _LOGGER.error("Restoring %s after the broadcast failed: %s", entity_id, err)


async def _async_send_to_target_isolated(
    hass: HomeAssistant,
    entity_id: str,
    content_id: str,
    mode: str,
    duration: float,
) -> str | None:
    """Play on one target, isolating its failures from the other targets.

    Returns the entity id when that target failed, or None on success, so the
    caller can report which targets failed instead of silently swallowing
    them: broadcasting to three unreachable speakers must not look like a
    success to the card.

    Broad `except Exception` is deliberate: with `blocking=True`,
    `ServiceRegistry._execute_service` propagates whatever a target service
    raises without wrapping it in `HomeAssistantError`. A slow or
    unreachable Cast device can raise `TimeoutError` (-> `OSError` ->
    `Exception`), and malformed call data can raise `vol.Invalid` (->
    `voluptuous.error.Error` -> `Exception`) -- neither is a
    `HomeAssistantError`. The partial-failure guarantee ("remaining targets
    still play") is unqualified, so the catch must cover any target
    failure. `BaseException` (e.g. `asyncio.CancelledError`) is
    deliberately NOT caught here so shutdown/cancellation still propagates.
    """
    try:
        await _async_send_to_target(hass, entity_id, content_id, mode, duration)
    except Exception as err:  # noqa: BLE001 - intentional broad isolation
        _LOGGER.error("Broadcast to %s failed: %s", entity_id, err)
        return entity_id
    return None


async def _async_handle_send(call: ServiceCall) -> ServiceResponse:
    """Handle hass_broadcast.send.

    Returns `{"failed": [entity_id, ...]}` -- empty when every target played.
    The response is what lets the card surface per-target results instead of
    reporting success for a broadcast nobody heard.
    """
    hass = call.hass
    store = async_get_store(hass)
    if store is None:
        raise HomeAssistantError("Voice Broadcast is not set up")

    message_id = call.data["message_id"]
    message = await store.async_get(message_id)
    if message is None:
        raise HomeAssistantError(f"Unknown recording {message_id}")

    content_id = f"media-source://{DOMAIN}/{message_id}"
    mode = call.data["mode"]
    duration = float(message.get("duration") or 0)

    # Dispatched concurrently: sequential dispatch means each target's own
    # mode-driven delay (the chime gap) stacks on top of every earlier
    # target's, turning a broadcast into a slow relay. Each coroutine keeps
    # its own try/except (above) so one target's failure cannot cancel or
    # otherwise affect the others. Restore's post-playback wait is not in
    # this gather at all — it runs as a detached task per target.
    results = await asyncio.gather(
        *(
            _async_send_to_target_isolated(hass, entity_id, content_id, mode, duration)
            for entity_id in call.data["targets"]
        )
    )
    return {"failed": [entity_id for entity_id in results if entity_id is not None]}


def async_register_services(hass: HomeAssistant) -> None:
    """Register the broadcast services."""
    if hass.services.has_service(DOMAIN, SERVICE_SEND):
        return
    hass.services.async_register(
        DOMAIN,
        SERVICE_SEND,
        _async_handle_send,
        schema=SEND_SCHEMA,
        # OPTIONAL, not ONLY: the card asks for the response so it can report
        # per-target failures, while automations that just want the broadcast
        # can keep calling the service without `return_response`.
        supports_response=SupportsResponse.OPTIONAL,
    )

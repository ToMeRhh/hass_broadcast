"""Expose recordings as a media source."""

from __future__ import annotations

from dataclasses import fields
from pathlib import Path
from typing import Any

from homeassistant.components.media_player import MediaClass, MediaType
from homeassistant.components.media_source import (
    BrowseMediaSource,
    MediaSource,
    MediaSourceItem,
    PlayMedia,
    Unresolvable,
)
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import CHIME_ID, CHIME_URL, DOMAIN
from .http import CONTENT_TYPES
from .storage import async_get_store

CHIME_PATH = Path(__file__).parent / "chime.wav"

# `PlayMedia.path` is Home Assistant 2025.10+. Older releases reject the
# keyword, and their players only ever fetch the URL anyway.
_PLAY_MEDIA_HAS_PATH = any(field.name == "path" for field in fields(PlayMedia))


def _play_media(url: str, mime_type: str, path: Path) -> PlayMedia:
    """Return a PlayMedia that also names the file on disk, where supported.

    The Apple TV integration (2026.6+), which is how HomePods are reached,
    streams `path` from disk when it is set. Without it, pyatv downloads the
    URL from Home Assistant itself and verifies TLS against the system's CA
    store, so on an install served over https with a locally issued
    certificate nothing plays. Every other player ignores `path`.
    """
    if _PLAY_MEDIA_HAS_PATH:
        return PlayMedia(url, mime_type, path=path)
    return PlayMedia(url, mime_type)


def _title(message: dict[str, Any]) -> str:
    """Return a display title for a recording.

    One unparseable `created` must not take down browse for every other
    recording: `parse_datetime` returns None for anything it cannot read, and
    calling `.strftime` on that inside the children comprehension would raise
    AttributeError for the whole listing. Fall back to the id, which is always
    present and still identifies the row.
    """
    created = dt_util.parse_datetime(message.get("created") or "")
    if created is None:
        return str(message["id"])
    return created.strftime("%Y-%m-%d %H:%M:%S")


async def async_get_media_source(hass: HomeAssistant) -> BroadcastMediaSource:
    """Set up the media source."""
    return BroadcastMediaSource(hass)


class BroadcastMediaSource(MediaSource):
    """Provide recorded voice messages."""

    name = "Voice Broadcast"

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the media source."""
        super().__init__(DOMAIN)
        self.hass = hass

    async def async_resolve_media(self, item: MediaSourceItem) -> PlayMedia:
        """Resolve a recording, or the chime, to a playable URL."""
        if item.identifier == CHIME_ID:
            return _play_media(CHIME_URL, "audio/wav", CHIME_PATH)

        store = async_get_store(self.hass)
        if store is None:
            raise Unresolvable("Voice Broadcast is not set up")

        message = await store.async_get(item.identifier)
        if message is None:
            raise Unresolvable(f"Unknown recording {item.identifier}")

        path = await store.async_path(message["id"])
        if path is None:
            raise Unresolvable(f"Unknown recording {item.identifier}")

        extension = message["extension"]
        return _play_media(
            f"/api/hass_broadcast/media/{message['id']}.{extension}",
            CONTENT_TYPES.get(extension, "audio/wav"),
            path,
        )

    async def async_browse_media(self, item: MediaSourceItem) -> BrowseMediaSource:
        """List stored recordings."""
        store = async_get_store(self.hass)
        messages = await store.async_list() if store else []

        children = [
            BrowseMediaSource(
                domain=DOMAIN,
                identifier=message["id"],
                media_class=MediaClass.MUSIC,
                media_content_type=CONTENT_TYPES.get(message["extension"], "audio/wav"),
                title=_title(message),
                can_play=True,
                can_expand=False,
            )
            for message in messages
        ]

        return BrowseMediaSource(
            domain=DOMAIN,
            identifier=None,
            media_class=MediaClass.DIRECTORY,
            media_content_type=MediaType.MUSIC,
            title="Voice Broadcast",
            can_play=False,
            can_expand=True,
            children=children,
            children_media_class=MediaClass.MUSIC,
        )

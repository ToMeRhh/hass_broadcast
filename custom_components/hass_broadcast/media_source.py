"""Expose recordings as a media source."""

from __future__ import annotations

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

from .const import DOMAIN
from .http import CONTENT_TYPES


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

    def _store(self):
        """Return the store, or None when not set up."""
        from . import DATA_STORE

        entry_data = next(iter(self.hass.data.get(DOMAIN, {}).values()), None)
        return entry_data[DATA_STORE] if entry_data else None

    async def async_resolve_media(self, item: MediaSourceItem) -> PlayMedia:
        """Resolve a recording to a playable URL."""
        store = self._store()
        if store is None:
            raise Unresolvable("Voice Broadcast is not set up")

        message = await store.async_get(item.identifier)
        if message is None:
            raise Unresolvable(f"Unknown recording {item.identifier}")

        extension = message["extension"]
        return PlayMedia(
            f"/api/hass_broadcast/media/{message['id']}.{extension}",
            CONTENT_TYPES.get(extension, "audio/wav"),
        )

    async def async_browse_media(self, item: MediaSourceItem) -> BrowseMediaSource:
        """List stored recordings."""
        store = self._store()
        messages = await store.async_list() if store else []

        children = [
            BrowseMediaSource(
                domain=DOMAIN,
                identifier=message["id"],
                media_class=MediaClass.MUSIC,
                media_content_type=CONTENT_TYPES.get(
                    message["extension"], "audio/wav"
                ),
                title=dt_util.parse_datetime(message["created"]).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
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

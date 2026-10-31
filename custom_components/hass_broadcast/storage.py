"""File and metadata storage for hass_broadcast."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
import logging
from pathlib import Path
from typing import Any
import uuid

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN, STORAGE_DIR, STORAGE_KEY, STORAGE_VERSION, TEMPORARY_TTL

_LOGGER = logging.getLogger(__name__)


@dataclass
class BroadcastData:
    """What a loaded config entry holds, as its `runtime_data`."""

    store: BroadcastStore


# Defined here rather than in __init__.py so that http, media_source and
# websocket can import it alongside async_get_store without a cycle.
type BroadcastConfigEntry = ConfigEntry[BroadcastData]


@callback
def async_get_store(hass: HomeAssistant) -> BroadcastStore | None:
    """Return the store for the single config entry, or None when not set up.

    Only one entry can exist -- the config flow calls
    `_abort_if_unique_id_configured`. The callers (http, media_source and
    websocket) are handed `hass`, not an entry, so this is the one place
    that finds it.
    """
    entries: list[BroadcastConfigEntry] = hass.config_entries.async_loaded_entries(
        DOMAIN
    )
    return entries[0].runtime_data.store if entries else None


class BroadcastStore:
    """Own the recordings directory and its metadata."""

    def __init__(self, hass: HomeAssistant, retention: int) -> None:
        """Initialize the store."""
        self.hass = hass
        self.retention = retention
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._messages: list[dict[str, Any]] = []
        self._dir = Path(hass.config.path(STORAGE_DIR))
        # Cancel handles for the expiry timers of temporary recordings.
        self._expiry: dict[str, CALLBACK_TYPE] = {}

    async def async_load(self) -> None:
        """Load metadata and ensure the directory exists.

        Temporary recordings do not survive a restart: their timers did not,
        so nothing would ever expire them.
        """
        data = await self._store.async_load()
        messages = list(data["messages"]) if data else []
        self._messages = [m for m in messages if not m.get("temporary")]
        leftovers = [m for m in messages if m.get("temporary")]
        for message in leftovers:
            await self._async_unlink(self._file_path(message))
        if leftovers:
            await self._async_save()
        await self.hass.async_add_executor_job(
            lambda: self._dir.mkdir(parents=True, exist_ok=True)
        )

    def _file_path(self, message: dict[str, Any]) -> Path:
        """Return the path for a metadata entry."""
        return self._dir / f"{message['id']}.{message['extension']}"

    async def _async_save(self) -> None:
        """Persist metadata."""
        await self._store.async_save({"messages": self._messages})

    async def async_add(
        self,
        data: bytes,
        *,
        extension: str,
        duration: float,
        user_id: str | None,
        temporary: bool = False,
    ) -> str:
        """Store a recording and return its id.

        A temporary recording is hidden from the list and expires after
        `TEMPORARY_TTL` unless it is kept first.
        """
        message_id = uuid.uuid4().hex
        message = {
            "id": message_id,
            "created": dt_util.utcnow().isoformat(),
            "duration": duration,
            "user_id": user_id,
            "extension": extension,
        }
        # Absent on saved entries, so stored data stays version 1.
        if temporary:
            message["temporary"] = True
        path = self._file_path(message)
        await self.hass.async_add_executor_job(path.write_bytes, data)

        self._messages.append(message)
        if temporary:
            self._schedule_expiry(message_id)
        await self._async_prune()
        await self._async_save()
        return message_id

    def _schedule_expiry(self, message_id: str) -> None:
        """(Re)start the expiry timer for a temporary recording."""
        self._cancel_expiry(message_id)

        # @callback, or Home Assistant would run it in the executor, where
        # creating a task is not allowed.
        @callback
        def _expire(_now: datetime) -> None:
            self.hass.async_create_task(self._async_expire(message_id))

        self._expiry[message_id] = async_call_later(self.hass, TEMPORARY_TTL, _expire)

    def _cancel_expiry(self, message_id: str) -> None:
        """Cancel a recording's expiry timer, if it has one."""
        if cancel := self._expiry.pop(message_id, None):
            cancel()

    async def _async_expire(self, message_id: str) -> None:
        """Delete a recording whose timer ran out, if it is still temporary."""
        self._expiry.pop(message_id, None)
        message = await self.async_get(message_id)
        if message is not None and message.get("temporary"):
            await self.async_delete(message_id)

    async def async_touch(self, message_id: str) -> None:
        """Restart a temporary recording's TTL; a no-op for anything else."""
        message = await self.async_get(message_id)
        if message is not None and message.get("temporary"):
            self._schedule_expiry(message_id)

    async def async_keep(self, message_id: str) -> bool:
        """Save a temporary recording as the newest one.

        Returns False for an unknown id. Keeping a recording that is already
        saved changes nothing and returns True.
        """
        message = await self.async_get(message_id)
        if message is None:
            return False
        if not message.get("temporary"):
            return True
        self._cancel_expiry(message_id)
        del message["temporary"]
        # Newest position, as if it had been recorded just now.
        self._messages.remove(message)
        self._messages.append(message)
        await self._async_prune()
        await self._async_save()
        return True

    @callback
    def async_shutdown(self) -> None:
        """Cancel every expiry timer."""
        for cancel in self._expiry.values():
            cancel()
        self._expiry.clear()

    async def _async_prune(self) -> None:
        """Drop the oldest saved recordings beyond the retention limit.

        Temporaries neither count nor get dropped: they have their own timer.
        """
        saved = [m for m in self._messages if not m.get("temporary")]
        for oldest in saved[: max(0, len(saved) - self.retention)]:
            self._messages.remove(oldest)
            await self._async_unlink(self._file_path(oldest))

    async def _async_unlink(self, path: Path) -> None:
        """Delete a file, tolerating its absence."""

        def _unlink() -> None:
            try:
                path.unlink()
            except FileNotFoundError:
                pass
            except OSError:
                _LOGGER.warning("Could not delete recording %s", path)

        await self.hass.async_add_executor_job(_unlink)

    async def async_list(self) -> list[dict[str, Any]]:
        """Return saved metadata, newest first; temporaries are not listed."""
        return [m for m in reversed(self._messages) if not m.get("temporary")]

    async def async_get(self, message_id: str) -> dict[str, Any] | None:
        """Return one metadata entry."""
        return next((m for m in self._messages if m["id"] == message_id), None)

    async def async_path(self, message_id: str) -> Path | None:
        """Return the file path for a recording."""
        message = await self.async_get(message_id)
        return self._file_path(message) if message else None

    async def async_delete(self, message_id: str) -> bool:
        """Delete a recording. Returns False if it did not exist."""
        message = await self.async_get(message_id)
        if message is None:
            return False
        self._cancel_expiry(message_id)
        await self._async_unlink(self._file_path(message))
        self._messages.remove(message)
        await self._async_save()
        return True

    async def async_remove_all(self) -> None:
        """Delete every recording and the metadata store itself.

        Called when the config entry is removed. Without it, uninstalling the
        integration would silently leave every voice recording in
        `<config>/hass_broadcast/` and its metadata in
        `.storage/hass_broadcast` -- and therefore in every subsequent backup.
        """
        self.async_shutdown()
        for message in list(self._messages):
            await self._async_unlink(self._file_path(message))
        self._messages = []
        await self._store.async_remove()
        await self.hass.async_add_executor_job(self._remove_dir)

    def _remove_dir(self) -> None:
        """Remove the recordings directory if nothing else is left in it.

        `rmdir`, never a recursive delete: the directory is ours by
        convention, not by guarantee, and anything a user put there must not
        be swept away by an uninstall.
        """
        try:
            self._dir.rmdir()
        except OSError:
            _LOGGER.debug("Left %s in place: it is missing or not empty", self._dir)

"""File and metadata storage for hass_broadcast."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any
import uuid

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import STORAGE_DIR, STORAGE_KEY, STORAGE_VERSION

_LOGGER = logging.getLogger(__name__)


class BroadcastStore:
    """Own the recordings directory and its metadata."""

    def __init__(self, hass: HomeAssistant, retention: int) -> None:
        """Initialize the store."""
        self.hass = hass
        self.retention = retention
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._messages: list[dict[str, Any]] = []
        self._dir = Path(hass.config.path(STORAGE_DIR))

    async def async_load(self) -> None:
        """Load metadata and ensure the directory exists."""
        data = await self._store.async_load()
        self._messages = list(data["messages"]) if data else []
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
    ) -> str:
        """Store a recording and return its id."""
        message_id = uuid.uuid4().hex
        message = {
            "id": message_id,
            "created": dt_util.utcnow().isoformat(),
            "duration": duration,
            "user_id": user_id,
            "extension": extension,
        }
        path = self._file_path(message)
        await self.hass.async_add_executor_job(path.write_bytes, data)

        self._messages.append(message)
        await self._async_prune()
        await self._async_save()
        return message_id

    async def _async_prune(self) -> None:
        """Drop the oldest recordings beyond the retention limit."""
        while len(self._messages) > self.retention:
            oldest = self._messages.pop(0)
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
        """Return metadata, newest first."""
        return list(reversed(self._messages))

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
        await self._async_unlink(self._file_path(message))
        self._messages.remove(message)
        await self._async_save()
        return True

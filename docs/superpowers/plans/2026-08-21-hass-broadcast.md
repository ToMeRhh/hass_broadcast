# hass_broadcast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record a voice message in the Home Assistant UI and broadcast it to one or more media players chosen in the card.

**Architecture:** A HACS-installable custom integration owns storage, retention, HTTP serving, and playback, and serves the Lovelace card and its audio worklet as static assets. The card captures Int16 PCM via `AudioWorklet`, wraps it in a WAV container client-side, and uploads it. The integration exposes recordings through a `MediaSource` so `media_player.play_media` resolves them to a root-relative URL that Home Assistant signs automatically.

**Tech Stack:** Python 3.12+ (Home Assistant custom component, no external Python dependencies), `pytest-homeassistant-custom-component`; TypeScript + Lit + esbuild for the card, Vitest for frontend tests.

**Spec:** `docs/superpowers/specs/2026-08-21-hass-broadcast-design.md`

## Global Constraints

Every task's requirements implicitly include this section. Values are copied verbatim from the spec.

- **Domain:** `hass_broadcast`. Storage directory: `<config>/hass_broadcast/`. **Not** the `local` media dir — behaviour must not depend on the user's `media_dirs` configuration.
- **Audio format:** WAV/LPCM, 16 kHz, mono, 16-bit by default. MP3 only when `ffmpeg` is present on PATH. Both are Cast-safe. **ffmpeg is an optimization, never a dependency** — its absence must be non-fatal.
- **Opus is forbidden as a wire format.** Cast lists Opus as supported but in practice only inside a WebM video container. This is why `MediaRecorder` is not used.
- **Uploads are authenticated but NOT admin-gated.** Do not use `@require_admin` on the upload view. This is deliberate: HA's own `UploadMediaView` is admin-only, which would break the card for non-admin household members.
- **Never serve recordings from `config/www/` or `/local/`.** `/local/` is in `PATHS_WITHOUT_AUTH` and is served unsigned and unauthenticated.
- **`plain` is the default playback mode.** Cast does not implement `MEDIA_ANNOUNCE`; there is no native ducking or resume.
- **Retention default:** keep the last 10 messages. Pruning is enforced server-side on every upload.
- **No external Python dependencies.** `manifest.json` `requirements` stays `[]`.
- **Python code is fully async.** No blocking I/O on the event loop — file and `subprocess` work goes through `hass.async_add_executor_job`.

---

### Task 1: Repository scaffolding and a loadable integration

**Files:**
- Create: `custom_components/hass_broadcast/__init__.py`
- Create: `custom_components/hass_broadcast/manifest.json`
- Create: `custom_components/hass_broadcast/const.py`
- Create: `custom_components/hass_broadcast/config_flow.py`
- Create: `custom_components/hass_broadcast/strings.json`
- Create: `custom_components/hass_broadcast/translations/en.json`
- Create: `hacs.json`
- Create: `requirements_test.txt`
- Create: `tests/conftest.py`
- Create: `tests/test_init.py`
- Create: `.gitignore`

**Interfaces:**
- Consumes: nothing.
- Produces: `DOMAIN = "hass_broadcast"`, `STORAGE_DIR = "hass_broadcast"`, `CONF_RETENTION = "retention"`, `DEFAULT_RETENTION = 10`, `MAX_UPLOAD_BYTES = 10 * 1024 * 1024`. A config entry that sets up and unloads cleanly. `hass.data[DOMAIN][entry.entry_id]` is a dict later tasks populate.

- [ ] **Step 1: Create the test scaffolding and .gitignore**

`requirements_test.txt`:
```
pytest-homeassistant-custom-component
```

`.gitignore`:
```
__pycache__/
*.pyc
.pytest_cache/
node_modules/
frontend/dist/
custom_components/hass_broadcast/www/*.js
```

`tests/conftest.py`:
```python
"""Fixtures for hass_broadcast tests."""

import pytest

pytest_plugins = "pytest_homeassistant_custom_component.plugins"


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable loading custom integrations in all tests."""
    return
```

- [ ] **Step 2: Write the failing test**

`tests/test_init.py`:
```python
"""Tests for hass_broadcast setup."""

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_broadcast.const import DOMAIN


async def test_setup_and_unload(hass: HomeAssistant) -> None:
    """The config entry sets up and unloads cleanly."""
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.LOADED

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.NOT_LOADED
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pytest tests/test_init.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'custom_components.hass_broadcast.const'`

- [ ] **Step 4: Write the minimal implementation**

`custom_components/hass_broadcast/const.py`:
```python
"""Constants for hass_broadcast."""

DOMAIN = "hass_broadcast"

STORAGE_DIR = "hass_broadcast"
STORAGE_KEY = "hass_broadcast"
STORAGE_VERSION = 1

CONF_RETENTION = "retention"
DEFAULT_RETENTION = 10

MAX_UPLOAD_BYTES = 10 * 1024 * 1024

MODE_PLAIN = "plain"
MODE_RESTORE = "restore"
MODE_CHIME = "chime"
MODES = [MODE_PLAIN, MODE_RESTORE, MODE_CHIME]
```

`custom_components/hass_broadcast/manifest.json`:
```json
{
  "domain": "hass_broadcast",
  "name": "Voice Broadcast",
  "codeowners": [],
  "config_flow": true,
  "dependencies": ["http", "media_source", "media_player", "websocket_api", "frontend"],
  "documentation": "https://github.com/ToMeRhh/hass_broadcast",
  "integration_type": "service",
  "iot_class": "local_push",
  "requirements": [],
  "version": "0.1.0"
}
```

`custom_components/hass_broadcast/__init__.py`:
```python
"""The Voice Broadcast integration."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Voice Broadcast from a config entry."""
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = {}
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    hass.data[DOMAIN].pop(entry.entry_id, None)
    return True
```

`custom_components/hass_broadcast/config_flow.py`:
```python
"""Config flow for Voice Broadcast."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import (
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlowWithReload,
)

from .const import CONF_RETENTION, DEFAULT_RETENTION, DOMAIN

OPTIONS_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_RETENTION, default=DEFAULT_RETENTION): vol.All(
            int, vol.Range(min=1, max=200)
        ),
    }
)


class BroadcastConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the config flow."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        return self.async_create_entry(title="Voice Broadcast", data={})

    @staticmethod
    def async_get_options_flow(config_entry) -> BroadcastOptionsFlow:
        """Return the options flow."""
        return BroadcastOptionsFlow()


class BroadcastOptionsFlow(OptionsFlowWithReload):
    """Handle the options flow."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(data=user_input)
        return self.async_show_form(
            step_id="init",
            data_schema=self.add_suggested_values_to_schema(
                OPTIONS_SCHEMA, self.config_entry.options
            ),
        )
```

`custom_components/hass_broadcast/strings.json`:
```json
{
  "config": {
    "step": {
      "user": {
        "title": "Voice Broadcast",
        "description": "Record voice messages in the dashboard and play them on your speakers."
      }
    },
    "abort": {
      "already_configured": "Voice Broadcast is already set up."
    }
  },
  "options": {
    "step": {
      "init": {
        "data": {
          "retention": "Number of recordings to keep"
        },
        "data_description": {
          "retention": "Older recordings are deleted automatically when this limit is exceeded."
        }
      }
    }
  }
}
```

Copy the same content to `custom_components/hass_broadcast/translations/en.json`.

`hacs.json`:
```json
{
  "name": "Voice Broadcast",
  "render_readme": true,
  "homeassistant": "2024.10.0"
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pytest tests/test_init.py -v`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add custom_components hacs.json requirements_test.txt tests .gitignore
git commit -m "feat: scaffold hass_broadcast integration with config flow"
```

---

### Task 2: Storage — files, metadata, and retention

**Files:**
- Create: `custom_components/hass_broadcast/storage.py`
- Test: `tests/test_storage.py`

**Interfaces:**
- Consumes: `DOMAIN`, `STORAGE_DIR`, `STORAGE_KEY`, `STORAGE_VERSION`, `DEFAULT_RETENTION` from `const.py`.
- Produces: `class BroadcastStore` with `async_load() -> None`, `async_add(data: bytes, *, extension: str, duration: float, user_id: str | None) -> str` (returns message id), `async_list() -> list[dict]` (newest first), `async_delete(message_id: str) -> bool`, `async_path(message_id: str) -> Path | None`, `async_get(message_id: str) -> dict | None`, and the property `retention: int`. Metadata dict keys: `id`, `created`, `duration`, `user_id`, `extension`.

- [ ] **Step 1: Write the failing test**

`tests/test_storage.py`:
```python
"""Tests for the storage module."""

from homeassistant.core import HomeAssistant

from custom_components.hass_broadcast.storage import BroadcastStore


async def test_add_creates_file_and_metadata(hass: HomeAssistant) -> None:
    """Adding a recording writes the file and records metadata."""
    store = BroadcastStore(hass, retention=10)
    await store.async_load()

    message_id = await store.async_add(
        b"RIFFfake", extension="wav", duration=1.5, user_id="abc"
    )

    path = await store.async_path(message_id)
    assert path is not None
    assert path.read_bytes() == b"RIFFfake"

    listing = await store.async_list()
    assert len(listing) == 1
    assert listing[0]["id"] == message_id
    assert listing[0]["duration"] == 1.5
    assert listing[0]["extension"] == "wav"
    assert listing[0]["user_id"] == "abc"


async def test_list_is_newest_first(hass: HomeAssistant) -> None:
    """Listing returns newest recordings first."""
    store = BroadcastStore(hass, retention=10)
    await store.async_load()

    first = await store.async_add(b"a", extension="wav", duration=1, user_id=None)
    second = await store.async_add(b"b", extension="wav", duration=1, user_id=None)

    assert [item["id"] for item in await store.async_list()] == [second, first]


async def test_retention_prunes_oldest_and_deletes_file(hass: HomeAssistant) -> None:
    """Exceeding retention deletes the oldest recording and its file."""
    store = BroadcastStore(hass, retention=2)
    await store.async_load()

    oldest = await store.async_add(b"a", extension="wav", duration=1, user_id=None)
    oldest_path = await store.async_path(oldest)
    await store.async_add(b"b", extension="wav", duration=1, user_id=None)
    await store.async_add(b"c", extension="wav", duration=1, user_id=None)

    listing = await store.async_list()
    assert len(listing) == 2
    assert oldest not in [item["id"] for item in listing]
    assert not oldest_path.exists()


async def test_delete_removes_file_and_entry(hass: HomeAssistant) -> None:
    """Deleting removes both the metadata entry and the file."""
    store = BroadcastStore(hass, retention=10)
    await store.async_load()
    message_id = await store.async_add(b"a", extension="wav", duration=1, user_id=None)
    path = await store.async_path(message_id)

    assert await store.async_delete(message_id) is True
    assert not path.exists()
    assert await store.async_list() == []
    assert await store.async_delete(message_id) is False


async def test_path_is_none_for_unknown_id(hass: HomeAssistant) -> None:
    """An unknown id resolves to no path."""
    store = BroadcastStore(hass, retention=10)
    await store.async_load()
    assert await store.async_path("nope") is None
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_storage.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'custom_components.hass_broadcast.storage'`

- [ ] **Step 3: Write the minimal implementation**

`custom_components/hass_broadcast/storage.py`:
```python
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest tests/test_storage.py -v`
Expected: PASS (5 tests)

- [ ] **Step 5: Wire the store into setup**

Modify `custom_components/hass_broadcast/__init__.py` — replace `async_setup_entry` and `async_unload_entry`:
```python
"""The Voice Broadcast integration."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import CONF_RETENTION, DEFAULT_RETENTION, DOMAIN
from .storage import BroadcastStore

DATA_STORE = "store"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Voice Broadcast from a config entry."""
    store = BroadcastStore(
        hass, retention=entry.options.get(CONF_RETENTION, DEFAULT_RETENTION)
    )
    await store.async_load()
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = {DATA_STORE: store}
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    hass.data[DOMAIN].pop(entry.entry_id, None)
    return True
```

- [ ] **Step 6: Run the full suite**

Run: `pytest tests/ -v`
Expected: PASS (6 tests)

- [ ] **Step 7: Commit**

```bash
git add custom_components/hass_broadcast/storage.py custom_components/hass_broadcast/__init__.py tests/test_storage.py
git commit -m "feat: add recording storage with retention pruning"
```

---

### Task 3: Optional MP3 transcoding

**Files:**
- Create: `custom_components/hass_broadcast/audio_processing.py`
- Test: `tests/test_audio_processing.py`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `async_transcode_to_mp3(hass: HomeAssistant, wav_data: bytes) -> bytes | None` — returns MP3 bytes, or `None` when ffmpeg is absent or fails. Callers keep the WAV when `None` is returned.

Remember the global constraint: **ffmpeg absence must be non-fatal.**

- [ ] **Step 1: Write the failing test**

`tests/test_audio_processing.py`:
```python
"""Tests for optional MP3 transcoding."""

from unittest.mock import AsyncMock, patch

from homeassistant.core import HomeAssistant

from custom_components.hass_broadcast.audio_processing import async_transcode_to_mp3


async def test_returns_none_when_ffmpeg_missing(hass: HomeAssistant) -> None:
    """No ffmpeg on PATH means no transcode, and no exception."""
    with patch(
        "custom_components.hass_broadcast.audio_processing.shutil.which",
        return_value=None,
    ):
        assert await async_transcode_to_mp3(hass, b"RIFFfake") is None


async def test_returns_none_when_ffmpeg_fails(hass: HomeAssistant) -> None:
    """A non-zero ffmpeg exit is non-fatal."""
    process = AsyncMock()
    process.communicate.return_value = (b"", b"boom")
    process.returncode = 1

    with (
        patch(
            "custom_components.hass_broadcast.audio_processing.shutil.which",
            return_value="/usr/bin/ffmpeg",
        ),
        patch(
            "custom_components.hass_broadcast.audio_processing."
            "asyncio.create_subprocess_exec",
            return_value=process,
        ),
    ):
        assert await async_transcode_to_mp3(hass, b"RIFFfake") is None


async def test_returns_mp3_bytes_on_success(hass: HomeAssistant) -> None:
    """A successful ffmpeg run returns the encoded bytes."""
    process = AsyncMock()
    process.communicate.return_value = (b"ID3mp3data", b"")
    process.returncode = 0

    with (
        patch(
            "custom_components.hass_broadcast.audio_processing.shutil.which",
            return_value="/usr/bin/ffmpeg",
        ),
        patch(
            "custom_components.hass_broadcast.audio_processing."
            "asyncio.create_subprocess_exec",
            return_value=process,
        ),
    ):
        assert await async_transcode_to_mp3(hass, b"RIFFfake") == b"ID3mp3data"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_audio_processing.py -v`
Expected: FAIL — module does not exist

- [ ] **Step 3: Write the minimal implementation**

`custom_components/hass_broadcast/audio_processing.py`:
```python
"""Optional MP3 transcoding. Never required — WAV is already Cast-safe."""

from __future__ import annotations

import asyncio
import logging
import shutil

from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)


async def async_transcode_to_mp3(hass: HomeAssistant, wav_data: bytes) -> bytes | None:
    """Transcode WAV to MP3 if ffmpeg is available.

    Returns None when ffmpeg is missing or the transcode fails; callers keep
    the original WAV, which Cast plays natively.
    """
    ffmpeg = await hass.async_add_executor_job(shutil.which, "ffmpeg")
    if ffmpeg is None:
        _LOGGER.debug("ffmpeg not found; keeping WAV")
        return None

    try:
        process = await asyncio.create_subprocess_exec(
            ffmpeg,
            "-hide_banner",
            "-loglevel", "error",
            "-i", "pipe:0",
            "-codec:a", "libmp3lame",
            "-b:a", "64k",
            "-f", "mp3",
            "pipe:1",
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate(wav_data)
    except OSError as err:
        _LOGGER.debug("ffmpeg could not be started: %s", err)
        return None

    if process.returncode != 0 or not stdout:
        _LOGGER.debug("ffmpeg failed (%s): %s", process.returncode, stderr)
        return None

    return stdout
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest tests/test_audio_processing.py -v`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add custom_components/hass_broadcast/audio_processing.py tests/test_audio_processing.py
git commit -m "feat: add optional ffmpeg MP3 transcoding"
```

---

### Task 4: Upload endpoint

**Files:**
- Create: `custom_components/hass_broadcast/http.py`
- Modify: `custom_components/hass_broadcast/__init__.py`
- Test: `tests/test_http_upload.py`

**Interfaces:**
- Consumes: `BroadcastStore` (Task 2), `async_transcode_to_mp3` (Task 3), `MAX_UPLOAD_BYTES`, `DATA_STORE`.
- Produces: `class BroadcastUploadView(HomeAssistantView)` at `/api/hass_broadcast/upload`, and `async_register_views(hass, entry_id) -> None` called from setup. Response body: `{"message_id": "<id>"}`.

**Critical:** do **not** apply `@require_admin`. See Global Constraints.

- [ ] **Step 1: Write the failing test**

`tests/test_http_upload.py`:
```python
"""Tests for the upload endpoint."""

from http import HTTPStatus

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_broadcast.const import DOMAIN


@pytest.fixture
async def setup_entry(hass: HomeAssistant) -> MockConfigEntry:
    """Set up the integration."""
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def _wav_bytes() -> bytes:
    """Return a minimal valid WAV header plus a little silence."""
    return b"RIFF$\x00\x00\x00WAVEfmt " + b"\x00" * 32


async def test_upload_requires_authentication(
    hass: HomeAssistant, setup_entry, hass_client_no_auth
) -> None:
    """Anonymous uploads are rejected."""
    client = await hass_client_no_auth()
    resp = await client.post("/api/hass_broadcast/upload")
    assert resp.status == HTTPStatus.UNAUTHORIZED


async def test_non_admin_user_can_upload(
    hass: HomeAssistant, setup_entry, hass_client, hass_read_only_access_token
) -> None:
    """A non-admin user can upload. This is deliberate — see the spec."""
    client = await hass_client(hass_read_only_access_token)
    resp = await client.post(
        "/api/hass_broadcast/upload",
        data={"file": _wav_bytes(), "duration": "1.5"},
    )
    assert resp.status == HTTPStatus.OK
    body = await resp.json()
    assert "message_id" in body


async def test_upload_rejects_oversized_file(
    hass: HomeAssistant, setup_entry, hass_client
) -> None:
    """Files beyond the size ceiling are rejected."""
    client = await hass_client()
    resp = await client.post(
        "/api/hass_broadcast/upload",
        data={"file": b"x" * (10 * 1024 * 1024 + 1), "duration": "1"},
    )
    assert resp.status == HTTPStatus.REQUEST_ENTITY_TOO_LARGE


async def test_upload_rejects_missing_file(
    hass: HomeAssistant, setup_entry, hass_client
) -> None:
    """A request without a file field is a bad request."""
    client = await hass_client()
    resp = await client.post("/api/hass_broadcast/upload", data={"duration": "1"})
    assert resp.status == HTTPStatus.BAD_REQUEST


async def test_upload_stores_the_recording(
    hass: HomeAssistant, setup_entry, hass_client
) -> None:
    """A successful upload is retrievable from the store."""
    from custom_components.hass_broadcast import DATA_STORE

    client = await hass_client()
    resp = await client.post(
        "/api/hass_broadcast/upload",
        data={"file": _wav_bytes(), "duration": "2.0"},
    )
    message_id = (await resp.json())["message_id"]

    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    assert (await store.async_get(message_id))["duration"] == 2.0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_http_upload.py -v`
Expected: FAIL — 404 on every request, since no view is registered

- [ ] **Step 3: Write the minimal implementation**

`custom_components/hass_broadcast/http.py`:
```python
"""HTTP views for hass_broadcast."""

from __future__ import annotations

from http import HTTPStatus
import logging
from typing import Any

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .audio_processing import async_transcode_to_mp3
from .const import DOMAIN, MAX_UPLOAD_BYTES

_LOGGER = logging.getLogger(__name__)


def _first_entry_data(hass: HomeAssistant) -> dict[str, Any] | None:
    """Return the data for the single config entry, if set up."""
    entries = hass.data.get(DOMAIN, {})
    return next(iter(entries.values()), None)


class BroadcastUploadView(HomeAssistantView):
    """Accept a recorded WAV.

    Authenticated but intentionally NOT admin-gated: Home Assistant's own
    upload view is admin-only, which would stop non-admin household members
    from using the card.
    """

    url = "/api/hass_broadcast/upload"
    name = "api:hass_broadcast:upload"

    async def post(self, request: web.Request) -> web.Response:
        """Store an uploaded recording."""
        hass: HomeAssistant = request.app["hass"]
        entry_data = _first_entry_data(hass)
        if entry_data is None:
            return web.json_response(
                {"message": "Voice Broadcast is not set up"},
                status=HTTPStatus.SERVICE_UNAVAILABLE,
            )

        from . import DATA_STORE

        store = entry_data[DATA_STORE]

        try:
            data = await request.post()
        except ValueError:
            return web.json_response(
                {"message": "Malformed upload"}, status=HTTPStatus.BAD_REQUEST
            )

        file_field = data.get("file")
        if file_field is None:
            return web.json_response(
                {"message": "Missing file field"}, status=HTTPStatus.BAD_REQUEST
            )

        raw = file_field.file.read() if hasattr(file_field, "file") else file_field
        if isinstance(raw, str):
            raw = raw.encode()

        if len(raw) > MAX_UPLOAD_BYTES:
            return web.json_response(
                {"message": "Recording too large"},
                status=HTTPStatus.REQUEST_ENTITY_TOO_LARGE,
            )

        if not raw.startswith(b"RIFF"):
            return web.json_response(
                {"message": "Only WAV uploads are accepted"},
                status=HTTPStatus.BAD_REQUEST,
            )

        try:
            duration = float(data.get("duration", 0))
        except (TypeError, ValueError):
            duration = 0.0

        payload, extension = raw, "wav"
        if (mp3 := await async_transcode_to_mp3(hass, raw)) is not None:
            payload, extension = mp3, "mp3"

        message_id = await store.async_add(
            payload,
            extension=extension,
            duration=duration,
            user_id=request["hass_user"].id if "hass_user" in request else None,
        )
        return web.json_response({"message_id": message_id})


def async_register_views(hass: HomeAssistant) -> None:
    """Register the HTTP views."""
    hass.http.register_view(BroadcastUploadView())
```

- [ ] **Step 4: Register the views during setup**

In `custom_components/hass_broadcast/__init__.py`, add the import and call. After `await store.async_load()` and before the `hass.data` assignment, insert:
```python
    async_register_views(hass)
```
and add to the imports:
```python
from .http import async_register_views
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pytest tests/test_http_upload.py -v`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add custom_components/hass_broadcast/http.py custom_components/hass_broadcast/__init__.py tests/test_http_upload.py
git commit -m "feat: add non-admin-gated upload endpoint"
```

---

### Task 5: Media serving endpoint

**Files:**
- Modify: `custom_components/hass_broadcast/http.py`
- Test: `tests/test_http_media.py`

**Interfaces:**
- Consumes: `BroadcastStore`, `DATA_STORE`.
- Produces: `class BroadcastMediaView(HomeAssistantView)` at `/api/hass_broadcast/media/{message_id}.{extension}`, `requires_auth = True`. Registered by `async_register_views`.

`requires_auth = True` is what makes signed-path access work: Home Assistant's auth middleware validates the signature that `async_process_play_media_url` adds, so a Cast device can fetch the file without the recording ever being world-readable.

- [ ] **Step 1: Write the failing test**

`tests/test_http_media.py`:
```python
"""Tests for the media serving endpoint."""

from http import HTTPStatus

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_broadcast import DATA_STORE
from custom_components.hass_broadcast.const import DOMAIN


@pytest.fixture
async def setup_entry(hass: HomeAssistant) -> MockConfigEntry:
    """Set up the integration."""
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_serves_stored_recording(
    hass: HomeAssistant, setup_entry, hass_client
) -> None:
    """A stored recording is served with its bytes intact."""
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    client = await hass_client()
    resp = await client.get(f"/api/hass_broadcast/media/{message_id}.wav")
    assert resp.status == HTTPStatus.OK
    assert await resp.read() == b"RIFFdata"


async def test_unknown_recording_is_not_found(
    hass: HomeAssistant, setup_entry, hass_client
) -> None:
    """An unknown id returns 404."""
    client = await hass_client()
    resp = await client.get("/api/hass_broadcast/media/deadbeef.wav")
    assert resp.status == HTTPStatus.NOT_FOUND


async def test_media_requires_authentication(
    hass: HomeAssistant, setup_entry, hass_client_no_auth
) -> None:
    """Unauthenticated, unsigned requests are rejected."""
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    client = await hass_client_no_auth()
    resp = await client.get(f"/api/hass_broadcast/media/{message_id}.wav")
    assert resp.status == HTTPStatus.UNAUTHORIZED


async def test_signed_path_grants_access(
    hass: HomeAssistant, setup_entry, hass_client_no_auth
) -> None:
    """A signed path works without a token — this is how Cast fetches."""
    from datetime import timedelta

    from homeassistant.components.http.auth import async_sign_path

    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    message_id = await store.async_add(
        b"RIFFdata", extension="wav", duration=1, user_id=None
    )

    signed = async_sign_path(
        hass, f"/api/hass_broadcast/media/{message_id}.wav", timedelta(seconds=60)
    )

    client = await hass_client_no_auth()
    resp = await client.get(signed)
    assert resp.status == HTTPStatus.OK
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_http_media.py -v`
Expected: FAIL — 404 for every request, no media view registered

- [ ] **Step 3: Write the minimal implementation**

Append to `custom_components/hass_broadcast/http.py`:
```python
CONTENT_TYPES = {"wav": "audio/wav", "mp3": "audio/mpeg"}


class BroadcastMediaView(HomeAssistantView):
    """Serve a stored recording.

    requires_auth = True is deliberate: it makes Home Assistant's signed-path
    middleware apply, which is how a Cast device fetches the file without the
    recording being served unauthenticated.
    """

    url = "/api/hass_broadcast/media/{message_id}.{extension}"
    name = "api:hass_broadcast:media"
    requires_auth = True

    async def get(
        self, request: web.Request, message_id: str, extension: str
    ) -> web.StreamResponse:
        """Return the recording."""
        hass: HomeAssistant = request.app["hass"]
        entry_data = _first_entry_data(hass)
        if entry_data is None:
            return web.Response(status=HTTPStatus.NOT_FOUND)

        from . import DATA_STORE

        store = entry_data[DATA_STORE]
        message = await store.async_get(message_id)
        if message is None or message["extension"] != extension:
            return web.Response(status=HTTPStatus.NOT_FOUND)

        path = await store.async_path(message_id)
        if path is None or not await hass.async_add_executor_job(path.is_file):
            return web.Response(status=HTTPStatus.NOT_FOUND)

        return web.FileResponse(
            path,
            headers={"Content-Type": CONTENT_TYPES.get(extension, "audio/wav")},
        )
```

Update `async_register_views`:
```python
def async_register_views(hass: HomeAssistant) -> None:
    """Register the HTTP views."""
    hass.http.register_view(BroadcastUploadView())
    hass.http.register_view(BroadcastMediaView())
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest tests/test_http_media.py -v`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add custom_components/hass_broadcast/http.py tests/test_http_media.py
git commit -m "feat: serve recordings over an authenticated, signable URL"
```

---

### Task 6: Media source platform

**Files:**
- Create: `custom_components/hass_broadcast/media_source.py`
- Test: `tests/test_media_source.py`

**Interfaces:**
- Consumes: `BroadcastStore`, `DATA_STORE`, `CONTENT_TYPES` from `http.py`.
- Produces: `async_get_media_source(hass) -> BroadcastMediaSource`. Resolves `media-source://hass_broadcast/<id>` to `PlayMedia(url="/api/hass_broadcast/media/<id>.<ext>", mime_type=...)`.

The URL must be **root-relative with no query parameters** — that is precisely the condition under which `async_process_play_media_url` signs it.

- [ ] **Step 1: Write the failing test**

`tests/test_media_source.py`:
```python
"""Tests for the media source platform."""

from homeassistant.components import media_source
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_broadcast import DATA_STORE
from custom_components.hass_broadcast.const import DOMAIN


@pytest.fixture
async def setup_entry(hass: HomeAssistant) -> MockConfigEntry:
    """Set up the integration and media_source."""
    from homeassistant.setup import async_setup_component

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

    browse = await media_source.async_browse_media(
        hass, f"media-source://{DOMAIN}"
    )
    assert len(browse.children) == 1
    assert browse.children[0].can_play is True
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_media_source.py -v`
Expected: FAIL — media source for `hass_broadcast` not found

- [ ] **Step 3: Write the minimal implementation**

`custom_components/hass_broadcast/media_source.py`:
```python
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest tests/test_media_source.py -v`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add custom_components/hass_broadcast/media_source.py tests/test_media_source.py
git commit -m "feat: expose recordings as a media source"
```

---

### Task 7: Playback service

**Files:**
- Create: `custom_components/hass_broadcast/playback.py`
- Create: `custom_components/hass_broadcast/services.yaml`
- Create: `custom_components/hass_broadcast/chime.wav`
- Modify: `custom_components/hass_broadcast/__init__.py`
- Test: `tests/test_playback.py`

**Interfaces:**
- Consumes: `BroadcastStore`, `DATA_STORE`, `MODE_PLAIN`, `MODE_RESTORE`, `MODE_CHIME`, `MODES`.
- Produces: service `hass_broadcast.send` with fields `message_id` (str, required), `targets` (list of entity ids, required), `mode` (one of `MODES`, default `plain`). Registered by `async_register_services(hass) -> None`.

Per the spec, `plain` is the default because Cast has no native announce. `restore` restores volume reliably and resumes best-effort.

- [ ] **Step 1: Generate the chime asset**

Run this to produce a short two-tone chime with no external asset of unknown provenance:
```bash
python3 - <<'PY'
import math, struct, wave
rate, out = 16000, []
for freq, dur in ((880.0, 0.12), (1174.7, 0.18)):
    n = int(rate * dur)
    for i in range(n):
        env = min(1.0, i / (rate * 0.01)) * (1.0 - i / n) ** 1.5
        out.append(int(0.35 * env * 32767 * math.sin(2 * math.pi * freq * i / rate)))
with wave.open("custom_components/hass_broadcast/chime.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate)
    w.writeframes(b"".join(struct.pack("<h", s) for s in out))
PY
```
Verify: `python3 -c "import wave; f=wave.open('custom_components/hass_broadcast/chime.wav'); print(f.getframerate(), f.getnframes())"`
Expected: `16000 4800`

- [ ] **Step 2: Write the failing test**

`tests/test_playback.py`:
```python
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
    assert play_calls[0].data["media_content_id"] == (
        f"media-source://{DOMAIN}/{message_id}"
    )
    assert play_calls[0].data["media_content_type"] == "music"


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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pytest tests/test_playback.py -v`
Expected: FAIL — `Service hass_broadcast.send not found`

- [ ] **Step 4: Write the minimal implementation**

`custom_components/hass_broadcast/playback.py`:
```python
"""The hass_broadcast.send service."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

import voluptuous as vol

from homeassistant.components.media_player import (
    ATTR_MEDIA_CONTENT_ID,
    ATTR_MEDIA_CONTENT_TYPE,
    DOMAIN as MEDIA_PLAYER_DOMAIN,
    SERVICE_PLAY_MEDIA,
    MediaType,
)
from homeassistant.const import ATTR_ENTITY_ID
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError
import homeassistant.helpers.config_validation as cv

from .const import DOMAIN, MODE_CHIME, MODE_PLAIN, MODE_RESTORE, MODES

_LOGGER = logging.getLogger(__name__)

SERVICE_SEND = "send"
CHIME_URL = "/api/hass_broadcast/static/chime.wav"

SEND_SCHEMA = vol.Schema(
    {
        vol.Required("message_id"): cv.string,
        vol.Required("targets"): vol.All(cv.ensure_list, [cv.entity_id]),
        vol.Optional("mode", default=MODE_PLAIN): vol.In(MODES),
    }
)


def _store(hass: HomeAssistant):
    """Return the store, or None when not set up."""
    from . import DATA_STORE

    entry_data = next(iter(hass.data.get(DOMAIN, {}).values()), None)
    return entry_data[DATA_STORE] if entry_data else None


async def _async_play(
    hass: HomeAssistant, entity_id: str, content_id: str
) -> None:
    """Issue one play_media call."""
    await hass.services.async_call(
        MEDIA_PLAYER_DOMAIN,
        SERVICE_PLAY_MEDIA,
        {
            ATTR_ENTITY_ID: entity_id,
            ATTR_MEDIA_CONTENT_ID: content_id,
            ATTR_MEDIA_CONTENT_TYPE: MediaType.MUSIC,
        },
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
    snapshot: dict[str, Any] | None = None
    if mode == MODE_RESTORE:
        state = hass.states.get(entity_id)
        if state is not None:
            snapshot = {
                "volume": state.attributes.get("volume_level"),
                "state": state.state,
            }

    if mode == MODE_CHIME:
        await _async_play(hass, entity_id, CHIME_URL)
        await asyncio.sleep(0.4)

    await _async_play(hass, entity_id, content_id)

    if snapshot is not None:
        await asyncio.sleep(duration + 1)
        if snapshot["volume"] is not None:
            await hass.services.async_call(
                MEDIA_PLAYER_DOMAIN,
                "volume_set",
                {ATTR_ENTITY_ID: entity_id, "volume_level": snapshot["volume"]},
                blocking=True,
            )
        if snapshot["state"] == "playing":
            # Best effort only: Cast cannot reliably resume an app session.
            await hass.services.async_call(
                MEDIA_PLAYER_DOMAIN,
                "media_play",
                {ATTR_ENTITY_ID: entity_id},
                blocking=False,
            )


async def _async_handle_send(call: ServiceCall) -> None:
    """Handle hass_broadcast.send."""
    hass = call.hass
    store = _store(hass)
    if store is None:
        raise HomeAssistantError("Voice Broadcast is not set up")

    message_id = call.data["message_id"]
    message = await store.async_get(message_id)
    if message is None:
        raise HomeAssistantError(f"Unknown recording {message_id}")

    content_id = f"media-source://{DOMAIN}/{message_id}"
    mode = call.data["mode"]
    duration = float(message.get("duration") or 0)

    for entity_id in call.data["targets"]:
        try:
            await _async_send_to_target(hass, entity_id, content_id, mode, duration)
        except HomeAssistantError as err:
            _LOGGER.error("Broadcast to %s failed: %s", entity_id, err)


def async_register_services(hass: HomeAssistant) -> None:
    """Register the broadcast services."""
    if hass.services.has_service(DOMAIN, SERVICE_SEND):
        return
    hass.services.async_register(
        DOMAIN, SERVICE_SEND, _async_handle_send, schema=SEND_SCHEMA
    )
```

`custom_components/hass_broadcast/services.yaml`:
```yaml
send:
  name: Send broadcast
  description: Play a recorded voice message on one or more media players.
  fields:
    message_id:
      name: Message ID
      description: The recording to play.
      required: true
      selector:
        text:
    targets:
      name: Targets
      description: Media players to play the message on.
      required: true
      selector:
        entity:
          multiple: true
          domain: media_player
    mode:
      name: Mode
      description: >-
        plain plays the message. restore also snapshots and restores volume;
        resuming an interrupted Cast session is best effort only. chime plays
        an attention tone first.
      default: plain
      selector:
        select:
          options: [plain, restore, chime]
```

- [ ] **Step 5: Register services during setup**

In `custom_components/hass_broadcast/__init__.py`, add to imports:
```python
from .playback import async_register_services
```
and call `async_register_services(hass)` immediately after `async_register_views(hass)`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `pytest tests/test_playback.py -v`
Expected: PASS (4 tests)

- [ ] **Step 7: Run the full suite**

Run: `pytest tests/ -v`
Expected: PASS (all tests)

- [ ] **Step 8: Commit**

```bash
git add custom_components/hass_broadcast/playback.py custom_components/hass_broadcast/services.yaml custom_components/hass_broadcast/chime.wav custom_components/hass_broadcast/__init__.py tests/test_playback.py
git commit -m "feat: add hass_broadcast.send service with plain, restore and chime modes"
```

---

### Task 8: WebSocket history commands

**Files:**
- Create: `custom_components/hass_broadcast/websocket.py`
- Modify: `custom_components/hass_broadcast/__init__.py`
- Test: `tests/test_websocket.py`

**Interfaces:**
- Consumes: `BroadcastStore`, `DATA_STORE`.
- Produces: WS commands `hass_broadcast/list` (returns `{"messages": [...]}`) and `hass_broadcast/delete` (takes `message_id`, returns `{"deleted": bool}`), registered by `async_register_websocket_commands(hass) -> None`.

- [ ] **Step 1: Write the failing test**

`tests/test_websocket.py`:
```python
"""Tests for the websocket commands."""

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_broadcast import DATA_STORE
from custom_components.hass_broadcast.const import DOMAIN


@pytest.fixture
async def setup_entry(hass: HomeAssistant) -> MockConfigEntry:
    """Set up the integration."""
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_list_returns_recordings_newest_first(
    hass: HomeAssistant, setup_entry, hass_ws_client
) -> None:
    """The list command returns stored recordings, newest first."""
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    first = await store.async_add(b"a", extension="wav", duration=1, user_id=None)
    second = await store.async_add(b"b", extension="wav", duration=2, user_id=None)

    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hass_broadcast/list"})
    msg = await client.receive_json()

    assert msg["success"] is True
    assert [m["id"] for m in msg["result"]["messages"]] == [second, first]


async def test_delete_removes_a_recording(
    hass: HomeAssistant, setup_entry, hass_ws_client
) -> None:
    """The delete command removes a recording."""
    store = hass.data[DOMAIN][setup_entry.entry_id][DATA_STORE]
    message_id = await store.async_add(
        b"a", extension="wav", duration=1, user_id=None
    )

    client = await hass_ws_client(hass)
    await client.send_json(
        {"id": 1, "type": "hass_broadcast/delete", "message_id": message_id}
    )
    msg = await client.receive_json()

    assert msg["success"] is True
    assert msg["result"]["deleted"] is True
    assert await store.async_list() == []


async def test_delete_unknown_reports_false(
    hass: HomeAssistant, setup_entry, hass_ws_client
) -> None:
    """Deleting an unknown recording reports deleted: false."""
    client = await hass_ws_client(hass)
    await client.send_json(
        {"id": 1, "type": "hass_broadcast/delete", "message_id": "nope"}
    )
    msg = await client.receive_json()

    assert msg["success"] is True
    assert msg["result"]["deleted"] is False
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_websocket.py -v`
Expected: FAIL — unknown command `hass_broadcast/list`

- [ ] **Step 3: Write the minimal implementation**

`custom_components/hass_broadcast/websocket.py`:
```python
"""WebSocket commands for hass_broadcast."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN


def _store(hass: HomeAssistant):
    """Return the store, or None when not set up."""
    from . import DATA_STORE

    entry_data = next(iter(hass.data.get(DOMAIN, {}).values()), None)
    return entry_data[DATA_STORE] if entry_data else None


@websocket_api.websocket_command({vol.Required("type"): "hass_broadcast/list"})
@websocket_api.async_response
async def ws_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return stored recordings, newest first."""
    store = _store(hass)
    if store is None:
        connection.send_error(msg["id"], "not_setup", "Voice Broadcast is not set up")
        return
    connection.send_result(msg["id"], {"messages": await store.async_list()})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hass_broadcast/delete",
        vol.Required("message_id"): str,
    }
)
@websocket_api.async_response
async def ws_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a recording."""
    store = _store(hass)
    if store is None:
        connection.send_error(msg["id"], "not_setup", "Voice Broadcast is not set up")
        return
    deleted = await store.async_delete(msg["message_id"])
    connection.send_result(msg["id"], {"deleted": deleted})


@callback
def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register the websocket commands."""
    websocket_api.async_register_command(hass, ws_list)
    websocket_api.async_register_command(hass, ws_delete)
```

- [ ] **Step 4: Register during setup**

In `custom_components/hass_broadcast/__init__.py`, add to imports:
```python
from .websocket import async_register_websocket_commands
```
and call `async_register_websocket_commands(hass)` after `async_register_services(hass)`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `pytest tests/test_websocket.py -v`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add custom_components/hass_broadcast/websocket.py custom_components/hass_broadcast/__init__.py tests/test_websocket.py
git commit -m "feat: add websocket commands for listing and deleting recordings"
```

---

### Task 9: Serve the card and worklet as static assets

**Files:**
- Modify: `custom_components/hass_broadcast/__init__.py`
- Create: `custom_components/hass_broadcast/www/.gitkeep`
- Test: `tests/test_static.py`

**Interfaces:**
- Consumes: nothing.
- Produces: static route `/api/hass_broadcast/static/` serving `custom_components/hass_broadcast/www/` plus `chime.wav`, and an automatic frontend module registration so users never add a Lovelace resource by hand.

The recorder worklet is served as a real file rather than a `blob:` URL, which avoids any Content-Security-Policy question about worklet sources.

- [ ] **Step 1: Write the failing test**

`tests/test_static.py`:
```python
"""Tests for static asset serving."""

from http import HTTPStatus

from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hass_broadcast.const import DOMAIN


@pytest.fixture
async def setup_entry(hass: HomeAssistant) -> MockConfigEntry:
    """Set up the integration."""
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_chime_is_served(
    hass: HomeAssistant, setup_entry, hass_client_no_auth
) -> None:
    """The chime is reachable without auth so any player can fetch it."""
    client = await hass_client_no_auth()
    resp = await client.get("/api/hass_broadcast/static/chime.wav")
    assert resp.status == HTTPStatus.OK


async def test_card_module_is_registered(hass: HomeAssistant, setup_entry) -> None:
    """The card JS is registered as a frontend extra module."""
    from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL

    urls = hass.data.get(DATA_EXTRA_MODULE_URL)
    assert urls is not None
    assert any("hass-broadcast-card.js" in url for url in urls)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_static.py -v`
Expected: FAIL — 404 for the chime, and no registered module URL

- [ ] **Step 3: Write the implementation**

Create the directory placeholder:
```bash
mkdir -p custom_components/hass_broadcast/www && touch custom_components/hass_broadcast/www/.gitkeep
```

In `custom_components/hass_broadcast/__init__.py`, add these imports:
```python
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
```

Add this function and call `await _async_register_static(hass)` inside `async_setup_entry`, before the services are registered:
```python
STATIC_URL = "/api/hass_broadcast/static"
CARD_URL = f"{STATIC_URL}/hass-broadcast-card.js"


async def _async_register_static(hass: HomeAssistant) -> None:
    """Serve the card, worklet and chime, and register the card module."""
    if hass.data.get(f"{DOMAIN}_static_registered"):
        return
    hass.data[f"{DOMAIN}_static_registered"] = True

    component_dir = Path(__file__).parent
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(STATIC_URL, str(component_dir / "www"), False),
            StaticPathConfig(
                f"{STATIC_URL}/chime.wav", str(component_dir / "chime.wav"), True
            ),
        ]
    )
    add_extra_js_url(hass, CARD_URL)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest tests/test_static.py -v`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add custom_components/hass_broadcast/__init__.py custom_components/hass_broadcast/www tests/test_static.py
git commit -m "feat: serve card assets and auto-register the card module"
```

---

### Task 10: Frontend toolchain, recorder worklet, and WAV encoder

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `frontend/src/wav.ts`
- Create: `frontend/src/recorder.ts`
- Create: `custom_components/hass_broadcast/www/recorder-worklet.js`
- Create: `frontend/build.mjs`
- Test: `frontend/test/wav.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `encodeWav(samples: Int16Array, sampleRate: number): Blob` from `wav.ts`; `class Recorder` from `recorder.ts` with `start(): Promise<void>`, `stop(): Promise<{blob: Blob; duration: number}>`, `onLevel(cb: (level: number) => void): void`, and a static `isSupported(): boolean`.

The worklet lives at `custom_components/hass_broadcast/www/recorder-worklet.js` as hand-written JS (not bundled), because `AudioWorklet` modules are loaded by URL in a separate realm.

- [ ] **Step 1: Create the toolchain**

`package.json`:
```json
{
  "name": "hass-broadcast-card",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "node frontend/build.mjs",
    "test": "vitest run"
  },
  "devDependencies": {
    "esbuild": "^0.24.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  },
  "dependencies": {
    "lit": "^3.2.0"
  }
}
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2021", "DOM"],
    "strict": true,
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["frontend/src", "frontend/test"]
}
```

`frontend/build.mjs`:
```javascript
import { build } from "esbuild";

await build({
  entryPoints: ["frontend/src/card.ts"],
  bundle: true,
  format: "esm",
  target: "es2021",
  minify: true,
  outfile: "custom_components/hass_broadcast/www/hass-broadcast-card.js",
});
console.log("built hass-broadcast-card.js");
```

Run: `npm install`

- [ ] **Step 2: Write the failing test**

`frontend/test/wav.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { encodeWav } from "../src/wav";

async function headerOf(blob: Blob) {
  const buf = await blob.arrayBuffer();
  return { view: new DataView(buf), size: buf.byteLength };
}

describe("encodeWav", () => {
  it("writes a RIFF/WAVE header", async () => {
    const { view } = await headerOf(encodeWav(new Int16Array(10), 16000));
    const tag = (o: number) =>
      String.fromCharCode(view.getUint8(o), view.getUint8(o + 1), view.getUint8(o + 2), view.getUint8(o + 3));
    expect(tag(0)).toBe("RIFF");
    expect(tag(8)).toBe("WAVE");
    expect(tag(12)).toBe("fmt ");
    expect(tag(36)).toBe("data");
  });

  it("describes 16-bit mono PCM at the given sample rate", async () => {
    const { view } = await headerOf(encodeWav(new Int16Array(10), 16000));
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(16000); // sample rate
    expect(view.getUint32(28, true)).toBe(32000); // byte rate
    expect(view.getUint16(32, true)).toBe(2); // block align
    expect(view.getUint16(34, true)).toBe(16); // bits per sample
  });

  it("sizes the file as 44 header bytes plus two bytes per sample", async () => {
    const { view, size } = await headerOf(encodeWav(new Int16Array(100), 16000));
    expect(size).toBe(44 + 200);
    expect(view.getUint32(4, true)).toBe(36 + 200);
    expect(view.getUint32(40, true)).toBe(200);
  });

  it("preserves sample values", async () => {
    const samples = Int16Array.from([0, 1000, -1000, 32767, -32768]);
    const { view } = await headerOf(encodeWav(samples, 16000));
    for (let i = 0; i < samples.length; i++) {
      expect(view.getInt16(44 + i * 2, true)).toBe(samples[i]);
    }
  });

  it("produces an audio/wav blob", () => {
    expect(encodeWav(new Int16Array(4), 16000).type).toBe("audio/wav");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/wav`

- [ ] **Step 4: Write the implementation**

`frontend/src/wav.ts`:
```typescript
/** Wrap Int16 PCM in a WAV/LPCM container. Cast plays this natively. */
export function encodeWav(samples: Int16Array, sampleRate: number): Blob {
  const dataBytes = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);

  const writeTag = (offset: number, tag: string) => {
    for (let i = 0; i < tag.length; i++) {
      view.setUint8(offset + i, tag.charCodeAt(i));
    }
  };

  writeTag(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  writeTag(8, "WAVE");
  writeTag(12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeTag(36, "data");
  view.setUint32(40, dataBytes, true);

  new Int16Array(buffer, 44).set(samples);
  return new Blob([buffer], { type: "audio/wav" });
}
```

`custom_components/hass_broadcast/www/recorder-worklet.js`:
```javascript
// Emits Int16 PCM frames to the main thread. Loaded by URL: AudioWorklet
// modules run in a separate realm and cannot be bundled into the card.
class RecorderWorklet extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) {
      return true;
    }
    const pcm = new Int16Array(channel.length);
    for (let i = 0; i < channel.length; i++) {
      const clamped = Math.max(-1, Math.min(1, channel[i]));
      pcm[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    }
    this.port.postMessage(pcm, [pcm.buffer]);
    return true;
  }
}

registerProcessor("recorder-worklet", RecorderWorklet);
```

`frontend/src/recorder.ts`:
```typescript
import { encodeWav } from "./wav";

const TARGET_RATE = 16000;
const WORKLET_URL = "/api/hass_broadcast/static/recorder-worklet.js";

/** Captures microphone audio as Int16 PCM and returns it as a WAV blob. */
export class Recorder {
  private context?: AudioContext;
  private stream?: MediaStream;
  private node?: AudioWorkletNode;
  private chunks: Int16Array[] = [];
  private levelCallback?: (level: number) => void;

  /** Recording needs a secure context; browsers hide the API otherwise. */
  static isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      window.isSecureContext === true &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof AudioWorkletNode !== "undefined"
    );
  }

  onLevel(callback: (level: number) => void): void {
    this.levelCallback = callback;
  }

  async start(): Promise<void> {
    this.chunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.context = new AudioContext({ sampleRate: TARGET_RATE });
    await this.context.audioWorklet.addModule(WORKLET_URL);

    const source = this.context.createMediaStreamSource(this.stream);
    this.node = new AudioWorkletNode(this.context, "recorder-worklet");
    this.node.port.onmessage = (event: MessageEvent<Int16Array>) => {
      this.chunks.push(event.data);
      if (this.levelCallback) {
        this.levelCallback(peak(event.data));
      }
    };
    source.connect(this.node);
    this.node.connect(this.context.destination);
  }

  async stop(): Promise<{ blob: Blob; duration: number }> {
    const sampleRate = this.context?.sampleRate ?? TARGET_RATE;
    this.node?.port.close();
    this.node?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    await this.context?.close();
    this.context = undefined;
    this.stream = undefined;
    this.node = undefined;

    const total = this.chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const samples = new Int16Array(total);
    let offset = 0;
    for (const chunk of this.chunks) {
      samples.set(chunk, offset);
      offset += chunk.length;
    }

    return {
      blob: encodeWav(samples, sampleRate),
      duration: total / sampleRate,
    };
  }
}

function peak(samples: Int16Array): number {
  let max = 0;
  for (const sample of samples) {
    max = Math.max(max, Math.abs(sample));
  }
  return max / 32768;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json frontend custom_components/hass_broadcast/www/recorder-worklet.js
git commit -m "feat: add WAV encoder and AudioWorklet recorder"
```

---

### Task 11: The card

**Files:**
- Create: `frontend/src/card.ts`
- Create: `frontend/src/api.ts`
- Test: `frontend/test/api.test.ts`

**Interfaces:**
- Consumes: `Recorder`, `encodeWav`.
- Produces: custom element `hass-broadcast-card`, registered in `customElements` and pushed to `window.customCards`. `api.ts` produces `uploadRecording(hass, blob, duration): Promise<string>`, `listMessages(hass): Promise<BroadcastMessage[]>`, `deleteMessage(hass, id): Promise<boolean>`, `sendBroadcast(hass, id, targets, mode): Promise<void>`.

Card config keys, matching the spec: `targets` (string[]), `mode` (`plain` | `restore` | `chime`), `max_duration` (number, default 60), `show_history` (boolean, default true).

- [ ] **Step 1: Write the failing test**

`frontend/test/api.test.ts`:
```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteMessage, listMessages, sendBroadcast, uploadRecording } from "../src/api";

function fakeHass() {
  return {
    connection: { sendMessagePromise: vi.fn().mockResolvedValue({ messages: [] }) },
    callService: vi.fn().mockResolvedValue(undefined),
    auth: { data: { access_token: "tok" } },
  } as any;
}

describe("api", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message_id: "abc" }),
      }),
    );
  });

  it("uploads with a bearer token and returns the message id", async () => {
    const hass = fakeHass();
    const id = await uploadRecording(hass, new Blob(["x"]), 2.5);

    expect(id).toBe("abc");
    const [url, options] = (fetch as any).mock.calls[0];
    expect(url).toBe("/api/hass_broadcast/upload");
    expect(options.headers.Authorization).toBe("Bearer tok");
    expect(options.body.get("duration")).toBe("2.5");
  });

  it("throws when the upload is rejected", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 413 }));
    await expect(uploadRecording(fakeHass(), new Blob(["x"]), 1)).rejects.toThrow("413");
  });

  it("lists messages over the websocket", async () => {
    const hass = fakeHass();
    await listMessages(hass);
    expect(hass.connection.sendMessagePromise).toHaveBeenCalledWith({
      type: "hass_broadcast/list",
    });
  });

  it("deletes a message over the websocket", async () => {
    const hass = fakeHass();
    hass.connection.sendMessagePromise.mockResolvedValue({ deleted: true });
    expect(await deleteMessage(hass, "abc")).toBe(true);
    expect(hass.connection.sendMessagePromise).toHaveBeenCalledWith({
      type: "hass_broadcast/delete",
      message_id: "abc",
    });
  });

  it("sends a broadcast through the service", async () => {
    const hass = fakeHass();
    await sendBroadcast(hass, "abc", ["media_player.kitchen"], "plain");
    expect(hass.callService).toHaveBeenCalledWith("hass_broadcast", "send", {
      message_id: "abc",
      targets: ["media_player.kitchen"],
      mode: "plain",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/api`

- [ ] **Step 3: Write the API module**

`frontend/src/api.ts`:
```typescript
export interface BroadcastMessage {
  id: string;
  created: string;
  duration: number;
  user_id: string | null;
  extension: string;
}

export type BroadcastMode = "plain" | "restore" | "chime";

export async function uploadRecording(
  hass: any,
  blob: Blob,
  duration: number,
): Promise<string> {
  const body = new FormData();
  body.append("file", blob, "recording.wav");
  body.append("duration", String(duration));

  const response = await fetch("/api/hass_broadcast/upload", {
    method: "POST",
    body,
    headers: { Authorization: `Bearer ${hass.auth.data.access_token}` },
  });

  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }
  return (await response.json()).message_id;
}

export async function listMessages(hass: any): Promise<BroadcastMessage[]> {
  const result = await hass.connection.sendMessagePromise({
    type: "hass_broadcast/list",
  });
  return result.messages;
}

export async function deleteMessage(hass: any, id: string): Promise<boolean> {
  const result = await hass.connection.sendMessagePromise({
    type: "hass_broadcast/delete",
    message_id: id,
  });
  return result.deleted;
}

export async function sendBroadcast(
  hass: any,
  id: string,
  targets: string[],
  mode: BroadcastMode,
): Promise<void> {
  await hass.callService("hass_broadcast", "send", {
    message_id: id,
    targets,
    mode,
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (10 tests total)

- [ ] **Step 5: Write the failing test for the microphone error branches**

The spec requires the insecure-context and permission-denied branches to be tested.
Keeping these messages in a pure module makes them testable without a DOM harness.

`frontend/test/errors.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { INSECURE_CONTEXT_MESSAGE, micErrorMessage } from "../src/errors";

describe("microphone errors", () => {
  it("names the HTTPS requirement in the insecure-context message", () => {
    expect(INSECURE_CONTEXT_MESSAGE).toMatch(/HTTPS/);
    expect(INSECURE_CONTEXT_MESSAGE).toMatch(/localhost/);
  });

  it("gives actionable advice when permission was denied", () => {
    const message = micErrorMessage({ name: "NotAllowedError" });
    expect(message).toMatch(/permission/i);
    expect(message).not.toMatch(/undefined/);
  });

  it("falls back to the error message for other failures", () => {
    expect(micErrorMessage({ name: "NotFoundError", message: "no device" })).toMatch(
      /no device/,
    );
  });

  it("never renders undefined for a bare error", () => {
    expect(micErrorMessage({})).not.toMatch(/undefined/);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/errors`

- [ ] **Step 7: Write the errors module**

`frontend/src/errors.ts`:
```typescript
export const INSECURE_CONTEXT_MESSAGE =
  "Recording needs a secure connection. Open Home Assistant over HTTPS " +
  "(or localhost) \u2014 plain http:// to a LAN address cannot use the microphone.";

/** Turn a getUserMedia rejection into something a user can act on. */
export function micErrorMessage(err: { name?: string; message?: string }): string {
  if (err?.name === "NotAllowedError") {
    return "Microphone permission was denied. Allow it for this site and try again.";
  }
  return `Could not start recording: ${err?.message ?? err?.name ?? "unknown error"}`;
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (14 tests total)

- [ ] **Step 9: Write the card**

`frontend/src/card.ts`:
```typescript
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import {
  BroadcastMessage,
  BroadcastMode,
  deleteMessage,
  listMessages,
  sendBroadcast,
  uploadRecording,
} from "./api";
import { INSECURE_CONTEXT_MESSAGE, micErrorMessage } from "./errors";
import { Recorder } from "./recorder";

const SUPPORT_PLAY_MEDIA = 512;

interface CardConfig {
  type: string;
  targets?: string[];
  mode?: BroadcastMode;
  max_duration?: number;
  show_history?: boolean;
}

type Phase = "idle" | "recording" | "preview" | "sending";

@customElement("hass-broadcast-card")
export class HassBroadcastCard extends LitElement {
  @property({ attribute: false }) hass?: any;
  @state() private config: CardConfig = { type: "" };
  @state() private phase: Phase = "idle";
  @state() private level = 0;
  @state() private elapsed = 0;
  @state() private error?: string;
  @state() private selected: string[] = [];
  @state() private history: BroadcastMessage[] = [];
  @state() private previewUrl?: string;

  private recorder = new Recorder();
  private blob?: Blob;
  private duration = 0;
  private timer?: number;

  static styles = css`
    ha-card { padding: 16px; }
    .row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .record { border: none; border-radius: 50%; width: 56px; height: 56px;
      background: var(--error-color, #db4437); color: #fff; cursor: pointer; font-size: 22px; }
    .record[disabled] { opacity: 0.5; cursor: not-allowed; }
    .meter { flex: 1; height: 6px; background: var(--divider-color, #ddd); border-radius: 3px; overflow: hidden; }
    .meter > div { height: 100%; background: var(--primary-color); transition: width 80ms linear; }
    .error { color: var(--error-color, #db4437); margin-bottom: 12px; }
    .targets { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .chip { padding: 6px 12px; border-radius: 16px; cursor: pointer;
      border: 1px solid var(--divider-color, #ddd); background: none; color: var(--primary-text-color); }
    .chip[data-on="true"] { background: var(--primary-color); color: var(--text-primary-color, #fff); }
    .history { border-top: 1px solid var(--divider-color, #ddd); margin-top: 12px; padding-top: 8px; }
    .history-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
    .history-row span { flex: 1; font-size: 0.9em; }
    audio { width: 100%; margin-bottom: 12px; }
  `;

  setConfig(config: CardConfig): void {
    this.config = config;
    this.selected = config.targets ? [...config.targets] : [];
  }

  getCardSize(): number {
    return this.config.show_history === false ? 3 : 6;
  }

  static getConfigElement() {
    return document.createElement("hass-broadcast-card-editor");
  }

  static getStubConfig(): CardConfig {
    return { type: "custom:hass-broadcast-card", targets: [], mode: "plain" };
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (!Recorder.isSupported()) {
      this.error = INSECURE_CONTEXT_MESSAGE;
    }
    void this.refreshHistory();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearTimer();
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }

  private clearTimer(): void {
    if (this.timer !== undefined) {
      window.clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private async refreshHistory(): Promise<void> {
    if (!this.hass || this.config.show_history === false) {
      return;
    }
    try {
      this.history = await listMessages(this.hass);
    } catch {
      this.history = [];
    }
  }

  private get players(): string[] {
    if (!this.hass) {
      return [];
    }
    return Object.keys(this.hass.states)
      .filter((entityId) => entityId.startsWith("media_player."))
      .filter(
        (entityId) =>
          (this.hass.states[entityId].attributes.supported_features &
            SUPPORT_PLAY_MEDIA) !== 0,
      )
      .sort();
  }

  private async startRecording(): Promise<void> {
    this.error = undefined;
    try {
      this.recorder.onLevel((level) => {
        this.level = level;
      });
      await this.recorder.start();
    } catch (err: any) {
      this.error = micErrorMessage(err);
      return;
    }

    this.phase = "recording";
    this.elapsed = 0;
    const limit = this.config.max_duration ?? 60;
    this.timer = window.setInterval(() => {
      this.elapsed += 1;
      if (this.elapsed >= limit) {
        void this.stopRecording();
      }
    }, 1000);
  }

  private async stopRecording(): Promise<void> {
    this.clearTimer();
    const { blob, duration } = await this.recorder.stop();
    this.blob = blob;
    this.duration = duration;
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = URL.createObjectURL(blob);
    this.level = 0;
    this.phase = "preview";
  }

  private discard(): void {
    this.blob = undefined;
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = undefined;
    }
    this.phase = "idle";
  }

  private toggleTarget(entityId: string): void {
    this.selected = this.selected.includes(entityId)
      ? this.selected.filter((id) => id !== entityId)
      : [...this.selected, entityId];
  }

  private async send(): Promise<void> {
    if (!this.blob || this.selected.length === 0) {
      this.error = "Pick at least one speaker first.";
      return;
    }
    this.phase = "sending";
    this.error = undefined;
    try {
      const id = await uploadRecording(this.hass, this.blob, this.duration);
      await sendBroadcast(
        this.hass,
        id,
        this.selected,
        this.config.mode ?? "plain",
      );
      this.discard();
      await this.refreshHistory();
    } catch (err: any) {
      // Keep the recording so it is not lost; the user can retry.
      this.error = `Could not send: ${err?.message ?? err}`;
      this.phase = "preview";
    }
  }

  private async replay(id: string): Promise<void> {
    if (this.selected.length === 0) {
      this.error = "Pick at least one speaker first.";
      return;
    }
    await sendBroadcast(this.hass, id, this.selected, this.config.mode ?? "plain");
  }

  private async remove(id: string): Promise<void> {
    await deleteMessage(this.hass, id);
    await this.refreshHistory();
  }

  render() {
    const recording = this.phase === "recording";
    return html`
      <ha-card header="Voice Broadcast">
        ${this.error ? html`<div class="error">${this.error}</div>` : nothing}

        <div class="row">
          <button
            class="record"
            ?disabled=${!Recorder.isSupported() || this.phase === "sending"}
            @click=${recording ? this.stopRecording : this.startRecording}
            title=${recording ? "Stop" : "Record"}
          >
            ${recording ? "■" : "●"}
          </button>
          <div class="meter"><div style="width:${Math.round(this.level * 100)}%"></div></div>
          <span>${recording ? `${this.elapsed}s` : ""}</span>
        </div>

        ${this.phase === "preview" && this.previewUrl
          ? html`
              <audio controls src=${this.previewUrl}></audio>
              <div class="row">
                <button @click=${this.send}>Send</button>
                <button @click=${this.discard}>Discard</button>
              </div>
            `
          : nothing}

        <div class="targets">
          ${this.players.map(
            (entityId) => html`
              <button
                class="chip"
                data-on=${this.selected.includes(entityId)}
                @click=${() => this.toggleTarget(entityId)}
              >
                ${this.hass.states[entityId].attributes.friendly_name ?? entityId}
              </button>
            `,
          )}
        </div>

        ${this.config.show_history === false
          ? nothing
          : html`
              <div class="history">
                ${this.history.map(
                  (message) => html`
                    <div class="history-row">
                      <span>${new Date(message.created).toLocaleString()}</span>
                      <button @click=${() => this.replay(message.id)}>Play</button>
                      <button @click=${() => this.remove(message.id)}>Delete</button>
                    </div>
                  `,
                )}
              </div>
            `}
      </ha-card>
    `;
  }
}

(window as any).customCards = (window as any).customCards ?? [];
(window as any).customCards.push({
  type: "hass-broadcast-card",
  name: "Voice Broadcast",
  description: "Record a voice message and play it on your speakers.",
  preview: false,
});
```

- [ ] **Step 10: Build the card**

Run: `npm run build`
Expected: `built hass-broadcast-card.js`, and the file exists at `custom_components/hass_broadcast/www/hass-broadcast-card.js`

- [ ] **Step 11: Run the full test suite**

Run: `npm test && pytest tests/ -v`
Expected: PASS

- [ ] **Step 12: Commit**

```bash
git add frontend/src/api.ts frontend/src/errors.ts frontend/src/card.ts frontend/test/api.test.ts frontend/test/errors.test.ts
git commit -m "feat: add the voice broadcast card"
```

---

### Task 12: Visual config editor

**Files:**
- Create: `frontend/src/editor.ts`
- Modify: `frontend/src/card.ts`

**Interfaces:**
- Consumes: `CardConfig` shape from Task 11.
- Produces: custom element `hass-broadcast-card-editor`, already referenced by `HassBroadcastCard.getConfigElement()`.

- [ ] **Step 1: Write the editor**

`frontend/src/editor.ts`:
```typescript
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

interface CardConfig {
  type: string;
  targets?: string[];
  mode?: string;
  max_duration?: number;
  show_history?: boolean;
}

@customElement("hass-broadcast-card-editor")
export class HassBroadcastCardEditor extends LitElement {
  @property({ attribute: false }) hass?: any;
  @state() private config: CardConfig = { type: "" };

  static styles = css`
    .field { display: block; margin-bottom: 12px; }
    label { display: block; margin-bottom: 4px; font-weight: 500; }
    .hint { font-size: 0.85em; color: var(--secondary-text-color); margin-top: 4px; }
  `;

  setConfig(config: CardConfig): void {
    this.config = config;
  }

  private emit(patch: Partial<CardConfig>): void {
    this.config = { ...this.config, ...patch };
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this.config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <div class="field">
        <label for="mode">Playback mode</label>
        <select
          id="mode"
          .value=${this.config.mode ?? "plain"}
          @change=${(e: Event) =>
            this.emit({ mode: (e.target as HTMLSelectElement).value })}
        >
          <option value="plain">Plain — just play the message</option>
          <option value="restore">Restore — put back volume afterwards</option>
          <option value="chime">Chime — attention tone, then the message</option>
        </select>
        <div class="hint">
          Google Cast has no native announce support, so Restore cannot reliably
          resume an interrupted Spotify or YouTube session. It does restore volume.
        </div>
      </div>

      <div class="field">
        <label for="max">Maximum recording length (seconds)</label>
        <input
          id="max"
          type="number"
          min="5"
          max="300"
          .value=${String(this.config.max_duration ?? 60)}
          @change=${(e: Event) =>
            this.emit({
              max_duration: Number((e.target as HTMLInputElement).value),
            })}
        />
      </div>

      <div class="field">
        <label>
          <input
            type="checkbox"
            .checked=${this.config.show_history !== false}
            @change=${(e: Event) =>
              this.emit({
                show_history: (e.target as HTMLInputElement).checked,
              })}
          />
          Show recent recordings
        </label>
      </div>
    `;
  }
}
```

- [ ] **Step 2: Import the editor from the card**

Add this line to the top of `frontend/src/card.ts`, after the existing imports, so the editor is bundled into the single card file:
```typescript
import "./editor";
```

- [ ] **Step 3: Build and verify both elements are in the bundle**

Run: `npm run build && grep -c "hass-broadcast-card-editor" custom_components/hass_broadcast/www/hass-broadcast-card.js`
Expected: build succeeds and the count is at least 1

- [ ] **Step 4: Commit**

```bash
git add frontend/src/editor.ts frontend/src/card.ts
git commit -m "feat: add visual config editor for the card"
```

---

### Task 13: README

**Files:**
- Create: `README.md`

This task implements the spec's "README — required content" section. Every numbered item below is required; do not summarize them away. The README's job is to stop a user losing an hour to a restriction we already know about.

- [ ] **Step 1: Write the README**

`README.md`:
````markdown
# Voice Broadcast for Home Assistant

Record a voice message in your Home Assistant dashboard and play it on your
speakers — a simple intercom, without leaving the UI.

## Installation

### HACS (recommended)

1. In HACS, choose **Integrations → ⋮ → Custom repositories**.
2. Add `https://github.com/ToMeRhh/hass_broadcast` as an **Integration**.
3. Install **Voice Broadcast**, then restart Home Assistant.
4. Go to **Settings → Devices & services → Add integration** and add **Voice Broadcast**.

### Manual

Copy `custom_components/hass_broadcast/` into your Home Assistant `config/custom_components/`
directory and restart, then add the integration as above.

You do **not** need to add a Lovelace resource — the integration serves and registers
the card itself.

## Usage

Add the **Voice Broadcast** card to any dashboard. Then:

1. Press the round record button and speak.
2. Press it again to stop. The recording plays back locally so you can check it.
3. Select one or more speakers.
4. Press **Send**.

Recent recordings appear below the card and can be replayed or deleted.

### Card options

| Option | Default | Meaning |
| --- | --- | --- |
| `targets` | `[]` | Speakers selected when the card loads |
| `mode` | `plain` | `plain`, `restore`, or `chime` — see [Playback modes](#playback-modes) |
| `max_duration` | `60` | Recording stops automatically after this many seconds |
| `show_history` | `true` | Show the list of recent recordings |

### Using it from an automation

```yaml
action:
  - service: hass_broadcast.send
    data:
      message_id: "{{ message_id }}"
      targets:
        - media_player.kitchen
        - media_player.office
      mode: plain
```

## Requirements and restrictions

**Please read this section before filing a bug.** Most problems people hit are one of
the items below.

### Hard requirements

1. **HTTPS is required to record.** Browsers only expose the microphone in a *secure
   context*. If you open Home Assistant at `http://192.168.1.50:8123`, recording will
   not work — usually with no visible error at all. Any of these are fine: HTTPS with a
   valid certificate, Home Assistant Cloud (Nabu Casa), Tailscale, Cloudflare Tunnel, or
   `http://localhost:8123`. The card detects an insecure context and tells you so instead
   of failing silently.

   The **Home Assistant Companion app** works, since it connects over HTTPS. You may need
   to grant microphone permission to the app itself in your phone's settings the first time.

2. **Set `internal_url` to a LAN address if you use Google Cast.** When you broadcast, the
   Cast device fetches the audio file from Home Assistant *itself* — Home Assistant does
   not push audio to it. Home Assistant picks the URL via `get_url()`, which prefers the
   internal URL. With `internal_url` set to your LAN address, the speaker fetches over your
   local network and never goes out to the internet:

   ```yaml
   homeassistant:
     internal_url: "http://192.168.1.50:8123"
     external_url: "https://hass.example.com"
   ```

3. **Cloudflare Access / Zero Trust in front of Home Assistant breaks Cast playback** if the
   Cast device has to fetch through it. A speaker cannot log in to an Access challenge, so
   the fetch fails and nothing plays. Setting `internal_url` as in item 2 avoids this
   entirely, because the speaker never goes through Cloudflare. If you must expose media
   through Cloudflare, add a bypass rule for `/api/hass_broadcast/media/*`.

4. **Target speakers must support `PLAY_MEDIA`.** The card only lists media players that
   advertise this feature. A player that cannot accept a URL will not appear.

5. **A modern browser is required** for `AudioWorklet` — any current Chrome, Edge, Firefox,
   or Safari. Very old browsers will show the unsupported message.

### Behavioural restrictions

6. **There is no ducking or resume on Google Cast.** Home Assistant's Cast integration does
   not implement the `announce` feature, so a broadcast simply interrupts whatever was
   playing. The card's `restore` mode is an *emulation*: it snapshots and restores the
   volume reliably, but it **cannot dependably resume an active Spotify, YouTube Music, or
   radio session** — that is a Cast limitation, not something this integration can fix.
   `plain` is the default for exactly this reason. Treat `restore` as best-effort.

7. **Audio is WAV, or MP3 when ffmpeg is available.** Recordings are captured as 16 kHz mono
   16-bit PCM and wrapped in a WAV container in the browser. If `ffmpeg` is on the system
   path — it is in every official Home Assistant image — the file is transcoded to MP3 to
   save space. If it is not, the WAV is kept and everything still works. ffmpeg is an
   optimization, never a requirement.

   **Why not Opus?** The browser's built-in `MediaRecorder` produces Opus in a WebM
   container in Chrome and AAC in Safari. Google Cast documents Opus as supported, but in
   practice plays it reliably only inside a WebM *video* container — audio-only Opus often
   fails. Capturing raw PCM avoids both the codec divergence between browsers and the Cast
   compatibility problem.

8. **Only Google Cast is tested.** Sonos, ESPHome media players, Squeezelite, and the
   Voice Preview Edition all use the same `play_media` path and are expected to work, but
   they are not verified. Alexa devices will **not** work: they cannot play arbitrary URLs.

### Storage and privacy

9. **Recordings are stored unencrypted** in `<config>/hass_broadcast/`, and are therefore
   **included in your Home Assistant backups**. If you back up off-site, your voice
   messages go with it.

10. **Retention defaults to the last 10 recordings.** Older ones are deleted automatically
    when a new one arrives. Change this in **Settings → Devices & services → Voice
    Broadcast → Configure**.

11. **Any Home Assistant user who can see the card can record and broadcast.** Uploads
    require a valid login but are deliberately *not* restricted to administrators — Home
    Assistant's own media upload endpoint is admin-only, which would stop non-admin
    household members from using the card at all. If you do not want a particular user
    broadcasting, do not put the card on a dashboard they can see.

    Playback URLs are individually signed and short-lived, so recordings are never served
    unauthenticated. They are deliberately not placed in `config/www/`, which Home
    Assistant serves with no authentication whatsoever.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Record button is disabled | Not a secure context — see restriction 1 |
| "Microphone permission was denied" | Allow the microphone for this site, or for the Companion app |
| Nothing plays, no error | Cast could not fetch the URL — check `internal_url` (2) and Cloudflare Access (3) |
| Speaker missing from the list | It does not advertise `PLAY_MEDIA` (4) |
| Music does not resume after a broadcast | Expected on Cast — see restriction 6 |

## Development

```bash
pip install -r requirements_test.txt
pytest tests/ -v          # integration tests

npm install
npm test                  # card tests
npm run build             # bundle the card into custom_components/hass_broadcast/www/
```

## License

MIT
````

- [ ] **Step 2: Verify every required restriction is present**

Run:
```bash
for term in "HTTPS is required" "internal_url" "Cloudflare Access" "PLAY_MEDIA" "AudioWorklet" \
            "no ducking or resume" "Why not Opus" "Only Google Cast is tested" \
            "stored unencrypted" "Retention defaults" "can record and broadcast"; do
  grep -q "$term" README.md && echo "ok: $term" || echo "MISSING: $term"
done
```
Expected: eleven `ok:` lines, no `MISSING:`

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document installation, usage and all known restrictions"
```

---

## Final verification

- [ ] **Run the whole suite**

```bash
pytest tests/ -v && npm test && npm run build
```
Expected: all Python tests pass, all frontend tests pass, the bundle builds.

- [ ] **Manual end-to-end check against a real Home Assistant**

1. Copy `custom_components/hass_broadcast/` to your HA config directory and restart.
2. Add the integration, then add the card to a dashboard.
3. Record a five-second message and confirm the preview plays.
4. Select a Cast speaker and press Send. Confirm it plays.
5. Confirm the recording appears in the history list, replays, and deletes.
6. Confirm `<config>/hass_broadcast/` holds exactly the expected files.
7. Upload eleven recordings and confirm the oldest is pruned (default retention is 10).
8. Load the dashboard over plain `http://<lan-ip>:8123` and confirm the card shows the
   HTTPS message rather than failing silently.

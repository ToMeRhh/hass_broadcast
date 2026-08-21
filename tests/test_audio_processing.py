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

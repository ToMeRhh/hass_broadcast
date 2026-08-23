"""Tests for MP3 transcoding."""

import logging
from unittest.mock import AsyncMock, patch

import pytest

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


async def test_encodes_at_a_universally_decodable_sample_rate(
    hass: HomeAssistant,
) -> None:
    """The MP3 must be MPEG-1 Layer III, not a 16 kHz MPEG-2 variant.

    Capture is 16 kHz mono, and without an explicit rate ffmpeg carries that
    through to the MP3 -- which makes it MPEG-2 Layer III, since MPEG-1 only
    defines 32/44.1/48 kHz. Low-sample-rate MP3 is the variant embedded
    hardware decoders are least reliable at. Resampling is what makes "MP3"
    actually mean the format every player handles.
    """
    process = AsyncMock()
    process.communicate.return_value = (b"ID3mp3data", b"")
    process.returncode = 0
    exec_mock = AsyncMock(return_value=process)

    with (
        patch(
            "custom_components.hass_broadcast.audio_processing.shutil.which",
            return_value="/usr/bin/ffmpeg",
        ),
        patch(
            "custom_components.hass_broadcast.audio_processing."
            "asyncio.create_subprocess_exec",
            exec_mock,
        ),
    ):
        await async_transcode_to_mp3(hass, b"RIFFfake")

    argv = exec_mock.call_args.args
    assert "-ar" in argv, f"no sample rate forced: {argv}"
    assert argv[argv.index("-ar") + 1] == "44100"


async def test_warns_when_falling_back_to_wav(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """Losing MP3 is a degraded install, so say so above debug level.

    MP3 is the format every media player decodes; WAV is the fallback for
    installs without ffmpeg. At debug level that downgrade is invisible, so
    a user whose speaker rejects the WAV has nothing to go on.
    """
    with patch(
        "custom_components.hass_broadcast.audio_processing.shutil.which",
        return_value=None,
    ):
        assert await async_transcode_to_mp3(hass, b"RIFFfake") is None

    assert any(
        record.levelno >= logging.WARNING and "ffmpeg" in record.message
        for record in caplog.records
    ), f"no warning about the WAV fallback: {caplog.records}"

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

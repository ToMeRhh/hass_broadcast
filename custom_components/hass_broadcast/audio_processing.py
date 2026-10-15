"""Transcode recordings to MP3, the one format every media player decodes."""

from __future__ import annotations

import asyncio
import logging
import shutil

from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

# MPEG-1 Layer III defines 32/44.1/48 kHz only. Capture can be as low as
# 16 kHz (the card trades rate for length on long takes), so without
# an explicit rate ffmpeg emits MPEG-2 Layer III -- still "an MP3", but the
# low-sample-rate variant that embedded hardware decoders are least reliable
# at. Resampling costs a few KB on a voice message and is what makes the
# output the format every player actually handles.
SAMPLE_RATE = "44100"
# Capture is up to 48 kHz. At 64k LAME low-passes a mono stream to roughly
# 11 kHz and smears consonants; 128k keeps the full band for a voice message
# that is still only ~1 MB a minute.
BITRATE = "128k"


async def async_transcode_to_mp3(hass: HomeAssistant, wav_data: bytes) -> bytes | None:
    """Transcode WAV to MP3, or return None if ffmpeg cannot do it.

    Home Assistant never transcodes on the playback path: `play_media` hands
    the target a URL and the speaker's own firmware fetches and decodes it.
    So the bytes we store are the bytes the hardware has to understand, and
    MP3 is the widest-support choice across Cast, Sonos, DLNA, AirPlay and
    ESPHome media players alike.

    Returning None is the degraded path, not an error: callers keep the
    original WAV, which most players also handle. ffmpeg stays an
    optimization rather than a dependency.
    """
    ffmpeg = await hass.async_add_executor_job(shutil.which, "ffmpeg")
    if ffmpeg is None:
        _LOGGER.warning(
            "ffmpeg was not found on PATH, so recordings are stored as WAV "
            "instead of MP3. Playback still works on most speakers; install "
            "ffmpeg if a target rejects the recording"
        )
        return None

    try:
        process = await asyncio.create_subprocess_exec(
            ffmpeg,
            "-hide_banner",
            "-loglevel", "error",
            "-i", "pipe:0",
            "-codec:a", "libmp3lame",
            "-ar", SAMPLE_RATE,
            "-b:a", BITRATE,
            "-f", "mp3",
            "pipe:1",
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate(wav_data)
    except OSError as err:
        _LOGGER.warning("ffmpeg could not be started (%s); keeping WAV", err)
        return None

    if process.returncode != 0 or not stdout:
        _LOGGER.warning(
            "ffmpeg failed (%s), keeping WAV: %s", process.returncode, stderr
        )
        return None

    return stdout

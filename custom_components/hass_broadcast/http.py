"""HTTP views for hass_broadcast."""

from __future__ import annotations

from http import HTTPStatus
import io
import wave

from aiohttp import web
from homeassistant.components.http import KEY_HASS_USER, HomeAssistantView
from homeassistant.core import HomeAssistant

from .audio_processing import async_transcode_to_mp3
from .const import MAX_UPLOAD_BYTES
from .storage import async_get_store


def _parse_wav_duration(raw: bytes) -> float | None:
    """Return the true duration of a WAV file in seconds, or None.

    Runs synchronously (parsing an in-memory buffer, no I/O) but is called
    via `hass.async_add_executor_job` since it's non-trivial CPU work that
    shouldn't run inline on the event loop. Broad `except Exception` is
    deliberate: the input is an untrusted client upload, and any parse
    failure -- malformed header, truncated data, a "WAV" that isn't really
    one -- should fall back to the client-supplied value rather than raise.
    """
    try:
        with wave.open(io.BytesIO(raw), "rb") as reader:
            frames = reader.getnframes()
            rate = reader.getframerate()
            if rate <= 0:
                return None
            return frames / rate
    except Exception:  # noqa: BLE001 - untrusted input, fall back on any failure
        return None


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
        store = async_get_store(hass)
        if store is None:
            return web.json_response(
                {"message": "Voice Broadcast is not set up"},
                status=HTTPStatus.SERVICE_UNAVAILABLE,
            )

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

        # `.file` is a real tempfile handle (aiohttp buffers multipart file
        # fields to disk); `.read()` is a blocking syscall, so it must not
        # run inline on the event loop.
        raw = (
            await hass.async_add_executor_job(file_field.file.read)
            if hasattr(file_field, "file")
            else file_field
        )
        if isinstance(raw, str):
            raw = raw.encode()

        # This is a post-buffer check: aiohttp/HA has already read the full
        # body into `raw` by this point (bounded by HA's own 16 MB
        # client_max_size), so it is not unbounded, but it does mean an
        # oversized-but-under-16MB upload is fully buffered before being
        # rejected here. Streaming/early-abort validation is out of scope
        # for this task.
        if len(raw) > MAX_UPLOAD_BYTES:
            return web.json_response(
                {"message": "Recording too large"},
                status=HTTPStatus.REQUEST_ENTITY_TOO_LARGE,
            )

        # The RIFF magic alone is shared by the whole RIFF family (AVI, WebP,
        # ANI); the WAVE form type at bytes 8-12 is what actually makes it a
        # WAV. Without it a WebP would be accepted with 200 here and later
        # served back as audio/wav.
        if not (raw[:4] == b"RIFF" and raw[8:12] == b"WAVE"):
            return web.json_response(
                {"message": "Only WAV uploads are accepted"},
                status=HTTPStatus.BAD_REQUEST,
            )

        try:
            client_duration = float(data.get("duration", 0))
        except (TypeError, ValueError):
            client_duration = 0.0

        # Duration is derived server-side from the actual WAV data whenever
        # possible: the client-supplied form field is untrusted and, in
        # restore mode, an understated duration would restore volume while
        # the message is still audibly playing. The client value is only a
        # fallback for when parsing fails.
        parsed_duration = await hass.async_add_executor_job(_parse_wav_duration, raw)
        duration = parsed_duration if parsed_duration is not None else client_duration

        # MP3 is the format we aim to store: the speaker fetches and decodes
        # the file itself, so the stored bytes are what the hardware has to
        # understand, and MP3 is the one encoding the whole media_player
        # ecosystem handles. WAV is the fallback for installs without ffmpeg,
        # not the preferred output -- async_transcode_to_mp3 warns when it
        # takes that path.
        payload, extension = raw, "wav"
        if (mp3 := await async_transcode_to_mp3(hass, raw)) is not None:
            payload, extension = mp3, "mp3"

        message_id = await store.async_add(
            payload,
            extension=extension,
            duration=duration,
            # KEY_HASS_USER rather than the "hass_user" literal: Home
            # Assistant is migrating request keys to AppKey, and a moved key
            # would make a literal lookup silently yield user_id=None on every
            # upload -- quietly disabling the ownership model instead of
            # failing loudly.
            user_id=(user.id if (user := request.get(KEY_HASS_USER)) else None),
        )
        return web.json_response({"message_id": message_id})


CONTENT_TYPES = {"wav": "audio/wav", "mp3": "audio/mpeg"}


class BroadcastMediaView(HomeAssistantView):
    """Serve a stored recording.

    requires_auth = True is deliberate: it makes Home Assistant's signed-path
    middleware apply, which is how the target speaker fetches the file without
    the recording being served unauthenticated. Playback is always the device
    pulling this URL itself -- Home Assistant only hands it the address.
    """

    url = "/api/hass_broadcast/media/{message_id}.{extension}"
    name = "api:hass_broadcast:media"
    requires_auth = True

    async def get(
        self, request: web.Request, message_id: str, extension: str
    ) -> web.StreamResponse:
        """Return the recording."""
        hass: HomeAssistant = request.app["hass"]
        store = async_get_store(hass)
        if store is None:
            return web.Response(status=HTTPStatus.NOT_FOUND)

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


def async_register_views(hass: HomeAssistant) -> None:
    """Register the HTTP views."""
    hass.http.register_view(BroadcastUploadView())
    hass.http.register_view(BroadcastMediaView())

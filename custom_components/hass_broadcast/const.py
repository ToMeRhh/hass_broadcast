"""Constants for hass_broadcast."""

DOMAIN = "hass_broadcast"

# Key under hass.data[DOMAIN][entry_id] holding the BroadcastStore. It lives
# here, rather than in __init__.py, so http/media_source/playback/websocket
# can import it at module level instead of each deferring the import inside a
# helper to dodge a circular dependency on the package root.
DATA_STORE = "store"

STATIC_URL = "/api/hass_broadcast/static"
CARD_URL = f"{STATIC_URL}/hass-broadcast-card.js"
CHIME_URL = f"{STATIC_URL}/chime.wav"

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

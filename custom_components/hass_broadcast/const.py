"""Constants for hass_broadcast."""

DOMAIN = "hass_broadcast"

STATIC_URL = "/api/hass_broadcast/static"
CARD_URL = f"{STATIC_URL}/hass-broadcast-card.js"
CHIME_URL = f"{STATIC_URL}/chime.wav"
# The chime's media source identifier. Recording ids are uuid4 hex, so a
# word cannot collide with one.
CHIME_ID = "chime"

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

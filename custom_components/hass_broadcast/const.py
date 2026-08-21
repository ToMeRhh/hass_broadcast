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

# Types `voluptuous` as what Home Assistant makes it at runtime: probatio.
#
# Home Assistant 2026.10, the release under test, replaces voluptuous with
# probatio and aliases it in sys.modules (`install_as_voluptuous()` in
# homeassistant/__init__.py), so `vol.Required` in the integration is
# probatio's. Home Assistant's signatures are typed against probatio, while
# mypy would read the real voluptuous package, which is still installed, and
# report every schema handed to Home Assistant as the wrong type.
#
# The integration keeps importing voluptuous because the 2024.12 floor has no
# probatio. Delete this stub if the floor ever reaches a release that does,
# and import probatio instead.

from probatio import *  # noqa: F403

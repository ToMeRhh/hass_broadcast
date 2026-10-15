"""Tests for the HACS manifest."""

import json
from pathlib import Path

from custom_components.hass_broadcast.const import DOMAIN

HACS_JSON = Path(__file__).parent.parent / "hacs.json"


def test_hacs_zip_release_is_named_after_the_domain() -> None:
    """HACS downloads the release asset that `filename` names.

    The Release workflow attaches `<domain>.zip`; if the two disagree, every
    HACS install of that release fails to find its download.
    """
    hacs = json.loads(HACS_JSON.read_text())
    assert hacs["zip_release"] is True
    assert hacs["filename"] == f"{DOMAIN}.zip"

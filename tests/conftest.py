"""Fixtures for hass_broadcast tests."""

import pytest


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable loading custom integrations in all tests."""
    return


@pytest.fixture(scope="session", autouse=True)
def _warm_pycares_shutdown_thread():
    """Pre-start pycares' background shutdown thread before any test runs.

    Home Assistant's shared aiohttp client uses aiodns' AsyncResolver when
    aiodns/pycares are installed (a transient dependency of Home Assistant
    itself, present in this environment). The first test that performs a
    real request through `hass_client`/`hass_client_no_auth` causes aiohttp
    to construct that resolver, whose teardown lazily spins up a long-lived
    "Thread-1 (_run_safe_shutdown_loop)" thread (see
    `pycares._ChannelShutdownManager`). That thread's name isn't recognized
    by pytest_homeassistant_custom_component's `verify_cleanup` autouse
    fixture (which only allow-lists `waitpid-*` threads), so whichever test
    happens to trigger it first fails cleanup with an unrelated
    AssertionError. Constructing a throwaway pycares Channel here, before
    the first test's thread snapshot is taken, starts that thread up front
    so every test sees it as already present and none gets blamed for it.
    """
    try:
        import pycares  # noqa: PLC0415 -- optional: absent, there is no thread to warm
    except ImportError:
        return
    pycares.Channel()

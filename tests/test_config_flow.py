"""Tests for the config and options flows."""

from homeassistant.config_entries import SOURCE_USER, ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
import voluptuous as vol

from custom_components.hass_broadcast.const import (
    CONF_RETENTION,
    DEFAULT_RETENTION,
    DOMAIN,
)


async def _set_up_entry(hass: HomeAssistant, **options) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, unique_id=DOMAIN, data={}, options=options)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_user_step_creates_the_entry(hass: HomeAssistant) -> None:
    """There is nothing to ask, so the first step creates the entry outright."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": SOURCE_USER}
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Voice Broadcast"
    assert result["data"] == {}

    entries = hass.config_entries.async_entries(DOMAIN)
    assert len(entries) == 1
    assert entries[0].unique_id == DOMAIN
    assert entries[0].state is ConfigEntryState.LOADED


async def test_a_second_entry_is_refused(hass: HomeAssistant) -> None:
    """The integration is single-instance: one store, one card resource.

    The guard is the fixed unique_id (the domain) plus
    `_abort_if_unique_id_configured`, so the abort reason is
    `already_configured`, not `single_instance_allowed`.
    """
    first = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": SOURCE_USER}
    )
    await hass.async_block_till_done()
    assert first["type"] is FlowResultType.CREATE_ENTRY

    second = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": SOURCE_USER}
    )
    assert second["type"] is FlowResultType.ABORT
    assert second["reason"] == "already_configured"
    assert len(hass.config_entries.async_entries(DOMAIN)) == 1


async def test_options_flow_shows_and_saves_retention(hass: HomeAssistant) -> None:
    """The options form offers the current retention and persists a new one."""
    entry = await _set_up_entry(hass)

    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "init"
    assert CONF_RETENTION in result["data_schema"].schema

    result = await hass.config_entries.options.async_configure(
        result["flow_id"], user_input={CONF_RETENTION: 25}
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options == {CONF_RETENTION: 25}


async def test_options_form_suggests_the_saved_retention(hass: HomeAssistant) -> None:
    """Reopening the options shows the value saved last time, not the default."""
    entry = await _set_up_entry(hass, **{CONF_RETENTION: 42})

    result = await hass.config_entries.options.async_init(entry.entry_id)

    (key,) = (k for k in result["data_schema"].schema if k == CONF_RETENTION)
    assert key.description == {"suggested_value": 42}
    assert key.default() == DEFAULT_RETENTION


@pytest.mark.parametrize("retention", [0, 201, -5])
async def test_options_flow_rejects_retention_out_of_range(
    hass: HomeAssistant, retention: int
) -> None:
    """Retention must be 1..200; anything else is refused and nothing is saved."""
    entry = await _set_up_entry(hass)

    result = await hass.config_entries.options.async_init(entry.entry_id)
    with pytest.raises(vol.Invalid):
        await hass.config_entries.options.async_configure(
            result["flow_id"], user_input={CONF_RETENTION: retention}
        )

    assert entry.options == {}


@pytest.mark.parametrize("retention", [1, 200])
async def test_options_flow_accepts_the_range_bounds(
    hass: HomeAssistant, retention: int
) -> None:
    """Both ends of 1..200 are valid."""
    entry = await _set_up_entry(hass)

    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], user_input={CONF_RETENTION: retention}
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options == {CONF_RETENTION: retention}


async def test_changing_options_reloads_the_entry(hass: HomeAssistant) -> None:
    """Saving options reloads the entry, so the new retention takes effect.

    The store reads retention only when it is built in async_setup_entry; a
    missing update listener would leave the old limit in force until restart.
    """
    entry = await _set_up_entry(hass)
    before = entry.runtime_data.store
    assert before.retention == DEFAULT_RETENTION

    result = await hass.config_entries.options.async_init(entry.entry_id)
    await hass.config_entries.options.async_configure(
        result["flow_id"], user_input={CONF_RETENTION: 3}
    )
    await hass.async_block_till_done()

    assert entry.state is ConfigEntryState.LOADED
    after = entry.runtime_data.store
    assert after is not before
    assert after.retention == 3

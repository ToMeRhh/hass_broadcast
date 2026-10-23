"""Config flow for Voice Broadcast."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
import voluptuous as vol

from .const import CONF_RETENTION, DEFAULT_RETENTION, DOMAIN

OPTIONS_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_RETENTION, default=DEFAULT_RETENTION): vol.All(
            int, vol.Range(min=1, max=200)
        ),
    }
)


class BroadcastConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the config flow."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        return self.async_create_entry(title="Voice Broadcast", data={})

    @staticmethod
    def async_get_options_flow(config_entry: ConfigEntry) -> BroadcastOptionsFlow:
        """Return the options flow."""
        return BroadcastOptionsFlow()


class BroadcastOptionsFlow(OptionsFlow):
    """Handle the options flow."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(data=user_input)
        return self.async_show_form(
            step_id="init",
            data_schema=self.add_suggested_values_to_schema(
                OPTIONS_SCHEMA, self.config_entry.options
            ),
        )

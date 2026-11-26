/** MediaPlayerEntityFeature.PLAY_MEDIA — the one feature this card needs. */
const SUPPORT_PLAY_MEDIA = 512;

/** Every media player Home Assistant knows about that can play a URL. */
export function discoverPlayers(hass: any): string[] {
  if (!hass?.states) {
    return [];
  }
  return Object.keys(hass.states)
    .filter((entityId) => entityId.startsWith("media_player."))
    .filter(
      (entityId) =>
        (hass.states[entityId].attributes.supported_features &
          SUPPORT_PLAY_MEDIA) !==
        0,
    )
    .sort();
}

/**
 * What to call a speaker: its friendly name, led by its area when the name
 * does not already say it.
 *
 * Home Assistant's naming guidance keeps the room in the area, not in the
 * device name, so a house named that way has friendly names like "Chromecast"
 * three times over. Its own cards add the area back as context; a speaker
 * picker needs it most of all, since the room is what a broadcast is aimed at.
 *
 * The friendly name stays the base rather than being rebuilt from the device
 * and entity registries, so whatever composed it (a renamed device, an entity
 * name, a customize override) is kept. The area comes from the entity, else
 * its device, as Home Assistant resolves it. A name that mentions the area
 * anywhere, as a whole word in any case, is left alone, so a house named the
 * older way ("Kitchen speaker") sees nothing change; so does anything before
 * the registries load, or an entity with no state to name it by.
 */
export function speakerName(hass: any, entityId: string): string {
  const friendly: unknown = hass?.states?.[entityId]?.attributes?.friendly_name;
  if (typeof friendly !== "string" || !friendly) {
    return entityId;
  }
  const entry = hass?.entities?.[entityId];
  const areaId = entry?.area_id || hass?.devices?.[entry?.device_id]?.area_id;
  const area: unknown = areaId ? hass?.areas?.[areaId]?.name : undefined;
  if (typeof area !== "string" || !area.trim() || mentions(friendly, area.trim())) {
    return friendly;
  }
  return `${area.trim()} ${friendly}`;
}

/** Whether `phrase` appears in `text` as whole words, ignoring case. */
function mentions(text: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "iu").test(text);
}

/**
 * The speakers the card should offer.
 *
 * A configured `speakers` list replaces discovery outright rather than
 * filtering it: an entity named there appears even if it is currently
 * unavailable or under-reports supported_features, which is the whole point of
 * naming it. Absent means every discovered speaker; an empty list means none.
 */
export function visiblePlayers(discovered: string[], speakers?: string[]): string[] {
  return speakers ? [...new Set(speakers)] : discovered;
}

/**
 * Trim a selection to the speakers the card offers.
 *
 * A speaker selected but not offered must not keep receiving broadcasts
 * invisibly. This looks only at the configured list, never at discovery, so an
 * unloaded entity registry cannot silently empty the selection.
 */
export function allowedTargets(selected: string[], speakers?: string[]): string[] {
  if (!speakers) {
    return selected;
  }
  const offered = new Set(speakers);
  return selected.filter((entityId) => offered.has(entityId));
}

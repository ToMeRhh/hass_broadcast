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

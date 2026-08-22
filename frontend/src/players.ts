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
 * A non-empty `show` list replaces discovery outright rather than filtering
 * it: an entity named there appears even if it is currently unavailable or
 * under-reports supported_features, which is the whole point of naming it.
 * `hide` is subtracted last, so it wins over `show`.
 */
export function visiblePlayers(
  discovered: string[],
  show?: string[],
  hide?: string[],
): string[] {
  const base = show?.length ? [...new Set(show)] : discovered;
  if (!hide?.length) {
    return base;
  }
  const hidden = new Set(hide);
  return base.filter((entityId) => !hidden.has(entityId));
}

/**
 * Trim a saved `targets` selection to what the filters still allow.
 *
 * A speaker preselected before it was hidden must not keep receiving
 * broadcasts invisibly. This looks only at the configured lists, never at
 * discovery, so an unloaded entity registry cannot silently empty the
 * selection.
 */
export function allowedTargets(
  selected: string[],
  show?: string[],
  hide?: string[],
): string[] {
  const shown = show?.length ? new Set(show) : undefined;
  const hidden = new Set(hide ?? []);
  return selected.filter(
    (entityId) =>
      (shown === undefined || shown.has(entityId)) && !hidden.has(entityId),
  );
}

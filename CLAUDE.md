# hass_broadcast

Home Assistant custom integration ("Voice Broadcast"): record a voice message in a
Lovelace card and play it on media players. Python integration in
`custom_components/hass_broadcast/`, TypeScript/Lit card in `frontend/src/`.

## Commands

```bash
.venv/bin/python -m pytest -q   # integration tests (65)
npm test                        # card tests, vitest (197)
npm run build                   # bundle the card into custom_components/hass_broadcast/www/
npm run dev                     # card dev harness, all interfaces :8099 (frontend/dev/README.md)
                                # /lab: A/B recording-quality presets by ear
npm run dev -- --host 127.0.0.1 --port 9000   # or HOST=/PORT= env vars
npm run check:layout            # headless: no element moves between card states
npm run dev:editor              # the editors, drawn by HA's own frontend (gallery), :8100
npm run dev:editor -- --screenshots   # regenerate docs/images/editor-{light,dark}.png
```

`check:layout` drives the harness in headless Chromium (`playwright-core`, a
dev dependency) and compares every `.slot`'s box across idle, recording,
review and sending. CI runs it as its own job (`layout` in `ci.yml`, which
uploads the screenshots on failure); run it locally too after any change to
the card's markup or CSS. First run on a machine: `npx playwright-core install
chromium`.

`npm run dev` renders the real card and tile against a mocked `hass`, with
live reload and switches for the states that are painful to reach on a live
install (mic denied, partial broadcast failure, empty history, latency). Real
microphone capture works because `localhost` is a secure context. It is a
separate esbuild entry point and never touches the shipped bundle. Iterate on
card UI there rather than by deploying to Home Assistant.

The editors cannot be shown there: they are Home Assistant's own forms. `npm
run dev:editor` runs HA's design gallery from a pinned home-assistant/frontend
commit in `.cache/` with a page of ours (`frontend/dev/editor/`), so iterate on
`forms.ts` there. Its first run downloads a lot; it is not in CI.

Use `.venv/bin/python`, not a bare `python`. The test env pins
`pytest-homeassistant-custom-component`, which is what pins the Home Assistant
version under test — currently 2025.1.4. Live installs run much newer releases,
so code that touches Home Assistant internals must tolerate both (see
`_lovelace_resources` in `__init__.py` for the pattern).

`tsconfig.json` sets `"lib": ["ES2021", "DOM"]` with `noEmit`, so `npx tsc
--noEmit` is a supported check even though CI does not run it —
`Array.prototype.at` is ES2022 and must not appear in `frontend/`.

## Card configuration keys

The card's config is flat, one key per editor field: `title`, `layout`
(`full` | `compact`), `speaker_picker` (`dropdown` | `chips` | `list`),
`recent_messages` (`off` | `button` | `list`), `volume_control`, `speakers`,
`selected`, `record_mode`, `max_duration`, `noise_suppression`, `mode`. The
tile's is `name`, `speakers`, `shape`, `max_duration`, `noise_suppression`,
`mode`. Nothing is ordered: the layouts
decide placement. The README's options tables are the reference.

All config interpretation lives in `resolveConfig` in `config.ts` — defaults,
compact forcing the dropdown, and `speakers` absent (every speaker) versus `[]`
(none; HA's entity picker saves `[]` when the last one is removed). Don't read
raw config keys anywhere else in the card.

There are no legacy keys and no migration: the integration had no installs
when the config was flattened (2026-10-15), so `sections`, `player_list`,
`show_history`, `show_players`, `hide_players` and `targets` were simply
removed. Don't reintroduce compatibility readers for them.

The editors are `getConfigForm()` schemas in `forms.ts`, not custom elements.
`ha-form` and the `ha-*` selectors are HA internals: hosting them in an element
of ours needs a lazy-load workaround that has broken custom cards before, so
don't. A field that `getConfigForm` cannot express is a reason to reshape the
config, not to write an editor element. `forms.test.ts` holds that every config
key has exactly one field. Features newer than the 2024.11 minimum degrade
acceptably: select `mode: box` (2025.3) falls back to a plain select, and
`visible` (2026.8) is ignored, so the speaker-picker field shows in compact too.

`noise_suppression` (both cards) turns on the browser's noise suppression and
nothing else; absent or `false` means off (HA's boolean selector writes
`false` when it is switched off). The rest of the browser's call processing
stays off — see `RAW_MIC` in `recorder.ts` for why.

The bundle defines two cards: `hass-broadcast-card` and
`hass-broadcast-tile` (`tile.ts`, imported from `card.ts` so the one Lovelace
resource brings both). Both drive the microphone through `RecordingController`
(`recording.ts`) and send through `sendClip` (`sending.ts`); they differ only
in what they do with a finished take. The tile is push-to-talk regardless of
config, because its release is what sends.

The record core (strip, mic, Discard, Send) is not configurable: it is what
guarantees no layout shift between states. Any
state-dependent region must be a fixed-size `.slot`, with its states as
stacked `layers()` (see `ui/strip.ts`), never conditionally rendered.

`getStubConfig(hass)` on each card is what a new card starts from: the card's
lists every playback-capable speaker in `speakers` (the user removes the ones
they don't want), the tile's picks the first one.

## The integration registers no Home Assistant service

Broadcasting is reached over the `hass_broadcast/send` websocket command, beside
`/list` and `/delete` in `websocket.py`. It was a service, `hass_broadcast.send`,
and that was a mistake: `hass.services.async_register` has no visibility flag, so
registering one publishes it to Developer Tools, to the automation editor's
action picker and to `/api/services`. There is no such thing as a private
service.

That surface was also unusable in practice — the required `message_id` is an
opaque storage id no automation author can obtain without reading `.storage` by
hand — so it was advertised API that nobody could call.

Installing this integration should add a Lovelace card and nothing else.
`tests/test_playback.py::test_no_broadcast_service_is_registered` asserts the
absence, because the instinct when adding a backend capability is to reach for a
service and nothing else in the suite would notice.

The media source in `media_source.py` is the deliberate exception: it stays
registered and browsable, because `play_media` resolving `media-source://` ids is
what lets Home Assistant own URL signing across versions.

## The card bundle is a committed build output

`custom_components/hass_broadcast/www/hass-broadcast-card.js` is generated by
`npm run build` and **committed**. `.gitignore` ignores `www/*.js` and then
un-ignores this file and `recorder-worklet.js` by name. Installs get exactly what
is committed — there is no build step on the user's machine.

**Whenever anything under `frontend/src/` changes, run `npm run build` and commit
the result in the same commit.** A source change without a rebuilt bundle ships
nothing.

## Bump `version` in manifest.json whenever the bundle changes

The card is registered as a Lovelace resource whose URL is
`/api/hass_broadcast/static/hass-broadcast-card.js?v=<manifest version>`
(`_async_register_card` in `__init__.py`). That query string is the **only** thing
that busts frontend caches.

If the bundle changes and `version` does not, the resource URL is unchanged, and
browsers — especially the Android companion app's WebView — keep serving the
cached copy of the previous build. The change silently does not reach users, and
it looks like the code is broken rather than stale.

You do not bump the version by hand per commit — the Release workflow does it
(see below). But that means **a change on `master` has not reached anyone until a
release is cut**: users pulling the default branch get the new bundle file at the
old `?v=` URL and keep serving their cached copy. Cutting the release is the
delivery event, not merging to `master`.

`.github/workflows/ci.yml` guards the other half: it rebuilds the bundle and
fails if the committed one differs. The build is deterministic, so that check is
reliable rather than flaky.

## Don't register the card with `add_extra_js_url`

It was, and the card did not load in the Home Assistant Android companion app:
every dashboard using it rendered `Custom element doesn't exist:
hass-broadcast-card.` while desktop browsers were fine.

`add_extra_js_url` gets the module into the index page as a fire-and-forget
`import()` that nothing awaits, retries, or reports. That import did not run in
that WebView. The bundle itself was fine — imported by hand from the failing
page, it resolved and defined the element.

Lovelace resources arrive over the live websocket connection and are awaited by
the Lovelace panel before it creates any cards, which is how every
HACS-installed card already loads on those clients. `add_extra_js_url` survives
only as the YAML-mode fallback, where resources are user-managed and an
integration must not write to them. See `tests/test_card_resource.py`.

## Releases and HACS

HACS reads the version from `manifest.json`. GitHub releases are optional: with
none published, HACS serves the repository's default branch, so a version bump on
`master` is what makes HACS offer an update. A bare git tag is not a release and
HACS does not see it — `v0.1.0` is one such orphan tag, predating any release.

To cut a release: **Actions → Release → Run workflow**, choose `patch`/`minor`/
`major`. It runs both test suites, rebuilds the bundle, bumps `manifest.json`,
commits `chore: release vX.Y.Z`, pushes an annotated tag, and publishes a GitHub
release with generated notes and `hass_broadcast.zip` attached.

`hacs.json` sets `zip_release`, so HACS installs that zip (the contents of
`custom_components/hass_broadcast/`, at the zip root) instead of the repository
tree, and GitHub counts its downloads as installs. HACS reads `hacs.json` from the
tag it installs, so releases before v0.7.1 still install from the tree.
`tests/test_hacs.py` checks that `filename` matches the domain. Don't tag or bump by hand; the workflow keeps the
manifest version, the tag, and the release in agreement.

Commit subjects follow Conventional Commits (`fix:`, `feat:`, `docs:`,
`refactor:`, `chore:`). Some work lands directly on `master`, some goes through a
branch and a pull request — either is fine, so follow whatever the current task
asks for rather than assuming one of them.

# Repo standardization — refactoring plan

Date: 2026-09-06

## Goal

Bring `hass_broadcast` up to the conventions a well-run Home Assistant custom
integration is expected to follow, add a test net that actually exercises the
rendered card, and only then perform the two structural refactors the codebase
has earned.

The target is a **well-run repository installed as a HACS custom repository** —
not acceptance into the HACS default store, and not submission to
`home-assistant/core`. HACS and Home Assistant guidance is therefore
inspiration, not a certification checklist: conventions are adopted where they
pay for themselves and skipped where they are pure ceremony for a
single-maintainer project.

The work is split into 19 issues across four waves. Each issue is independently
takeable; the waves express dependency, not a schedule.

## Where the repo stands

What is already good, and should not be disturbed:

- The Python package is cleanly split — nine modules, none over 260 lines.
- 59 Python tests and 146 frontend tests, with real coverage of storage, HTTP
  upload, playback, the media source and the websocket commands.
- CI rebuilds the card bundle and fails if the committed copy is stale. This
  guards the repo's single most dangerous invariant.
- The release workflow owns version bumping, tagging and publishing, keeping
  `manifest.json`, the tag and the GitHub release in agreement.
- `frontend/dev/` is a genuine local iteration harness: the real card and
  editor against a mocked `hass`, with switches for states that are painful to
  reach on a live install.
- `CLAUDE.md` records the non-obvious decisions — why there is no service, why
  `add_extra_js_url` is not used, why the bundle is committed — with the
  reasoning intact rather than just the rule.

What is missing:

- **No `LICENSE`.** The repository is, strictly, all-rights-reserved.
- **`manifest.json` is incomplete**: no `issue_tracker`, `codeowners` is empty.
  HACS names both as required.
- **No brand assets.** Without a merged `home-assistant/brands` entry, HACS and
  the Devices & Services page render a placeholder icon.
- **No linting of any kind** — no ruff, no mypy, no eslint, no prettier, and no
  `pyproject.toml` to hold their configuration.
- **`tsc --noEmit` is not in CI**, though `CLAUDE.md` documents it as the
  supported check and names the exact bug class it catches.
- **Neither official validator runs**: `hassfest` and `hacs/action` are both
  absent.
- **`hass.data[DOMAIN][entry_id]` instead of `entry.runtime_data`**, the pattern
  Home Assistant has recommended since 2024.6. The consequence is visible in
  `const.py`, which has to explain that every store lookup takes "the first
  value in it".
- **The config flow and options flow are entirely untested.** There is no
  `tests/test_config_flow.py`.
- **Only one Home Assistant version is tested**, though `CLAUDE.md` states the
  code must tolerate both 2025.1.4 and much newer releases.
- **Frontend tests assert on flattened template strings.**
  `frontend/test/helpers.ts` walks a Lit `TemplateResult` tree and concatenates
  its literals. That proves which branch rendered; it proves nothing about the
  resulting DOM, and nothing at all about appearance.
- **`card.ts` has outgrown itself** at 742 lines with roughly fourteen `@state`
  fields, mixing recording, playback, history, target selection and volume.

## Sequencing

Four waves, ordered so each is a safety net for the next.

1. **Hygiene** — additive files only. No behaviour change, no risk.
2. **Tooling & CI** — linters and validators. Produces one large mechanical
   diff, then stays quiet and catches regressions from then on.
3. **Test net** — real-DOM and visual tests, the missing config-flow tests, and
   a Home Assistant version matrix.
4. **Refactors** — `runtime_data` and the `card.ts` decomposition.

The ordering is not arbitrary. Decomposing a 742-line component whose only
tests assert on flattened template strings is how a silent regression ships.
Wave 3 must land before wave 4.

Waves 1 and 2 are front-loaded because they are cheap and find real problems
immediately — `tsc --noEmit` alone covers a bug class the project has already
been bitten by.

## Decisions taken

**License: MIT.** The default for Home Assistant custom components, and
permissive enough not to complicate a future core contribution.

**Visual testing: Vitest 4 Browser Mode with the Playwright provider**, using
`toMatchScreenshot()`. Chosen over Storybook and over standalone Playwright
because it reuses the runner the repo already has and the mocks already written
in `frontend/dev/mock-hass.ts`. Storybook would duplicate a dev harness that
exists and works, adding a large dependency tree to a frontend of 2,400 lines.
Home Assistant's own frontend repository uses a bespoke "gallery" app rather
than Storybook, so there is no HA-specific convention to conform to here.

**Screenshot baselines are pinned to the Playwright Docker image**
(`mcr.microsoft.com/playwright`). Font rendering differs between a developer
machine and a CI runner, so unpinned baselines are either perpetually stale or
perpetually flaky. Running visual tests only inside that image makes local and
CI output identical and keeps local iteration viable, which matters for a
project whose frontend workflow is built around `npm run dev`.

**Existing frontend tests are split, not migrated wholesale.** Tests over pure
logic — `wav`, `levels`, `format`, `clip`, `api`, `errors`, `players` — stay in
the fast Node environment. Only the tests that assert on rendering move to the
browser project.

## Explicitly out of scope

**Generating `translations/en.json` from `strings.json`.** The two files are
byte-identical and hand-maintained, so they can drift. Deliberately left alone;
if the duplication ever bites, a two-line test asserting equality closes it
without a build step.

**HACS default-store submission** and **core inclusion.** Both were considered
and rejected as goals. Core inclusion in particular would force the Lovelace
card out into a separate repository, since core integrations cannot ship one.

**Unrelated refactoring.** The Python modules are well-sized and well-bounded;
only `card.ts` and the `hass.data` access pattern are in scope.

## The issues

### Wave 1 — Hygiene

1. Add a `LICENSE` file (MIT).
2. Complete `manifest.json` for hassfest and HACS — `issue_tracker`,
   `codeowners`, key ordering.
3. Submit icon and logo to `home-assistant/brands`.
4. Add GitHub community files — issue forms, PR template, `CONTRIBUTING.md`,
   `dependabot.yml`.
5. README polish — badges, a screenshot or GIF of the card.
6. Reconcile the minimum Home Assistant version. `hacs.json` declares
   `2024.11.0`; the suite tests against 2025.1.4. One of the two is wrong.

### Wave 2 — Tooling & CI

7. Introduce `pyproject.toml` as the single configuration source and adopt
   ruff, absorbing `pytest.ini`.
8. Adopt mypy strict over `custom_components/`.
9. Add frontend linting and `tsc --noEmit` to CI.
10. Add `hassfest` and `hacs/action` validation.
11. Split CI into parallel jobs and add coverage reporting.

### Wave 3 — Test net

12. Add `tests/test_config_flow.py`.
13. Add a Home Assistant version matrix to CI.
14. Upgrade to Vitest 4 and split into `unit` and `browser` projects.
15. Replace `renderedText()` with real DOM assertions.
16. Add visual regression tests via `toMatchScreenshot()`.
17. Add accessibility tests over the rendered card.

### Wave 4 — Refactors

18. Migrate to `entry.runtime_data` with a typed `BroadcastConfigEntry`.
19. Decompose `card.ts` into Lit reactive controllers.

Dependencies: 15, 16 and 17 require 14. 19 requires 16.

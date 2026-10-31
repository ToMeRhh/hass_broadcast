# Contributing

Python 3.14 and Node 22. The integration tests run against Home Assistant 2026.10.2, the version
`requirements_test.txt` pins, which needs Python 3.14. That is the only version tested: the
2024.12 minimum in `hacs.json` is declared but not tested, and the code keeps its branches for
older releases.

```bash
python3.14 -m venv .venv        # or: uv venv --python 3.14 .venv
.venv/bin/pip install -r requirements_test.txt -r requirements_lint.txt
.venv/bin/python -m pytest -q   # integration tests; `python -m pytest`, not bare `pytest`,
                                # so the repo root is on sys.path
.venv/bin/ruff check . && .venv/bin/ruff format --check .   # Python lint and format
.venv/bin/mypy                  # type-check the integration (strict)

npm ci
npx playwright install chromium # once per machine: the browser tests and check:layout need it
npm test                        # card tests (vitest): Node, then headless Chromium
npm run build                   # bundle the card into custom_components/hass_broadcast/www/
npm run dev                     # card dev harness on http://localhost:8099
npm run dev:editor              # the editors, drawn by Home Assistant's own frontend, on :8100
npm run check:layout            # headless check that nothing moves between card states
npm run test:visual             # screenshot tests; needs Docker (optional: CI runs them)
npm run brand                   # regenerate the icon, logos and social preview from docs/brand/icon.svg
```

`npm run dev` renders the real card and tile against a mocked Home Assistant,
with live reload and switches for hard-to-reach states (microphone denied, a
partly failed broadcast, empty history, latency). The editors are Home
Assistant's own forms, so `npm run dev:editor` runs Home Assistant's design
gallery locally to show them; `npm run dev:editor -- --screenshots` regenerates
the editor images in the README. See
[`frontend/dev/README.md`](frontend/dev/README.md).

The icon's source is [`docs/brand/icon.svg`](docs/brand/icon.svg): the card's record button
mid-take. `npm run brand` renders it into `custom_components/hass_broadcast/brand/`, which Home
Assistant 2026.3 and later shows instead of a placeholder, and into
`docs/brand/social-preview.png`, the repository's social preview. GitHub has no API for that one:
upload it under **Settings → General → Social preview**.

## The committed bundle

`custom_components/hass_broadcast/www/hass-broadcast-card.js` is a **build output that is
committed to the repository**, because HACS installs the repository as-is and the integration
serves that file directly — an uncommitted bundle means every dashboard gets a 404 instead of a
card. Whenever anything under `frontend/src/` changes, run `npm run build` and commit the
regenerated bundle in the same change. CI fails if the committed bundle is stale.

## Visual tests

`frontend/test/visual/` screenshots the card in every state and layout, and the tile in both
shapes, in light and dark themes, and compares them with the reference images in
`frontend/test/visual/__screenshots__/`. Text renders slightly differently on every OS, so the
screenshots are only ever taken in one browser: the one in Playwright's Docker image.

**You don't need Docker.** CI's `visual` job runs the comparison on every pull request. When it
fails, download the `visual-diffs` artifact from the run to see the actual and diff images. If
the change is intended, update the references from GitHub: **Actions → Update screenshots → Run
workflow**, choosing your pull request's branch. The workflow regenerates them in the same
container, commits them to the branch, and the PR shows exactly which pictures changed. That
commit does not start CI on its own, so re-run the PR's checks afterwards.

With Docker installed, the same works locally and faster: `npm run test:visual` compares, and
`npm run test:visual -- -u` rewrites the references that changed.

## CI

CI runs seven jobs in parallel: `frontend` (type-check and card tests), `bundle` (rebuilds the
card and fails if the committed bundle differs), `python` (integration tests), `ruff`, `mypy`,
`layout` (`npm run check:layout`, which fails if any part of the card moves between states) and
`visual` (the screenshots above). `frontend` and `python` measure coverage and write it to the
run's summary page; there is no minimum yet. To measure locally:

```bash
npm test -- --coverage
.venv/bin/python -m pytest -q --cov=custom_components/hass_broadcast --cov-branch
```

## Commits and releases

Commit subjects follow [Conventional Commits](https://www.conventionalcommits.org/)
(`fix:`, `feat:`, `docs:`, `refactor:`, `chore:`).

Releases are cut with **Actions → Release → Run workflow**, on the `stable` or `beta`
channel, which bumps the version in
`manifest.json`, tags, and publishes a GitHub release with `hass_broadcast.zip` attached —
the asset HACS installs, since `hacs.json` sets `zip_release`. The version is also the card's
cache-busting query string, so a change reaches users only once it is released.

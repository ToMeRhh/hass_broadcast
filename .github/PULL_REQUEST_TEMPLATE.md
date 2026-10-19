## Summary

<!-- What does this change, and why? Link the issue it closes, e.g. "Closes #12". -->

## Checklist

- [ ] `npm test` and `.venv/bin/python -m pytest -q` pass
- [ ] If anything under `frontend/src/` changed: ran `npm run build` and committed the regenerated bundle in the same commit
- [ ] If the card's markup or CSS changed: ran `npm run check:layout`
- [ ] Commit subjects follow [Conventional Commits](https://www.conventionalcommits.org/) (`fix:`, `feat:`, `docs:`, `refactor:`, `chore:`)

<!-- Leave the version in manifest.json alone: the Release workflow bumps it. -->

# Changelog

## [0.1.0] - 2026-04-07

### Added
- Initial React + Vite + Tailwind 4 webapp scaffold (mirrors `hds-webapp` structure).
- `HDSModel` loader at `src/services/hdsLibService.ts` — fetches `model.datasafe.dev/pack.json` via `initHDSModel()`, with `VITE_MODEL_URL` / `VITE_SERVICE_INFO_URL` overrides for local dev.
- **Items tab** — searchable grouped list (via imported `ItemSearchPicker` from `hds-forms-js`) + full item detail pane with language picker, eventTypes, type, repeatable, reminder, devNotes, options, variations, and raw JSON.
- **Streams tab** — collapsible stream tree + items-in-stream listing + cross-tab navigation to open an item from a stream and vice versa.
- `scripts/setup.sh` and `scripts/deploy.sh` (mirrors `hds-lib-js` deploy pattern with main-branch + clean-tree safety checks).
- Vitest setup with first smoke tests for `StreamTree`.

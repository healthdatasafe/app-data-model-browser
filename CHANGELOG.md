# Changelog

## [Unreleased]

### Changed

- **`backloop.dev` now installs from GitHub instead of npm** (2026-09-07). The service stopped
  being public on 2026-09-04: a certificate authority must revoke any certificate whose private
  key is published, and both did. The two packages also moved into repositories of their own, so
  both are now pinned by tag.

  ```
  backloop.dev             git+https://github.com/perki/backloop.dev-node.git#v5.1.0
  vite-plugin-backloop.dev git+https://github.com/perki/backloop.dev-vite.git#v2.2.0
  ```

  5.1.0 rather than 5.0.0 is deliberate. 5.0.0 fails to start when no secret is configured;
  5.1.0 falls back to a shared self-signed certificate, so local development still works without
  one. That certificate installs once per machine from <https://backloop.dev/public/>, and
  Firefox will not accept it because it ignores the system trust store. To use your own
  certificate instead, point `BACKLOOP_DEV_CERT` and `BACKLOOP_DEV_KEY` at the PEM files.

  **One-time step in every existing checkout.** npm does not replace a package that moved from
  the registry to a git URL: it leaves the old directory on disk while `npm ls` and
  `package-lock.json` both report the new version, so the old code keeps loading.

  ```sh
  rm -rf node_modules/backloop.dev node_modules/vite-plugin-backloop.dev && npm install
  ```


- Removed the browser-monitoring agent. Third-party code running in a patient's
  browser cannot be allow-listed, so it is removed rather than configured
  (HDS plan 88). Detection is now external (synthetic and certificate checks)
  plus the backend signals behind this app; real-user JS error visibility is
  deliberately given up.

## [0.2.1] - 2026-06-10

### Added
- New Relic Browser instrumentation: entity `hds-static-app-data-model-browser`, build-time snippet injection via `newrelicBrowser()` vite plugin. (BUGS B-2026-05-29-2)

## [0.2.0] - 2026-04-28

### Added — deprecated-itemDef awareness (Plan 50 Phase 4)
- **Items tab default listing now hides deprecated items.** A "Show deprecated (N)" checkbox appears below the picker when at least one deprecated item exists; toggling it switches the picker to the full list via the new `ItemSearchPicker.includeDeprecated` prop (introduced in `hds-forms-js` 0.8.1).
- **Item detail pane** shows a `deprecated` badge next to the item key when the selected item has `isDeprecated === true`.
- **Header summary count** uses `getAllActive().length` so the visible count matches the default listing.

Requires `hds-lib` ≥ 0.7.2 and `hds-forms-js` ≥ 0.8.1. Contract documented in `data-model/AGENTS.md § "deprecated: true on items"`.

## [0.1.0] - 2026-04-07

### Added
- Initial React + Vite + Tailwind 4 webapp scaffold (mirrors `hds-webapp` structure).
- `HDSModel` loader at `src/services/hdsLibService.ts` — fetches `model.datasafe.dev/pack.json` via `initHDSModel()`, with `VITE_MODEL_URL` / `VITE_SERVICE_INFO_URL` overrides for local dev.
- **Items tab** — searchable grouped list (via imported `ItemSearchPicker` from `hds-forms-js`) + full item detail pane with language picker, eventTypes, type, repeatable, reminder, devNotes, options, variations, and raw JSON.
- **Streams tab** — collapsible stream tree + items-in-stream listing + cross-tab navigation to open an item from a stream and vice versa.
- `scripts/setup.sh` and `scripts/deploy.sh` (mirrors `hds-lib-js` deploy pattern with main-branch + clean-tree safety checks).
- Vitest setup with first smoke tests for `StreamTree`.

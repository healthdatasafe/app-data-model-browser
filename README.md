# app-data-model-browser

A React webapp for searching and browsing the [HDS data model](https://github.com/healthdatasafe/data-model) — items, streams, eventTypes, settings.

Replaces the static HTML tables previously published at `model.datasafe.dev/index.html`.

## Quick start

```sh
npm run setup    # installs deps + clones gh-pages branch into dist/
npm run dev      # http://localhost:8090
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server on port 8090 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the built app |
| `npm run test` | Run vitest suite |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run setup` | Install deps + set up `dist/` as gh-pages checkout |
| `npm run deploy` | Build + push to `gh-pages` (must be on `main`, clean tree) |

## Local-dev environment overrides

`hdsLibService` honors two Vite env vars:

| Var | Effect |
|---|---|
| `VITE_MODEL_URL` | Load `pack.json` directly from this URL, bypassing service-info |
| `VITE_SERVICE_INFO_URL` | Use this service-info instead of the hds-lib default |

Example — point at a locally-built `data-model/data-model/dist/pack.json`:

```sh
VITE_MODEL_URL=http://localhost:8000/pack.json npm run dev
```

## Architecture

- **React 19 + Vite 6 + Tailwind 4 + SWC** — same stack as `hds-webapp` and `hds-forms-js`.
- **`hds-lib`** — `HDSModel` loader; data is fetched from `model.datasafe.dev/pack.json` (or the local override).
- **`hds-forms-js`** — re-uses `ItemSearchPicker`, `getItemGroup`, and `repeatableLabel` directly. No vendoring.
- **`hds-style`** — base theme variables.

### Source layout

```
src/
  App.tsx                  Top-level layout, tab switcher, model loader
  main.tsx                 React root
  index.css                Tailwind + hds-style imports
  services/
    hdsLibService.ts       HDSModel singleton initializer (with env-var overrides)
  components/
    Tabs.tsx               Minimal tab switcher
    ItemsTab.tsx           Items panel: search picker + detail
    ItemDetail.tsx         Full item view (label/desc with language picker, etc.)
    StreamsTab.tsx         Streams panel: tree + items-for-stream
    StreamTree.tsx         Collapsible stream hierarchy
    RawJson.tsx            Expandable raw-JSON inspector
```

### Data source

Fetches `https://model.datasafe.dev/pack.json` at startup via `initHDSModel()`. The JSON files (`pack.json`, `items.json`, `streamsTree.json`, …) are produced by the `data-model` repo's build pipeline and deployed independently — this app is **purely a UI layer**, no copy of the model is bundled.

## Deploy

```sh
npm run setup     # only once
git checkout main
npm run deploy
```

Lives at https://healthdatasafe.github.io/app-data-model-browser/

The deploy script:
1. Refuses to run unless on `main` with a clean tree
2. Builds via `npm run build`
3. Writes `dist/version.json` (commit SHA + build date)
4. Touches `dist/.nojekyll` so GitHub Pages serves Vite assets
5. Commits + pushes `dist/` (a `gh-pages` checkout)

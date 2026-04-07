import HDSLib, { initHDSModel, HDSModel } from 'hds-lib';

let model: HDSModel | null = null;

// Local-dev overrides (set via .env or VITE_*=… on the command line)
const LOCAL_SERVICE_INFO_URL = import.meta.env.VITE_SERVICE_INFO_URL;
const LOCAL_MODEL_URL = import.meta.env.VITE_MODEL_URL;

/**
 * Initialize the singleton HDSModel and return it.
 * Mirrors the pattern used by hds-forms-js's src-test-app, with two paths:
 *   1. VITE_MODEL_URL set → load that pack.json directly (bypass service-info)
 *   2. otherwise → use service-info (default https://demo.datasafe.dev or VITE_SERVICE_INFO_URL)
 */
export async function ensureModel (): Promise<HDSModel> {
  if (model != null) return model;
  if (LOCAL_MODEL_URL) {
    model = new HDSModel('local');
    model.assets = { 'hds-model': LOCAL_MODEL_URL };
    await model.load(LOCAL_MODEL_URL);
  } else {
    if (LOCAL_SERVICE_INFO_URL) {
      HDSLib.settings.setServiceInfoURL(LOCAL_SERVICE_INFO_URL);
    }
    model = await initHDSModel();
  }
  return model;
}

export function getModel (): HDSModel {
  if (model == null) throw new Error('Call ensureModel() first to initialize the HDSModel singleton.');
  return model;
}

/** Where each eventType key originates: 'pryv' (legacy) or 'hds' (new). */
export type EventTypeSource = 'hds' | 'pryv';

const EVENT_TYPES_LEGACY_URL = 'https://raw.githubusercontent.com/healthdatasafe/data-model/main/definitions/eventTypes/eventTypes-legacy.json';
const EVENT_TYPES_HDS_URL = 'https://raw.githubusercontent.com/healthdatasafe/data-model/main/definitions/eventTypes/eventTypes-hds.json';

let eventTypeSourcesPromise: Promise<Map<string, EventTypeSource>> | null = null;

/**
 * Fetch the two raw eventType source files from data-model on GitHub and
 * build a key→source map. The merged `pack.json` doesn't preserve provenance,
 * so the only way to know which keys are legacy ('pryv') vs new ('hds') is to
 * read the original files. Cached after first call.
 */
export async function loadEventTypeSources (): Promise<Map<string, EventTypeSource>> {
  if (eventTypeSourcesPromise) return eventTypeSourcesPromise;
  eventTypeSourcesPromise = (async () => {
    const map = new Map<string, EventTypeSource>();
    try {
      const [legacy, hds] = await Promise.all([
        fetch(EVENT_TYPES_LEGACY_URL).then(r => r.json()),
        fetch(EVENT_TYPES_HDS_URL).then(r => r.json())
      ]);
      for (const k of Object.keys(legacy?.types ?? {})) map.set(k, 'pryv');
      for (const k of Object.keys(hds?.types ?? {})) map.set(k, 'hds'); // hds wins on collision
    } catch (e) {
      // Soft fail — UI just won't show pills
      console.warn('Could not load eventType source files:', e);
    }
    return map;
  })();
  return eventTypeSourcesPromise;
}

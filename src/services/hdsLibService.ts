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

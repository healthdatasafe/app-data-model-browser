import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import backloop from 'vite-plugin-backloop.dev';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The build redistributes third-party code (React and others MIT, pryv lib-js BSD-3 through hds-lib…), whose licences
// ask for their notice in the distribution: every package bundled, with its licence and notice files, goes to
// `THIRD-PARTY-NOTICES.txt` beside the app (plan 132 P3). Same plugin as hds-webapp's (it reads only `chunk.moduleIds`,
// which rollup and rolldown both give). HDS's own packages are left out (`hds-*`).
const NOTICE_FILE = /^(licen[cs]e|copying|notice)([.-].*)?$/i;
// packages that do not ship their licence file, with a copy kept in licenses/
const KEPT_LICENCES: Array<[RegExp, string]> = [[/^(pryv|@pryv\/.+)$/, 'licenses/pryv-lib-js.LICENSE']];

function thirdPartyNotices (appName: string): PluginOption {
  return {
    name: 'hds-third-party-notices',
    apply: 'build',
    generateBundle (_options, bundle) {
      const dirs = new Set<string>();
      for (const out of Object.values(bundle)) {
        if (out.type !== 'chunk') continue;
        for (const id of out.moduleIds) {
          const dir = id.replace(/\\/g, '/').match(/^(.*\/node_modules\/(?:@[^/]+\/)?[^/]+)\//)?.[1];
          if (dir) dirs.add(dir);
        }
      }
      const packages = new Map<string, string>();
      for (const dir of dirs) {
        const pkgFile = path.join(dir, 'package.json');
        if (!fs.existsSync(pkgFile)) continue;
        const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
        if (typeof pkg.name !== 'string' || /^hds-/.test(pkg.name)) continue;
        const id = `${pkg.name}@${pkg.version}`;
        if (packages.has(id)) continue;
        const licence = typeof pkg.license === 'string' ? pkg.license : 'licence not declared';
        const texts = fs.readdirSync(dir).filter(f => NOTICE_FILE.test(f)).sort()
          .map(f => fs.readFileSync(path.join(dir, f), 'utf8').trim());
        const kept = KEPT_LICENCES.find(([name]) => name.test(pkg.name))?.[1];
        if (texts.length === 0 && kept) texts.push(fs.readFileSync(path.resolve(__dirname, kept), 'utf8').trim());
        packages.set(id, `${id} (${licence})\n\n${texts.length > 0 ? texts.join('\n\n') : `No licence file in the package; its package.json declares: ${licence}.`}`);
      }
      const body = [...packages.keys()].sort().map(id => packages.get(id)).join(`\n\n${'-'.repeat(80)}\n\n`);
      this.emitFile({
        type: 'asset',
        fileName: 'THIRD-PARTY-NOTICES.txt',
        source: `Third-party software in this build of ${appName} (${packages.size} packages)\n\n${'='.repeat(80)}\n\n${body}\n`
      });
    }
  };
}

// No browser-monitoring agent is injected here, deliberately. Third-party code
// running in a patient's browser cannot be allow-listed, so public applications
// carry none (plan 88). Detection for this app is external — synthetic and
// certificate checks — plus the backend signals behind it.

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const config: any = {
    // Relative base so the same build works at GH-Pages root, sub-path, or under a custom domain.
    base: './',
    envPrefix: ['VITE_'],
    server: {
      host: '::',
      port: 8090
    },
    plugins: [
      react(),
      tailwindcss(),
      thirdPartyNotices('the HDS Data Model Browser'),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      },
      preserveSymlinks: true,
      dedupe: ['hds-lib', 'react', 'react-dom']
    },
    optimizeDeps: {
      include: ['hds-lib'],
      exclude: ['hds-forms-js']
    }
  };
  // Enable backloop.dev (HTTPS + proper hostname) for the dev server only.
  // Use `npm run dev:raw` to bypass it (plain http://localhost). Builds and vitest (which runs in
  // serve mode) skip it: they need no certificate, and loading the plugin there made tests and CI
  // depend on reaching backloop.dev (B-2026-10-08-10).
  if (command === 'serve' && !process.env.VITEST && mode !== 'raw') {
    config.plugins.push(backloop('app-data-model-browser'));
  }
  return {
    ...config,
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest-setup.ts'
    }
  };
});

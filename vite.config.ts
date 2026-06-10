import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import backloop from 'vite-plugin-backloop.dev';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Inject the New Relic Browser agent snippet at build time (skipped in dev).
// Same pattern as hds-webapp/vite.config.ts. Single environment — one
// snippet file (entity hds-static-app-data-model-browser).
function newrelicBrowser (): Plugin {
  return {
    name: 'newrelic-browser',
    transformIndexHtml: {
      order: 'post',
      handler (html, ctx) {
        if (ctx.server) return html;
        const snippetPath = path.resolve(__dirname, 'newrelic-snippet.html');
        if (!fs.existsSync(snippetPath)) {
          console.warn('[newrelic-browser] newrelic-snippet.html not found — skipping injection');
          return html;
        }
        const snippet = fs.readFileSync(snippetPath, 'utf-8').trim();
        return html.replace('</head>', snippet + '\n  </head>');
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
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
      newrelicBrowser()
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
  // Enable backloop.dev (HTTPS + proper hostname) by default in dev mode.
  // Use `npm run dev:raw` to bypass it (plain http://localhost).
  if (mode !== 'raw') {
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

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'node:url';
import backloop from 'vite-plugin-backloop.dev';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// No browser-monitoring agent is injected here, deliberately. Third-party code
// running in a patient's browser cannot be allow-listed, so public applications
// carry none (plan 88). Detection for this app is external — synthetic and
// certificate checks — plus the backend signals behind it.

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

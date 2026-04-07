import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Relative base so the same build works at GH-Pages root, sub-path, or under a custom domain.
  base: './',
  envPrefix: ['VITE_'],
  server: {
    host: '::',
    port: 8090
  },
  plugins: [
    react(),
    tailwindcss()
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
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest-setup.ts'
  }
});

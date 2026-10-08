import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({mode}) => {
  return {
    plugins: [react(), tailwindcss()],
    // Keep the legacy root index.html online until GitHub Pages switches to Actions.
    build: { rollupOptions: { input: path.resolve(__dirname, 'vite-entry.html') } },
    base: process.env.VITE_BASE_PATH || '/', // Non-secret: '/hoc-vui/' for GitHub Pages repo sites.
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

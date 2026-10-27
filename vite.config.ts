import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({mode}) => {
  return {
    plugins: [react(), tailwindcss(), {
      name: 'hocvui-dev-entry',
      configureServer(server) {
        // Local development must use the same React entry as production builds.
        // Keep the root legacy HTML intact for existing branch-based hosting.
        server.middlewares.use((req, _res, next) => {
          const [pathname, search] = (req.url || '').split('?');
          if (pathname === '/' || pathname === '/index.html') {
            req.url = '/vite-entry.html' + (search ? '?' + search : '');
          }
          next();
        });
      }
    }],
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

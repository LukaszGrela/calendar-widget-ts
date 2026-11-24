import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Library build (`npm run build:lib`).
 *
 * The demo application keeps using `vite.config.ts`; nothing here changes the
 * `npm run build` output. `react`, `react-dom` and `react-transition-group`
 * are peer dependencies, so they are never bundled into the library.
 */
export default defineConfig({
  plugins: [react()],
  // `public/` holds demo-only assets (`favicon.ico`, `manifest.json`, `.htaccess`),
  // they must not end up in the published package.
  publicDir: false,
  build: {
    outDir: 'dist-lib',
    emptyOutDir: true,
    copyPublicDir: false,
    sourcemap: true,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'style',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-transition-group',
      ],
    },
  },
});

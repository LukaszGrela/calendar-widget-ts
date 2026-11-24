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
  build: {
    outDir: 'dist-lib',
    emptyOutDir: true,
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

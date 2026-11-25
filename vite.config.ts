/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
) as { version: string };

const commit = execSync("git rev-parse --short HEAD").toString().trim();


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_COMMIT__: JSON.stringify(commit),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setup-test.ts'],
    css: {
      include: [/\.s?css$/],
    },
    deps: {
      web: {
        transformCss: true,
      },
    },
    testTimeout: 20000,
    hookTimeout: 25000,
    exclude: [
      '**/types.ts',
      'src/__tests/**',
      'src/types/**',
      'src/setup-test.ts',
      'mock/**',
      'scripts/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/stories/**',
      '**/cypress/**',
      '**/test/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
    ],
    coverage: {
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/__tests/**',
        'src/**/stories/**',
        '**/*.scss',
        '**/types.ts',
        '**/*.d.ts',
        '**/__test__',
        '**/test/**',
        '**/stories',
        'src/types',
      ],
    },
  },
});

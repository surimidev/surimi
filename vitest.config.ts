import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'threads',
    projects: [
      {
        test: {
          name: 'compiler',
          include: ['./packages/compiler/test/**/*.spec.ts'],
        },
      },
      {
        test: {
          name: 'surimi',
          include: ['./packages/surimi/test/**/*.spec.ts'],
        },
      },
      {
        test: {
          name: 'parsers',
          include: ['./packages/parsers/test/**/*.spec.ts'],
          typecheck: {
            enabled: true,
            tsconfig: './packages/parsers/tsconfig.json',
          },
        },
      },
      {
        test: {
          name: 'vite-plugin-surimi',
          include: ['./packages/vite-plugin-surimi/test/**/*.spec.ts'],
        },
      },
    ],
    reporters: [['verbose', { summary: true }]],
    coverage: {
      provider: 'v8',
    },
  },
});

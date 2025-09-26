import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'threads',
    workspace: [
      {
        test: {
          name: 'unit',
          include: ['./packages/**/test/*.unit.test.{ts,tsx}'],
          css: true,
        },
      },
      {
        test: {
          name: 'browser',
          include: ['./packages/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
    reporters: [['verbose', { summary: true }]],
    coverage: {
      provider: 'v8',
    },
  },
});

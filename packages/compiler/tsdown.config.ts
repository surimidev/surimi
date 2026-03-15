import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    'index.node': 'src/index.node.ts',
    'index.browser': 'src/index.browser.ts',
    cli: 'src/cli.ts',
  },
  format: 'esm',
  platform: 'neutral',
  target: 'esnext',
  clean: true,
  dts: true,
  outputOptions: {
    legalComments: 'inline',
  },
  // Node entry uses 'rolldown'; browser entry uses '@rolldown/browser'. Each consumer loads only one.
  external: ['rolldown', '@rolldown/browser'],
});

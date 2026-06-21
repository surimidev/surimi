import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  platform: 'neutral',
  deps: { neverBundle: [/^node:/] },
  target: 'esnext',
  clean: true,
  dts: { sourcemap: false },
});

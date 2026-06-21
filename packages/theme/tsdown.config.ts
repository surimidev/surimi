import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'esnext',
  platform: 'neutral',
  sourcemap: true,
  clean: true,
  dts: true,
});

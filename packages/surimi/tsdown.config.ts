import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/conditional.ts'],
  format: ['esm'],
  target: 'es2020',
  platform: 'neutral',
  sourcemap: true,
  clean: true,
  dts: true,
});

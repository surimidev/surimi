import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: 'esm',
  platform: 'neutral',
  target: 'esnext',
  clean: true,
  dts: true,
});

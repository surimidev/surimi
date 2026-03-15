import { baseConfig, defineConfig, type Config } from '@surimi/linter-config';

const config: Config = defineConfig(baseConfig, {
  ignores: ['**/.nuxt', '**/.output'],
});

export default config;

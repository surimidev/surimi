import { baseConfig, Config, defineConfig } from '@surimi/linter-config';

const config: Config = defineConfig(baseConfig, {
  ignores: ['**/.nuxt', '**/.output'],
});

export default config;

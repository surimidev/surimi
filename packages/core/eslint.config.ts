import type { Config } from '@surimi/linter-config';
import { baseConfig, defineConfig } from '@surimi/linter-config';

export const config: Config = defineConfig(baseConfig, {
  rules: {
    // We rely heavily on declaration merging in Surimi's builder mixins (unfortunately)
    '@typescript-eslint/no-unsafe-declaration-merging': 'off',
  },
});

export default config;

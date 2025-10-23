import { baseConfig, defineConfig, globalIgnores } from '@surimi/linter-config';

export default defineConfig(...baseConfig, globalIgnores(['**/.astro']));

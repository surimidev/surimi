// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import surimiPlugin from 'vite-plugin-surimi';

// https://astro.build/config
export default defineConfig({
  site: 'https://surimi.dev',

  image: {
    service: passthroughImageService(),
  },

  vite: {
    plugins: [surimiPlugin()],
  },
});

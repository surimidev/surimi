// @ts-check
import mdx from '@astrojs/mdx';
import { defineConfig, passthroughImageService } from 'astro/config';
import surimiPlugin from 'vite-plugin-surimi';

// https://astro.build/config
export default defineConfig({
  site: 'https://surimi.dev',

  redirects: {
    '/docs': '/docs/getting-started',
  },

  image: {
    service: passthroughImageService(),
  },

  vite: {
    plugins: [surimiPlugin()],
  },

  integrations: [mdx()],
});

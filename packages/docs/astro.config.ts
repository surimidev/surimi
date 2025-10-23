import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { defineConfig, passthroughImageService } from 'astro/config';
import surimiPlugin from 'vite-plugin-surimi';

// https://astro.build/config
export default defineConfig({
  site: 'https://surimi.dev',

  redirects: {
    '/docs': '/docs/getting-started',
    '/docs/api-reference': '/docs/api-reference/surimi',
  },

  image: {
    service: passthroughImageService(),
  },

  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },

  vite: {
    plugins: [surimiPlugin()],
  },

  integrations: [mdx(), react()],
});

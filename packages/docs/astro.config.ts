import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { defineConfig, passthroughImageService } from 'astro/config';
import remarkEmoji from 'remark-emoji';
import remarkGithub from 'remark-github';
import blockquoteAlert from 'remark-github-blockquote-alert';
import surimiPlugin from 'vite-plugin-surimi';

// https://astro.build/config
export default defineConfig({
  site: 'https://surimi.dev',

  redirects: {
    '/docs': '/docs/getting-started',
    '/docs/reference': '/docs/reference/surimi',
    '/docs/guides': '/docs/guides/overview',
  },

  image: {
    service: passthroughImageService(),
  },

  markdown: {
    remarkPlugins: [[remarkGithub, { repository: 'janis-me/surimi' }], blockquoteAlert, remarkEmoji],
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

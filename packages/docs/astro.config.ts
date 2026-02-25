import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import type { RolldownOutput } from '@rolldown/browser';
import { defineConfig, passthroughImageService } from 'astro/config';
import remarkEmoji from 'remark-emoji';
import remarkGithub from 'remark-github';
import blockquoteAlert from 'remark-github-blockquote-alert';
import { build, type Plugin } from 'vite';
import surimiPlugin from 'vite-plugin-surimi';

function vitePluginBundleSurimi() {
  async function bundleToString(entry: string) {
    const result = await build({
      build: {
        write: false,
        target: 'esnext',
        rolldownOptions: {
          input: entry,
          preserveEntrySignatures: 'strict',
          treeshake: false,
          output: {
            format: 'es',
            exports: 'named',
            preserveModules: false,
          },
          external: () => false,
        },
      },
    });

    const output = Array.isArray(result) ? result[0]?.output[0] : (result as RolldownOutput).output[0];

    return output?.code ?? '';
  }

  return {
    name: 'vite-plugin-bundle-surimi',
    load: async id => {
      if (id.endsWith('?bundle')) {
        const entry = id.slice(0, -7);
        const code = await bundleToString(entry);
        return `export default ${JSON.stringify(code)};`;
      }
    },
  } as Plugin;
}

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
    remarkPlugins: [[remarkGithub, { repository: 'surimidev/surimi' }], blockquoteAlert, remarkEmoji],
  },

  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },

  vite: {
    plugins: [surimiPlugin(), vitePluginBundleSurimi()],
    optimizeDeps: {
      exclude: ['@surimi/compiler', '@rolldown/browser'],
    },
  },

  integrations: [mdx(), react()],
});

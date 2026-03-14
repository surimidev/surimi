import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import surimi from 'vite-plugin-surimi';

export default defineConfig(() => {
  return {
    plugins: [
      surimi({
        inlineCss: false,
        include: ['**/*.style.ts'], // Leave this out if you want to use .css.ts files (default)
      }),
      analyzer({
        analyzerMode: 'static',
        summary: true,
      }),
    ],
  };
});

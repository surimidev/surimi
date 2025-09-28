import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import surimi from 'vite-plugin-surimi';

export default defineConfig(() => {
  return {
    plugins: [
      surimi({
        manualMode: {
          output: 'chunk',
        },
      }),
      analyzer({
        analyzerMode: 'static',
        summary: true,
      }),
    ],
  };
});

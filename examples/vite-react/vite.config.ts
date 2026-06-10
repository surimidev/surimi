import surimiPlugin from 'surimi/vite';
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';

export default defineConfig(() => {
  return {
    plugins: [
      surimiPlugin(),
      analyzer({
        analyzerMode: 'static',
        summary: true,
      }),
    ],
  };
});

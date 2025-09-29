import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import surimi from 'vite-plugin-surimi';

export default defineConfig(() => {
  return {
    plugins: [
      surimi({
        mode: 'virtual', // Use virtual CSS imports and auto-discovery of CSS files
        include: ['**/*.style.ts', '**/*.css.ts'], // Include all .style.ts and .style.js files
      }),
      analyzer({
        analyzerMode: 'static',
        summary: true,
      }),
    ],
  };
});

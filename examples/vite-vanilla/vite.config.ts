import { defineConfig } from 'vite';
import surimi from 'vite-plugin-surimi';

export default defineConfig(() => {
  return {
    plugins: [surimi()],
  };
});

import surimi from 'surimi/vite';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [surimi()],
  };
});

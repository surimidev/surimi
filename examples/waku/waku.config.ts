import react from '@vitejs/plugin-react';
import surimiPlugin from 'vite-plugin-surimi';
import { defineConfig } from 'waku/config';

export default defineConfig({
  vite: {
    plugins: [
      react({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
      surimiPlugin(),
    ],
  },
});

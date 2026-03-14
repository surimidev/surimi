import react from '@vitejs/plugin-react';
import { defineConfig } from 'waku/config';
import surimiPlugin from 'vite-plugin-surimi';

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

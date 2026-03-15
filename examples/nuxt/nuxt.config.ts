import surimiPlugin from 'vite-plugin-surimi';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  typescript: {
    tsConfig: {
      include: ['*.config.ts', 'src'],
      exclude: ['node_modules', 'dist', '.output'],
    },
  },
  vite: {
    plugins: [surimiPlugin()],
  },
});

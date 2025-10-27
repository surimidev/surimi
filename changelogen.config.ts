import { defineConfig } from '@maz-ui/changelogen-monorepo';

export default defineConfig({
  monorepo: {
    versionMode: 'independent',
    packages: ['packages/*'],
    ignorePackageNames: ['@surimi/docs', '@surimi/playground'],
  },

  // Optional configuration
  changelog: {
    formatCmd: 'pnpm format',
    rootChangelog: true,
  },

  release: {
    push: true,
    release: true,
    publish: true,
    noVerify: false,
  },
});

import { defineConfig } from '@maz-ui/changelogen-monorepo';

export default defineConfig({
  monorepo: {
    versionMode: 'independent',
    packages: ['packages/*'],
    ignorePackageNames: ['@surimi/docs', '@surimi/playground'],
  },

  changelog: {
    rootChangelog: false,
    formatCmd: 'pnpm format *.md',
  },
});

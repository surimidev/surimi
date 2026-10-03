import { defineConfig } from 'relizy';

export default defineConfig({
  monorepo: {
    versionMode: 'selective',
    packages: ['packages/*'],
    ignorePackageNames: ['@surimi/docs'],
  },

  publish: {
    access: 'public',
    buildCmd: 'pnpm build',
  },
  changelog: {
    rootChangelog: false,
    formatCmd: 'pnpm format --write packages/*/CHANGELOG.md',
  },
});

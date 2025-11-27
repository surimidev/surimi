import { defineConfig } from 'relizy';

export default defineConfig({
  monorepo: {
    versionMode: 'selective',
    packages: ['packages/*'],
    ignorePackageNames: ['@surimi/docs'],
  },

  publish: {
    access: 'public',
  },

  types: {
    feat: { title: '🚀 Enhancements', semver: 'minor' },
    perf: { title: '🔥 Performance', semver: 'patch' },
    fix: { title: '🩹 Fixes', semver: 'patch' },
    refactor: { title: '💅 Refactors', semver: 'patch' },
    docs: { title: '📖 Documentation', semver: 'patch' },
    build: { title: '📦 Build', semver: 'patch' },
    types: { title: '🌊 Types', semver: 'patch' },
    chore: { title: '🏡 Chore' },
    examples: { title: '🏀 Examples' },
    test: { title: '✅ Tests' },
    style: { title: '🎨 Styles' },
    ci: { title: '🤖 CI' },
  },

  changelog: {
    rootChangelog: false,
    formatCmd: 'pnpm format *.md',
  },
});

# Changelog

## v0.7.0...v0.8.0

[compare changes](https://github.com/surimidev/surimi/compare/v0.7.0...v0.8.0)

### 🚀 Enhancements

- Rip out postcss and replace with tiny AST-builder package ([#79](https://github.com/surimidev/surimi/pull/79))
- Rolldown playground ([#80](https://github.com/surimidev/surimi/pull/80))
- Vue / Nuxt integration and examples ([#83](https://github.com/surimidev/surimi/pull/83))

  Co-authored-by: Copilot Autofix powered by AI <62310815+github-advanced-security[bot]@users.noreply.github.com>
  Does a lot of changes to the vite plugin to hopefully fix SSR/HMR issues and also allow Vue/Nuxt SFCs to work. This made the vite plugin much more involved and messy which I don't like, but right now I don't really know how to clean it up. I think that's just how it will grow from here on. Maybe svelte support will be easier now.

- Dual build compiler and cli ([#85](https://github.com/surimidev/surimi/pull/85))

### 🏡 Chore

- Update deps, switch to biome ([#87](https://github.com/surimidev/surimi/pull/87))

### ❤️ Contributors

- Janis Jansen ([@janis-me](https://github.com/janis-me))


## @surimi/compiler@0.4.0...v0.7.0

[compare changes](https://github.com/surimidev/surimi/compare/@surimi/compiler@0.4.0...v0.7.0)

### 🚀 Enhancements

- Architecture rewamp / conditional package ([#76](https://github.com/surimidev/surimi/pull/76))

  Co-authored-by: Copilot <175728472+Copilot@users.noreply.github.com>

### ❤️ Contributors

- Janis Jansen ([@janis-me](https://github.com/janis-me))

## v0.4.0...@surimi/compiler@0.4.0

### 🚀 Enhancements

- **compiler:** Migrate watch mode from chokidar to Rolldown native API ([#68](https://github.com/surimidev/surimi/pull/68))

### 🏡 Chore

- Rename janis-me organization references to surimidev ([#65](https://github.com/surimidev/surimi/pull/65))

### ❤️ Contributors

- Yannik Knops <yannik.knops@googlemail.com>
- Janis Jansen ([@janis-me](https://github.com/janis-me))

## v0.3.1...@surimi/compiler@0.3.1

### 🩹 Fixes

- Update readmes for patch release ([6decbdf](https://github.com/surimidev/surimi/commit/6decbdf))

### ❤️ Contributors

- Janis Jansen ([@janis-me](https://github.com/janis-me))

## @surimi/compiler@0.2.0...@surimi/compiler@0.3.0

[compare changes](https://github.com/surimidev/surimi/compare/@surimi/compiler@0.2.0...@surimi/compiler@0.3.0)

### 🚀 Enhancements

- Ensure nested CSS files are built, cached and included only once ([8718c90](https://github.com/surimidev/surimi/commit/8718c90))
- Add commander.js for compiler arg parsing ([#54](https://github.com/surimidev/surimi/pull/54))

### 🩹 Fixes

- Copilot fuckup ([#55](https://github.com/surimidev/surimi/pull/55))

### 🏡 Chore

- Add changelogen monorepo ([#45](https://github.com/surimidev/surimi/pull/45))

### ❤️ Contributors

- Janis ([@janis-me](https://github.com/janis-me))
- Janis Jansen ([@janis-me](https://github.com/janis-me))

## vite-plugin-surimi@0.1.2...@surimi/compiler@0.2.0

[compare changes](https://github.com/surimidev/surimi/compare/vite-plugin-surimi@0.1.2...@surimi/compiler@0.2.0)

### 🚀 Enhancements

- Initial version of @surimi/selector-parser ([0e774de](https://github.com/surimidev/surimi/commit/0e774de))
- Working on parsers ([d46dc0c](https://github.com/surimidev/surimi/commit/d46dc0c))
- Introduce the new parsers into the core ([d087097](https://github.com/surimidev/surimi/commit/d087097))

### 🏡 Chore

- Linter updates, workspace improvements ([c995fba](https://github.com/surimidev/surimi/commit/c995fba))
- Switch to rollup for core bundling, update examples and CLI/vite plugin ([aa71ab9](https://github.com/surimidev/surimi/commit/aa71ab9))

### ❤️ Contributors

- Janis Jansen ([@janis-me](https://github.com/janis-me))

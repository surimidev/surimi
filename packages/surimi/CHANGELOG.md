# Changelog

## v0.5.1...surimi@0.5.1

### 🩹 Fixes

- Update readmes for patch release ([6decbdf](https://github.com/surimidev/surimi/commit/6decbdf))

### ❤️ Contributors

- Janis Jansen ([@janis-me](https://github.com/janis-me))

## surimi@0.4.0...surimi@0.5.0

[compare changes](https://github.com/surimidev/surimi/compare/surimi@0.4.0...surimi@0.5.0)

### 🚀 Enhancements

- **surimi:** Add common base class `SurimiBase` for all exported surimi classes ([a825181](https://github.com/surimidev/surimi/commit/a825181))
- Ensure nested CSS files are built, cached and included only once ([8718c90](https://github.com/surimidev/surimi/commit/8718c90))

### 🩹 Fixes

- **parsers:** Support tokenizing at-rules with names (container queries) ([#51](https://github.com/surimidev/surimi/pull/51))
- Fix typing of select and styles methods (usables) ([069b4d1](https://github.com/surimidev/surimi/commit/069b4d1))
- Append custom properties instead of pre-pending them ([0634cf4](https://github.com/surimidev/surimi/commit/0634cf4))

### 🏡 Chore

- Add changelogen monorepo ([#45](https://github.com/surimidev/surimi/pull/45))

### ❤️ Contributors

- Janis ([@janis-me](https://github.com/janis-me))
- Janis Jansen ([@janis-me](https://github.com/janis-me))

## surimi@0.3.1...surimi@0.4.0

[compare changes](https://github.com/surimidev/surimi/compare/surimi@0.3.1...surimi@0.4.0)

### 🚀 Enhancements

- Proper CSS typings, mixins etc. ([a80be19](https://github.com/surimidev/surimi/commit/a80be19))
- Finish initial work on new selector / builder APIs. ([c3768fc](https://github.com/surimidev/surimi/commit/c3768fc))
- Adjust tests, start working on media queries and custom properties ([7c282e2](https://github.com/surimidev/surimi/commit/7c282e2))
- Finish working on media query builder ([df83356](https://github.com/surimidev/surimi/commit/df83356))
- Add media query 5 data, adjust tests, add 'parent' and 'main' navigation functions ([e79f382](https://github.com/surimidev/surimi/commit/e79f382))
- Initial version of @surimi/selector-parser ([0e774de](https://github.com/surimidev/surimi/commit/0e774de))
- Working on parsers ([d46dc0c](https://github.com/surimidev/surimi/commit/d46dc0c))
- Introduce the new parsers into the core ([d087097](https://github.com/surimidev/surimi/commit/d087097))
- Re-usable styles and mixins ([#38](https://github.com/surimidev/surimi/pull/38))
- Allow nesting selector builders with the `select` method ([#40](https://github.com/surimidev/surimi/pull/40))

### 🩹 Fixes

- Fixed bugs and tests ([e824fb6](https://github.com/surimidev/surimi/commit/e824fb6))

### 🏡 Chore

- Start re-structuring the core ([37fe1bc](https://github.com/surimidev/surimi/commit/37fe1bc))
- Linter updates, workspace improvements ([c995fba](https://github.com/surimidev/surimi/commit/c995fba))
- Start to work on selector parsing ([c671120](https://github.com/surimidev/surimi/commit/c671120))
- Remove emotion/hash for now ([ad5aed5](https://github.com/surimidev/surimi/commit/ad5aed5))
- Switch to rollup for core bundling, update examples and CLI/vite plugin ([aa71ab9](https://github.com/surimidev/surimi/commit/aa71ab9))
- Update tests, deps and readmes ([b3660c1](https://github.com/surimidev/surimi/commit/b3660c1))
- Remove old implementation and console.logs ([70bb7ce](https://github.com/surimidev/surimi/commit/70bb7ce))
- Depricate attribute builder and parent/main selectors for now ([da2faf0](https://github.com/surimidev/surimi/commit/da2faf0))
- Run linter ([a05bf2b](https://github.com/surimidev/surimi/commit/a05bf2b))
- **ci:** Update scripts and config for upcoming releases, include new package ([e1f3941](https://github.com/surimidev/surimi/commit/e1f3941))
- **surimi:** Switch from tsup to tsdown ([#43](https://github.com/surimidev/surimi/pull/43))

### ✅ Tests

- Uglify media query tests to match the at-rule stringify format ([dc43471](https://github.com/surimidev/surimi/commit/dc43471))

### ❤️ Contributors

- Janis ([@janis-me](https://github.com/janis-me))
- Janis Jansen ([@janis-me](https://github.com/janis-me))

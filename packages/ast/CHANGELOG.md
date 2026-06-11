# Changelog

## v0.7.0...v0.8.0

[compare changes](https://github.com/surimidev/surimi/compare/v0.7.0...v0.8.0)

### 🚀 Enhancements

- Rip out postcss and replace with tiny AST-builder package ([#79](https://github.com/surimidev/surimi/pull/79))
- Rolldown playground ([#80](https://github.com/surimidev/surimi/pull/80))
- Vue / Nuxt integration and examples ([#83](https://github.com/surimidev/surimi/pull/83))

  Co-authored-by: Copilot Autofix powered by AI <62310815+github-advanced-security[bot]@users.noreply.github.com>
  Does a lot of changes to the vite plugin to hopefully fix SSR/HMR issues and also allow Vue/Nuxt SFCs to work. This made the vite plugin much more involved and messy which I don't like, but right now I don't really know how to clean it up. I think that's just how it will grow from here on. Maybe svelte support will be easier now.

- Update playground lectures ([#89](https://github.com/surimidev/surimi/pull/89))

  Add a bit more content to the lectures. Now covers some of the more "advanced" topics. All still very brief.
  This also makes `surimi/conditional` work in the playground.


### 🏡 Chore

- Update deps, switch to biome ([#87](https://github.com/surimidev/surimi/pull/87))

### ❤️ Contributors

- Janis Jansen ([@janis-me](https://github.com/janis-me))

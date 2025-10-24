<p align="center">
  <a href="https://github.com/janis-me/surimi" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://surimi.dev/surimi-512x512.webp" alt="Surimi logo">
  </a>
</p>
<p align="center" style="margin-top: -8px">
  <a href="https://surimi.dev">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-online-orange">
  </a>
  <a href="https://npmjs.com/package/surimi">
    <img alt="surimi on npm" src="https://img.shields.io/npm/v/surimi?label=surimi%20on%20npm%20&labelColor=grey&color=orange">
  </a>
  <a href="https://github.com/janis-me/surimi">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/janis-me/surimi?style=flat">
  </a>
  <a href="https://github.com/janis-me/surimi/actions/workflows/unit-test.yml">
    <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/janis-me/surimi/unit-test.yml?label=Tests">
  </a>
</p>

# 🍣 `surimi` - the best way to write CSS

The zero-runtime, zero learning curve CSS 'preprocessor'. Use typescript to elevate your CSS game.

- 🔒 Bulletproof compile-time checks! No more typos, wrong variable names.
- 🚀 No runtime! All code you write is compiled to pure CSS.
- 🎭 A friendly CSS builder that gives you hints!
- 🌈 Works with any JS framework, build tool or CSS postprocessor. Especially with Vite.
- ✅ Fully tested with [Vitest](https://vitest.dev) and against the CSS spec

> [!NOTE]  
> Documentation and reference are now available on our website, [surimi.dev](https://surimi.dev).
> Get a look at it in our interactive playground at [surimi.dev/playground](https://surimi.dev/playground)

## What it is

Surimi consists of several tools you can combine to your liking, but at it's core, surimi allows you to build **maintainable**, **re-usable** and **safe** CSS using typescript. It offers fully typed methods for defining styles, selecting things and putting it all together with `builders` that **actually understand CSS** (see below).

You will write CSS in `.css.ts` files that are picked up by the surimi compiler and are turned into pure, zero-dependency CSS.

```ts
const darkButton = media().prefersColorScheme('dark').select("button")

select(darkButton).has('.icon > svg').style({
  color: theme.primaryDarkFont;
})
```

It has **ZERO** runtime! Everything you write will be compiled into optimized, pure CSS. We use [rolldown](https://rolldown.rs) to power `@surimi/compiler`, which will take your code, generate a CSS AST using PostCSS and compile it into pure CSS.

And remember, you are writing typescript. You can export things, import tokens into other files, use loops, variables, external libraries... everything!

## Installation

Surimi consists of multiple (mostly optional) chunks. Most importantly, you will need the preprocessor part:

```bash
# npm
npm install surimi
# pnpm
pnpm add surimi
```

We recommend using it with vite, as that's the easiest and fastest way to work with surimi. install

```bash
# npm
npm install vite-plugin-surimi
# pnpm
pnpm add vite-plugin-surimi
```

and add it to your config

```ts
import surimi from 'vite-plugin-surimi';

export default defineConfig({
  plugins: [surimi()],
});
```

Alternatively, you can install `@surimi/compiler` and run it's built-in CLI! It's also got a watch mode.

## It **actually understands** CSS!

We made sure surimi helps you to write good, maintainable CSS. So, we want it to give you hints and types for **everything**.

- It understands [CSS Level 4 selectors](https://www.w3.org/TR/selectors-4/) and shows you what you're styling in type hints (see the [docs](https://surimi.dev/docs))
- We use the CSS Specifications to ensure you can use 100% of the language properly (WIP)
- No hacks. We take this seriously and want to make it right. Thus, we create things like `@surimi/parsers`. Typescript nerds will love this one.

## Yet another CSS-in-JS tool...

I hear you! I was skeptical if I should build this as well, but I want to make an important distinction:
Surimi is a `TS-in-CSS` tool! You should never put surimi code in your components/business logic. We embrace seperating consirns here.
But surimi also allows you to have a clear interface between CSS and TS. For example, you can define your theme once and use it in both places.

But most importantly, surimi is not just a wrapper around an object like `{color: "red"}`. It actually _understands_ CSS and helps you write it!

---

~ Cheers, [janis](https://janis.me)

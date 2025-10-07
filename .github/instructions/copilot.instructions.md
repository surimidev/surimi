# Copilot Instructions for Surimi

This codebase is a pnpm monorepo for building a TypeScript library that provides a type-safe, ergonomic API for building CSS with TypeScript. The main package is `packages/surimi`, which implements a query-like builder API for selecting elements and applying styles.

## Architecture Overview

### Monorepo Structure

- **Root**: Workspace configuration with pnpm catalogs for dependency management
- **`packages/surimi/`**: Main library (currently in early development - `builder.ts` is empty)
- **`packages/linter-config/`**: Shared ESLint configuration with strict TypeScript rules
- **`packages/typescript-config/`**: Shared TypeScript configurations (`base.json`, `react.json`)

### PNPM Catalogs Pattern

Dependencies are managed through pnpm catalogs in `pnpm-workspace.yaml`:

- `build`: Build tools (vite, typescript)
- `format`: Prettier and plugins
- `lint`: ESLint ecosystem with typescript-eslint
- `test`: Vitest with browser testing via Playwright
- `script`: Utility tools like taze

Reference catalog dependencies as `"package": "catalog:category"` in package.json files.

## Development Conventions

### Import Patterns

- Use `#*` import alias for internal modules (see `packages/surimi/package.json` imports field)
- Prefer `import type` for type-only imports (enforced by ESLint)
- Use `_` prefix for unused parameters to satisfy linting rules

### TypeScript Configuration

- Extends strict TypeScript settings from `@janis.me/typescript-config/base.json`
- Uses `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` for extra type safety
- Module resolution set to "bundler" for modern build tools

### Testing Strategy

Vitest workspace with separate runners:

- **Unit tests**: `*.unit.test.ts` files run with threads pool
- **Browser tests**: `*.browser.test.ts` files run with Playwright

### Linting Rules

The linter config (`packages/linter-config/`) enforces:

- Strict TypeScript checking with stylistic rules
- Custom `@typescript-eslint/no-unused-vars` configuration allowing `_` prefixed variables
- Array type consistency (simple arrays as `T[]`, complex as `Array<T>`)
- Consistent type imports

## Key Commands

- `pnpm deps` - Update all dependencies using taze
- `pnpm format` - Format entire workspace with Prettier
- `pnpm lint` - Lint with per-package ESLint configs
- `pnpm test` - Run both unit and browser tests

## Vision

The library aims to enable `.css.ts` files with a fluent API like:

```ts
select('.container').style({ display: 'flex' });
select('.container').media('(min-width: 600px)').style({ flexDirection: 'row' });
```

Zero runtime overhead - CSS generation happens at build time.

The code above should compile to:

```css
.container {
  display: flex;
}

@media (min-width: 600px) {
  .container {
    flex-direction: row;
  }
}
```

It could have more features like binding CSS variables (custom properties) to TypeScript like

```ts
import { property } from 'surimi';

const primaryColor = property('--primary-color', 'blue');

select('.button').style({ color: primaryColor });
```

And nesting selectors to access children, or pseudo-classes:

```ts
select('.list').child('li').hover().style({ backgroundColor: 'lightgray' });
```

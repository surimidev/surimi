# Surimi 🍣

TypeScript-based CSS query builder that uses scripts like:

```typescript
select('.container').hover().style({ display: 'flex' });

media().minWidth('600px').select('html', 'body').style({ ... });
```

to generate CSS files with **zero runtime overhead** - CSS generation happens at build time.

> **Note:** Surimi is currently in **pre-alpha**. The API and features are subject to change.

## What makes it great:

- **Zero Runtime Overhead**: All CSS generation happens at build time
- **Type Safety**: Full TypeScript validation for CSS properties and values
- **Ergonomic API**: Fluent, chainable interface inspired by SQL builders
- **Standards Compliant**: Generates valid, optimized CSS
- **Extensible**: Using vite plugins or PostCSS? They will run out of the box!

## Features:

- Class / ID selectors that can be exported from `.css.ts` files

```ts
export const button = class('button');
select(button).hover().style({ ... });
// ...

import { button } from "./button.css.ts";
```

- Build-in media query builder
- Supports all pseudo elements and selectors, like `::after`, `:where`, `:has`, `:is` etc.

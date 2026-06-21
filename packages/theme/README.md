# @surimi/theme

CSS-only theming utilities for Surimi: define token contracts, assign values per mode, and wire light/dark (or arbitrary modes) without boilerplate.

```ts
import { createTheme } from '@surimi/theme';

const theme = createTheme({
  modes: {
    light: ':root',
    dark: '[data-theme="dark"]',
  },
  tokens: {
    bg: { app: { light: '#fff', dark: '#111', syntax: '<color>' } },
  },
});
```

See `defineVars`, `assignVars`, and `createTheme` exports.

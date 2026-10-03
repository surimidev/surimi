# @surimi/theme

Design tokens and themes for Surimi, as plain CSS custom properties.

```ts
import { media, select } from 'surimi';
import { createTheme, defineTokens, token } from 'surimi/theme';

export const tokens = defineTokens({
  background: token('#fff', '<color>'),
  text: '#111',
});

export const dark = createTheme(tokens, {
  background: '#111',
  text: '#eee',
});

select('[data-theme="dark"]').use(dark);
media().prefersColorScheme('dark').select(':root').use(dark);
```

- `defineTokens` declares tokens with their default values (on `:root`) and returns `var(--…)` refs.
- `token(value, syntax)` registers a token as a typed `@property`.
- `createTheme` returns a style with new values for some tokens. Apply it anywhere with `.use()`.

See the [theming guide](https://surimi.dev/docs/guides/theme).

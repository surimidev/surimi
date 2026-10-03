import type { CustomPropertyBuilder } from '@surimi/core';

import type { TokenDefinition } from '#token';

/** A design token. Stringifies to `var(--name)`, so you can use it as any style value. */
export type Token = CustomPropertyBuilder<string>;

/** A value a token can hold. A token as value aliases it (`var(--other)`). Numbers get no unit. */
export type TokenValue = string | number | Token;

/** Input to `defineTokens`. */
export type TokenTree = { [key: string]: TokenValue | TokenDefinition | TokenTree };

/** Output of `defineTokens`. */
export type TokenGroup = { readonly [key: string]: Token | TokenGroup };

export type Tokens<T extends TokenTree> = {
  readonly [K in keyof T]: T[K] extends TokenValue | TokenDefinition
    ? Token
    : T[K] extends TokenTree
      ? Tokens<T[K]>
      : never;
};

/** Input to `createTheme`. Partial, so a theme only lists what it changes. */
export type ThemeValues<T extends TokenGroup> = {
  [K in keyof T]?: T[K] extends Token ? TokenValue : T[K] extends TokenGroup ? ThemeValues<T[K]> : never;
};

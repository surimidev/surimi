import type { CssProperties } from '@surimi/common';
import { SurimiContext } from '@surimi/common';
import { CustomPropertyBuilder, StyleBuilder } from '@surimi/core';

import type { ThemeValues, TokenGroup, TokenValue } from '#types';

type ValueTree = { [key: string]: TokenValue | ValueTree | undefined };

function collect(tokens: TokenGroup, values: ValueTree, declarations: Record<string, TokenValue>) {
  for (const [key, value] of Object.entries(values)) {
    const ref = tokens[key];

    if (value === undefined || ref === undefined) {
      continue;
    }

    const isValue = typeof value !== 'object' || value instanceof CustomPropertyBuilder;

    if (ref instanceof CustomPropertyBuilder) {
      if (!isValue) {
        throw new TypeError(`Expected a value for ${ref.name}, got a group`);
      }

      declarations[ref.name] = value;
    } else if (!isValue) {
      collect(ref, value, declarations);
    }
  }
}

/**
 * Create a theme with new values for some of your tokens. Returns a style,
 * so you decide where it applies by using it on a selector.
 *
 * @example
 * ```ts
 * const dark = createTheme(tokens, { background: '#111', text: '#eee' });
 *
 * select('[data-theme="dark"]').use(dark);
 * media().prefersColorScheme('dark').select(':root').use(dark);
 * ```
 */
export function createTheme<T extends TokenGroup>(tokens: T, values: ThemeValues<T>): StyleBuilder {
  const declarations: Record<string, TokenValue> = {};

  collect(tokens, values as ValueTree, declarations);

  return new StyleBuilder(SurimiContext.root, declarations as CssProperties);
}

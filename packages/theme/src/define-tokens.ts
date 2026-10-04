import type { CssProperties } from '@surimi/common';
import { SurimiContext } from '@surimi/common';
import { CustomPropertyBuilder, createSelectorBuilderFromString } from '@surimi/core';

import { TokenDefinition } from '#token';
import type { Token, TokenGroup, Tokens, TokenTree, TokenValue } from '#types';

export interface DefineTokensOptions {
  /** Prepended to every name: `prefix: 'ds'` turns `background` into `--ds-background`. */
  prefix?: string | undefined;
}

type Declarations = Record<string, string>;

/** Defaults already set on `:root`, by name. */
const defaults = new WeakMap<typeof SurimiContext.root, Map<string, string>>();

function isValue(node: TokenValue | TokenDefinition<unknown> | TokenTree): node is TokenValue {
  return typeof node !== 'object' || node instanceof CustomPropertyBuilder;
}

function createToken(name: string, node: TokenValue | TokenDefinition<unknown>): Token<unknown> {
  if (!(node instanceof TokenDefinition)) {
    return new CustomPropertyBuilder(SurimiContext.root, name, { register: false });
  }

  const { value, syntax, inherits } = node;
  const isAlias = value instanceof CustomPropertyBuilder;

  return new CustomPropertyBuilder(SurimiContext.root, name, {
    syntax,
    inherits,
    initialValue: isAlias && syntax === '*' ? undefined : value,
  });
}

function build(tree: TokenTree, path: string[], declarations: Declarations, seen: Map<string, string>): TokenGroup {
  const group: Record<string, Token<unknown> | TokenGroup> = {};

  for (const [key, node] of Object.entries(tree)) {
    const keyPath = [...path, key];

    if (node instanceof TokenDefinition || isValue(node)) {
      const name = `--${keyPath.join('-')}`;
      const firstKey = seen.get(name);

      if (firstKey !== undefined) {
        throw new Error(`Duplicate token name "${name}" from keys "${firstKey}" and "${keyPath.join('.')}"`);
      }
      seen.set(name, keyPath.join('.'));

      group[key] = createToken(name, node);
      declarations[name] = String(node instanceof TokenDefinition ? node.value : node);
    } else {
      group[key] = build(node, keyPath, declarations, seen);
    }
  }

  return group;
}

/**
 * Define design tokens with their default values. The defaults are set on `:root`.
 * Names are the path joined with `-`: `{ fontSize: { large: '2rem' } }` becomes `--fontSize-large`.
 * Wrap a value in `token()` to also register it as a typed `@property`.
 *
 * @example
 * ```ts
 * export const tokens = defineTokens({
 *   background: token('#fff', '<color>'),
 *   text: '#111',
 * });
 *
 * select('body').style({ background: tokens.background, color: tokens.text });
 * ```
 */
export function defineTokens<T extends TokenTree>(values: T, options: DefineTokensOptions = {}): Tokens<T> {
  const declarations: Declarations = {};
  const tokens = build(values, options.prefix ? [options.prefix] : [], declarations, new Map());

  let existing = defaults.get(SurimiContext.root);
  if (!existing) {
    existing = new Map();
    defaults.set(SurimiContext.root, existing);
  }

  for (const [name, value] of Object.entries(declarations)) {
    const previous = existing.get(name);

    if (previous === undefined) {
      existing.set(name, value);
    } else if (previous === value) {
      delete declarations[name];
    } else {
      throw new Error(`Conflicting default for ${name}: existing ${previous} vs new ${value}`);
    }
  }

  if (Object.keys(declarations).length > 0) {
    createSelectorBuilderFromString([':root'], SurimiContext.root, SurimiContext.root).style(
      declarations as CssProperties,
    );
  }

  return tokens as Tokens<T>;
}

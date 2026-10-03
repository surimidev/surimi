import type { CssProperties } from '@surimi/common';
import { SurimiContext } from '@surimi/common';
import { CustomPropertyBuilder, createSelectorBuilderFromString } from '@surimi/core';

import { TokenDefinition } from '#token';
import type { Token, TokenGroup, Tokens, TokenTree, TokenValue } from '#types';

export interface DefineTokensOptions {
  /** Prepended to every name: `prefix: 'ds'` turns `background` into `--ds-background`. */
  prefix?: string | undefined;
}

type Declarations = Record<string, TokenValue>;

function toKebabCase(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function isValue(node: TokenValue | TokenTree): node is TokenValue {
  return typeof node !== 'object' || node instanceof CustomPropertyBuilder;
}

function createToken(name: string, node: TokenValue | TokenDefinition): Token {
  if (!(node instanceof TokenDefinition)) {
    return new CustomPropertyBuilder(SurimiContext.root, name, { register: false });
  }

  const { value, syntax, inherits } = node;

  if (value instanceof CustomPropertyBuilder) {
    if (syntax !== '*') {
      throw new Error(`Token ${name} has syntax '${syntax}' and needs a literal default, not ${value.build()}`);
    }

    return new CustomPropertyBuilder(SurimiContext.root, name, { syntax, inherits });
  }

  return new CustomPropertyBuilder(SurimiContext.root, name, { syntax, inherits, initialValue: String(value) });
}

function build(tree: TokenTree, path: string[], declarations: Declarations): TokenGroup {
  const group: Record<string, Token | TokenGroup> = {};

  for (const [key, node] of Object.entries(tree)) {
    const nextPath = [...path, toKebabCase(key)];

    if (node instanceof TokenDefinition || isValue(node)) {
      const name = `--${nextPath.join('-')}`;

      group[key] = createToken(name, node);
      declarations[name] = node instanceof TokenDefinition ? node.value : node;
    } else {
      group[key] = build(node, nextPath, declarations);
    }
  }

  return group;
}

/**
 * Define design tokens with their default values. The defaults are set on `:root`.
 * Names are the kebab-cased path: `{ fontSize: { large: '2rem' } }` becomes `--font-size-large`.
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
  const tokens = build(values, options.prefix ? [toKebabCase(options.prefix)] : [], declarations);

  if (Object.keys(declarations).length > 0) {
    createSelectorBuilderFromString([':root'], SurimiContext.root, SurimiContext.root).style(
      declarations as CssProperties,
    );
  }

  return tokens as Tokens<T>;
}

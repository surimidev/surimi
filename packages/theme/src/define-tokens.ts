import type { CssProperties } from '@surimi/common';
import { SurimiContext } from '@surimi/common';
import { CustomPropertyBuilder, type CustomPropertyOptions, createSelectorBuilderFromString } from '@surimi/core';

import { TokenDefinition } from '#token';
import type { Token, TokenGroup, Tokens, TokenTree, TokenValue } from '#types';

export interface DefineTokensOptions {
  /** Prepended to every name: `prefix: 'ds'` turns `background` into `--ds-background`. */
  prefix?: string | undefined;
}

interface Entry {
  group: Record<string, Token | TokenGroup>;
  key: string;
  name: string;
  options: CustomPropertyOptions<TokenValue>;
  value: string;
}

/** Defaults already set on `:root`, by name. */
const defaults = new WeakMap<typeof SurimiContext.root, Map<string, string>>();

function isValue(node: TokenValue | TokenDefinition | TokenTree): node is TokenValue {
  return typeof node !== 'object' || node instanceof CustomPropertyBuilder;
}

function toOptions(node: TokenValue | TokenDefinition): CustomPropertyOptions<TokenValue> {
  if (!(node instanceof TokenDefinition)) {
    return { register: false };
  }

  const { value, syntax, inherits } = node;
  const isAlias = value instanceof CustomPropertyBuilder;

  return { syntax, inherits, initialValue: isAlias && syntax === '*' ? undefined : value };
}

function collect(tree: TokenTree, path: string[], entries: Entry[], seen: Map<string, string>): TokenGroup {
  const group: Record<string, Token | TokenGroup> = {};

  for (const [key, node] of Object.entries(tree)) {
    const keyPath = [...path, key];

    if (node instanceof TokenDefinition || isValue(node)) {
      const name = `--${keyPath.join('-')}`;
      const firstKey = seen.get(name);

      if (firstKey !== undefined) {
        throw new Error(`Duplicate token name "${name}" from keys "${firstKey}" and "${keyPath.join('.')}"`);
      }
      seen.set(name, keyPath.join('.'));

      const value = String(node instanceof TokenDefinition ? node.value : node);
      // Reserves the key position, the token is only created once everything is valid
      group[key] = undefined as never;
      entries.push({ group, key, name, options: toOptions(node), value });
    } else {
      group[key] = collect(node, keyPath, entries, seen);
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
  const root = SurimiContext.root;
  const entries: Entry[] = [];
  const tokens = collect(values, options.prefix ? [options.prefix] : [], entries, new Map());
  const existing = defaults.get(root) ?? new Map<string, string>();

  for (const { name, options: propertyOptions, value } of entries) {
    CustomPropertyBuilder.validate(root, name, propertyOptions);

    const previous = existing.get(name);

    if (previous !== undefined && previous !== value) {
      throw new Error(`Conflicting default for ${name}: existing ${previous} vs new ${value}`);
    }
  }

  const declarations: Record<string, string> = {};

  for (const { group, key, name, options: propertyOptions, value } of entries) {
    group[key] = new CustomPropertyBuilder(root, name, propertyOptions) as Token;

    if (!existing.has(name)) {
      existing.set(name, value);
      declarations[name] = value;
    }
  }

  defaults.set(root, existing);

  if (Object.keys(declarations).length > 0) {
    createSelectorBuilderFromString([':root'], root, root).style(declarations as CssProperties);
  }

  return tokens as Tokens<T>;
}

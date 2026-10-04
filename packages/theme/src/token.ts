import type { SyntaxValue } from '@surimi/common';

import type { Token } from '#types';

declare const tokenBrand: unique symbol;

export interface TokenOptions<S extends string = string> {
  /** `@property` syntax, e.g. `'<color>'`. Defaults to `'*'`. */
  syntax?: S | undefined;
  /** Defaults to `true`. */
  inherits?: boolean | undefined;
}

export class TokenDefinition<TValue = string | number> {
  declare readonly [tokenBrand]: TValue;

  readonly value: TValue | Token;
  readonly syntax: string;
  readonly inherits: boolean;

  constructor(value: TValue | Token, { syntax = '*', inherits = true }: TokenOptions = {}) {
    this.value = value;
    this.syntax = syntax;
    this.inherits = inherits;
  }
}

/**
 * Declare a token that also gets an `@property` rule, for `defineTokens`.
 * The value is the default and becomes the `initial-value`, so it must match the syntax.
 * Plain values work too, they just don't get an `@property`.
 *
 * @example
 * ```ts
 * defineTokens({
 *   background: token('#fff', '<color>'),
 *   radius: token('4px', { syntax: '<length>', inherits: false }),
 * });
 * ```
 */
export function token<const S extends string = '*'>(
  value: NoInfer<SyntaxValue<S>> | Token,
  options?: S | TokenOptions<S>,
): TokenDefinition<SyntaxValue<S>> {
  return new TokenDefinition(value, typeof options === 'string' ? { syntax: options } : options);
}

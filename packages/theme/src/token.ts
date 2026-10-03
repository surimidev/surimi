import type { TokenValue } from '#types';

declare const tokenBrand: unique symbol;

export interface TokenOptions {
  /** `@property` syntax, e.g. `'<color>'`. Defaults to `'*'`. */
  syntax?: string | undefined;
  /** Defaults to `true`. */
  inherits?: boolean | undefined;
}

export class TokenDefinition {
  declare readonly [tokenBrand]: true;

  readonly value: TokenValue;
  readonly syntax: string;
  readonly inherits: boolean;

  constructor(value: TokenValue, { syntax = '*', inherits = true }: TokenOptions = {}) {
    this.value = value;
    this.syntax = syntax;
    this.inherits = inherits;
  }
}

/**
 * Declare a token that also gets an `@property` rule, for `defineTokens`.
 * The value is the default and becomes the `initial-value`.
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
export function token(value: TokenValue, options?: string | TokenOptions): TokenDefinition {
  return new TokenDefinition(value, typeof options === 'string' ? { syntax: options } : options);
}

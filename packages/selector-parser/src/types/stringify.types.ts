import type { CombinatorToken, CommaToken, Token } from './index';

/**
 * Helper to extract the trimmed content from a combinator string.
 */
type TrimCombinator<T extends string> = T extends ` ${infer Rest}`
  ? TrimCombinator<Rest>
  : T extends `${infer Rest} `
    ? TrimCombinator<Rest>
    : T;

/**
 * Normalizes a token's content for stringification.
 * - Combinators: adds spaces around them (except descendant which stays as single space)
 * - Commas: adds space after them
 * - Other tokens: keeps original content
 */
type NormalizeToken<T extends Token> = T extends CombinatorToken
  ? TrimCombinator<T['content']> extends ''
    ? ' '
    : ` ${TrimCombinator<T['content']>} `
  : T extends CommaToken
    ? ', '
    : T['content'];

/**
 * Recursively concatenates the normalized content of all tokens into a string literal type.
 * Takes a readonly array of tokens and produces a string literal representing the selector
 * with normalized whitespace around combinators and after commas.
 *
 * If `TDense` is true, no normalization is applied and original content is used.
 */
export type Stringify<T extends Token[], TDense extends boolean> = T extends readonly [
  infer First extends Token,
  ...infer Rest extends Token[],
]
  ? `${TDense extends true ? First['content'] : NormalizeToken<First>}${Stringify<Rest, TDense>}`
  : '';

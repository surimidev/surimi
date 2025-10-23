import type { CombinatorToken, CommaToken, Token } from '#types';

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
 */
export type StringifySelector<T extends Token[]> = T extends readonly [
  infer First extends Token,
  ...infer Rest extends Token[],
]
  ? `${NormalizeToken<First>}${StringifySelector<Rest>}`
  : '';

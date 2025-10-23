import type { Token } from '#types';

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
type NormalizeToken<T extends Token> = `${TrimCombinator<T['content']>} `;

/**
 * Type-level stringify for CSS at-rules
 * Converts token types back to string types
 */
export type StringifyAtRule<T extends Token[]> = T extends readonly [
  infer First extends Token,
  ...infer Rest extends Token[],
]
  ? TrimCombinator<`${NormalizeToken<First>}${StringifyAtRule<Rest>}`>
  : '';

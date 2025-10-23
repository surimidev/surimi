import type { StringifyAtRule, Token } from '#types';

/**
 * Stringify an array of at-rule tokens back into a string
 *
 * @param tokens - Array of tokens to stringify
 * @returns The reconstructed at-rule string
 */
export function stringifyAtRule<T extends Token[]>(tokens: T): StringifyAtRule<T> {
  return tokens.map(token => token.content).join(' ') as StringifyAtRule<T>;
}

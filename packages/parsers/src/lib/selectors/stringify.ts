import type { StringifySelector, Token } from '#types';

/**
 * Normalizes a single token's content for stringification.
 * - Combinators: adds spaces around them (except descendant which stays as single space)
 * - Commas: adds space after them
 */
function normalizeToken(token: Token): string {
  if (token.type === 'combinator') {
    const trimmed = token.content.trim();
    // Descendant combinator (space) stays as single space
    if (trimmed === '') {
      return ' ';
    }
    // Other combinators get spaces around them
    return ` ${trimmed} `;
  }
  if (token.type === 'comma') {
    return ', ';
  }
  return token.content;
}

/**
 * Stringifies an array of tokens back into a CSS selector string.
 *
 * Tokens are normalized with whitespace around combinators and after commas.
 */
export function stringifySelector<T extends Token[]>(tokens: T): StringifySelector<T> {
  return tokens.map(normalizeToken).join('') as StringifySelector<T>;
}

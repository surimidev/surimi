import {
  isDigit,
  isIdentifierChar,
  isIdentifierStart,
  isWhitespace,
  readIdentifier,
  readNumber,
  readQuotedString,
  readUntilCloseParen,
  skipWhitespace,
} from '#lib/utils';
import type { Token, TokenizeAtRule } from '#types';

/**
 * Tokenize a CSS at-rule prelude (everything before the {)
 *
 * Examples:
 * - "@media screen and (min-width: 768px)"
 * - "@container (min-width: 400px)"
 * - "@keyframes slide-in"
 * - "@property --my-color"
 * - "@font-face"
 *
 * @param input - The at-rule string to tokenize
 * @returns Array of tokens
 */
export function tokenizeAtRule<S extends string>(input: S): TokenizeAtRule<S> {
  const tokens: Token[] = [];
  let pos = 0;

  // Main tokenization loop
  while (pos < input.length) {
    const char = input[pos];
    if (!char) break;

    // Skip whitespace (we don't emit whitespace tokens by default)
    if (isWhitespace(char)) {
      pos = skipWhitespace(input, pos);
      continue;
    }

    // At-rule name (@media, @container, etc.)
    if (char === '@') {
      pos++; // skip @
      const { value: name, endPos } = readIdentifier(input, pos);
      pos = endPos;
      tokens.push({
        type: 'at-rule-name',
        name,
        content: `@${name}`,
      });
      continue;
    }

    // String literals
    if (char === '"' || char === "'") {
      const { value, endPos } = readQuotedString(input, pos, char);
      pos = endPos;
      tokens.push({
        type: 'string',
        value,
        content: value,
      });
      continue;
    }

    // Hash/Color
    if (char === '#') {
      pos++; // skip #
      let value = '';
      while (pos < input.length) {
        const c = input[pos];
        if (c && (isIdentifierChar(c) || isDigit(c))) {
          value += c;
          pos++;
        } else {
          break;
        }
      }
      tokens.push({
        type: 'hash',
        value,
        content: `#${value}`,
      });
      continue;
    }

    // Numbers, dimensions, percentages
    if (
      isDigit(char) ||
      (char === '-' && pos + 1 < input.length && isDigit(input[pos + 1])) ||
      (char === '+' && pos + 1 < input.length && isDigit(input[pos + 1])) ||
      (char === '.' && pos + 1 < input.length && isDigit(input[pos + 1]))
    ) {
      const start = pos;
      const { value, endPos } = readNumber(input, pos);
      pos = endPos;

      // Check for unit/dimension
      const nextChar = input[pos];
      if (nextChar && isIdentifierStart(nextChar)) {
        const { value: unit, endPos: unitEnd } = readIdentifier(input, pos);
        pos = unitEnd;
        tokens.push({
          type: 'dimension',
          value,
          unit,
          content: input.slice(start, pos),
        });
      }
      // Check for percentage
      else if (input[pos] === '%') {
        pos++;
        tokens.push({
          type: 'percentage',
          value,
          content: input.slice(start, pos),
        });
      }
      // Just a number
      else {
        tokens.push({
          type: 'number',
          value,
          content: input.slice(start, pos),
        });
      }
      continue;
    }

    // Identifiers and keywords (and, or, not, etc.)
    if (isIdentifierStart(char)) {
      const _start = pos;
      const { value, endPos } = readIdentifier(input, pos);
      pos = endPos;

      // Check if it's a logical operator (and, or, not) - these are NOT functions even if followed by (
      if (value === 'and' || value === 'or' || value === 'not') {
        tokens.push({
          type: 'operator',
          operator: value,
          content: value,
        });
      }
      // Check if it's followed by a parenthesis (function)
      else {
        pos = skipWhitespace(input, pos);
        if (input[pos] === '(') {
          pos++; // skip (
          const { value: argument, endPos: argEnd } = readUntilCloseParen(input, pos);
          pos = argEnd;
          // Skip the closing )
          if (input[pos] === ')') {
            pos++;
          }

          // Special handling for url() function
          if (value === 'url') {
            tokens.push({
              type: 'url',
              value: argument.trim(),
              content: `url(${argument})`,
            });
          } else {
            tokens.push({
              type: 'function',
              name: value,
              argument,
              content: `${value}(${argument})`,
            });
          }
        }
        // Regular identifier
        else {
          tokens.push({
            type: 'identifier',
            value,
            content: value,
          });
        }
      }
      continue;
    }

    // Operators (>=, <=, =, <, >)
    if (char === '>' || char === '<' || char === '=') {
      let operator = char;
      pos++;

      // Check for two-character operators
      if (pos < input.length && input[pos] === '=') {
        operator += '=';
        pos++;
      }

      tokens.push({
        type: 'operator',
        operator,
        content: operator,
      });
      continue;
    }

    // Delimiters
    if (char === '(' || char === ')' || char === ',' || char === ':' || char === '/') {
      tokens.push({
        type: 'delimiter',
        delimiter: char,
        content: char,
      });
      pos++;
      continue;
    }

    // Unknown character - skip it
    pos++;
  }

  return tokens as TokenizeAtRule<S>;
}

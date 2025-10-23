import type {
  AttributeToken,
  ClassToken,
  CombinatorToken,
  CommaToken,
  IdToken,
  PseudoClassToken,
  PseudoElementToken,
  Token,
  TokenizeSelector,
  TypeToken,
  UniversalToken,
} from '#types';

import {
  isIdentifierChar,
  isWhitespace,
  readIdentifier,
  readNamespace,
  readQuotedString,
  readUntil,
  skipWhitespace,
} from '../utils';

/**
 * Tokenizes a CSS selector string into an array of tokens.
 * This implementation uses character-by-character parsing to make it
 * reproducible as TypeScript types.
 */
export function tokenizeSelector<S extends string>(selector: S): TokenizeSelector<S> {
  const tokens: Token[] = [];
  let pos = 0;

  while (pos < selector.length) {
    const char = selector[pos];

    // Skip whitespace and check for combinator
    if (char && isWhitespace(char)) {
      pos = skipWhitespace(selector, pos);

      // Check if there's a combinator after whitespace
      const nextChar = selector[pos];
      if (nextChar === '>' || nextChar === '+' || nextChar === '~') {
        // Skip any whitespace after the combinator
        pos = skipWhitespace(selector, pos + 1);
        tokens.push({
          type: 'combinator',
          content: nextChar,
        } as CombinatorToken);
      } else if (pos < selector.length && nextChar !== ',') {
        // Descendant combinator (space)
        tokens.push({
          type: 'combinator',
          content: ' ',
        } as CombinatorToken);
      }
      continue;
    }

    // Comma
    if (char === ',') {
      pos++;
      pos = skipWhitespace(selector, pos);
      tokens.push({
        type: 'comma',
        content: ',',
      } as CommaToken);
      continue;
    }

    // Combinator (without leading whitespace)
    if (char === '>' || char === '+' || char === '~') {
      pos++;
      pos = skipWhitespace(selector, pos);
      tokens.push({
        type: 'combinator',
        content: char,
      } as CombinatorToken);
      continue;
    }

    // ID selector
    if (char === '#') {
      pos++;
      const { value: name, endPos } = readIdentifier(selector, pos, true);
      pos = endPos;
      tokens.push({
        type: 'id',
        name,
        content: `#${name}`,
      } as IdToken);
      continue;
    }

    // Class selector
    if (char === '.') {
      pos++;
      const { value: name, endPos } = readIdentifier(selector, pos, true);
      pos = endPos;
      tokens.push({
        type: 'class',
        name,
        content: `.${name}`,
      } as ClassToken);
      continue;
    }

    // Attribute selector
    if (char === '[') {
      const attrStart = pos;
      pos++; // Skip [
      pos = skipWhitespace(selector, pos);

      // Try to read attribute name first, then check for namespace or operator
      let namespace: string | undefined;
      let name = '';

      // Read the first identifier
      const { value: firstIdent, endPos: firstEnd } = readIdentifier(selector, pos, true);
      pos = firstEnd;

      // Check what comes after the first identifier
      if (selector[pos] === '|' && selector[pos + 1] !== '=') {
        // This is a namespace separator (not the |= operator)
        namespace = firstIdent;
        pos++; // Skip |
        // Now read the actual attribute name
        const { value: attrName, endPos: attrEnd } = readIdentifier(selector, pos, true);
        name = attrName;
        pos = attrEnd;
      } else {
        // No namespace, the first identifier is the attribute name
        name = firstIdent;
      }

      pos = skipWhitespace(selector, pos);

      let operator: string | undefined;
      let value: string | undefined;
      let caseSensitive: 'i' | 'I' | 's' | 'S' | undefined;

      // Check for operator
      if (pos < selector.length && selector[pos] !== ']') {
        // Read operator (=, ~=, |=, ^=, $=, *=)
        if (
          selector[pos] === '~' ||
          selector[pos] === '|' ||
          selector[pos] === '^' ||
          selector[pos] === '$' ||
          selector[pos] === '*'
        ) {
          operator = (selector[pos] ?? '') + (selector[pos + 1] ?? '');
          pos += 2;
        } else if (selector[pos] === '=') {
          operator = '=';
          pos++;
        }

        pos = skipWhitespace(selector, pos);

        // Read value
        if (selector[pos] === '"' || selector[pos] === "'") {
          const { value: quotedVal, endPos: quotedEnd } = readQuotedString(selector, pos, selector[pos] ?? '');
          value = quotedVal;
          pos = quotedEnd;
        } else {
          // Unquoted value
          const { value: unquotedVal, endPos: unquotedEnd } = readIdentifier(selector, pos, true);
          value = unquotedVal;
          pos = unquotedEnd;
        }

        pos = skipWhitespace(selector, pos);

        // Check for case sensitivity flag
        if (
          pos < selector.length &&
          (selector[pos] === 'i' || selector[pos] === 'I' || selector[pos] === 's' || selector[pos] === 'S')
        ) {
          caseSensitive = selector[pos] as 'i' | 'I' | 's' | 'S';
          pos++;
          pos = skipWhitespace(selector, pos);
        }
      }

      // Skip closing ]
      if (selector[pos] === ']') {
        pos++;
      }

      const content = selector.slice(attrStart, pos);
      const token: AttributeToken = {
        type: 'attribute',
        name,
        content,
      };

      if (namespace !== undefined) {
        token.namespace = namespace;
      }
      if (operator !== undefined) {
        token.operator = operator;
      }
      if (value !== undefined) {
        token.value = value;
      }
      if (caseSensitive !== undefined) {
        token.caseSensitive = caseSensitive;
      }

      tokens.push(token);
      continue;
    }

    // Pseudo-element (::)
    if (char === ':' && selector[pos + 1] === ':') {
      const pseudoStart = pos;
      pos += 2; // Skip ::
      const { value: name, endPos } = readIdentifier(selector, pos, true);
      pos = endPos;

      let argument: string | undefined;

      // Check for argument
      if (selector[pos] === '(') {
        pos++; // Skip (
        const { value: argValue, endPos: argEnd } = readUntil(selector, pos, ')', true);
        argument = argValue;
        pos = argEnd;
        if (selector[pos] === ')') {
          pos++; // Skip )
        }
      }

      const content = selector.slice(pseudoStart, pos);
      const token: PseudoElementToken = {
        type: 'pseudo-element',
        name,
        content,
      };

      if (argument !== undefined) {
        token.argument = argument;
      }

      tokens.push(token);
      continue;
    }

    // Pseudo-class (:)
    if (char === ':') {
      const pseudoStart = pos;
      pos++; // Skip :
      const { value: name, endPos } = readIdentifier(selector, pos, true);
      pos = endPos;

      let argument: string | undefined;

      // Check for argument
      if (selector[pos] === '(') {
        pos++; // Skip (
        const { value: argValue, endPos: argEnd } = readUntil(selector, pos, ')', true);
        argument = argValue;
        pos = argEnd;
        if (selector[pos] === ')') {
          pos++; // Skip )
        }
      }

      const content = selector.slice(pseudoStart, pos);
      const token: PseudoClassToken = {
        type: 'pseudo-class',
        name,
        content,
      };

      if (argument !== undefined) {
        token.argument = argument;
      }

      tokens.push(token);
      continue;
    }

    // Universal selector or Type selector with namespace
    if (char === '*') {
      const nsStart = pos;
      pos++; // Skip *

      // Check if this is a namespace
      if (selector[pos] === '|') {
        pos++; // Skip |

        // Now read the actual selector after namespace
        if (selector[pos] === '*') {
          // namespace|*
          pos++;
          tokens.push({
            type: 'universal',
            namespace: '*',
            content: selector.slice(nsStart, pos),
          } as UniversalToken);
        } else {
          // namespace|type
          const { value: name, endPos } = readIdentifier(selector, pos, true);
          pos = endPos;
          tokens.push({
            type: 'type',
            namespace: '*',
            name,
            content: selector.slice(nsStart, pos),
          } as TypeToken);
        }
      } else {
        // Just universal selector
        tokens.push({
          type: 'universal',
          content: '*',
        } as UniversalToken);
      }
      continue;
    }

    // Type selector (with optional namespace)
    if (char && isIdentifierChar(char, true)) {
      const typeStart = pos;

      // Check for namespace
      const { namespace, endPos: nsEnd } = readNamespace(selector, pos);

      if (namespace !== undefined) {
        pos = nsEnd;

        // After namespace|, we should have either * or a type name
        if (selector[pos] === '*') {
          pos++;
          tokens.push({
            type: 'universal',
            namespace,
            content: selector.slice(typeStart, pos),
          } as UniversalToken);
          continue;
        }
      }

      // Read type name
      const { value: name, endPos } = readIdentifier(selector, pos, true);
      pos = endPos;

      const token: TypeToken = {
        type: 'type',
        name,
        content: selector.slice(typeStart, pos),
      };

      if (namespace !== undefined) {
        token.namespace = namespace;
      }

      tokens.push(token);
      continue;
    }

    // Unknown character - skip it
    pos++;
  }

  return tokens as TokenizeSelector<S>;
}

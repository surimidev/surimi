import type { Tokenize } from '#types/tokenize.types';

import type {
  AttributeToken,
  ClassToken,
  CombinatorToken,
  CommaToken,
  IdToken,
  PseudoClassToken,
  PseudoElementToken,
  Token,
  TypeToken,
  UniversalToken,
} from './types';

/**
 * Tokenizes a CSS selector string into an array of tokens.
 * This implementation uses character-by-character parsing to make it
 * reproducible as TypeScript types.
 *
 * @param selector - The CSS selector string to tokenize
 * @returns An array of tokens representing the selector
 */
export function tokenize<S extends string>(selector: S): Tokenize<S> {
  const tokens: Token[] = [];
  let pos = 0;

  // Helper to check if character is whitespace
  const isWhitespace = (char: string | undefined): boolean => {
    if (!char) return false;

    return char === ' ' || char === '\t' || char === '\n' || char === '\r';
  };

  // Helper to check if character is valid for identifier (CSS ident)
  const isIdentifierChar = (char: string | undefined): boolean => {
    if (!char) return false;

    return (
      (char >= 'a' && char <= 'z') ||
      (char >= 'A' && char <= 'Z') ||
      (char >= '0' && char <= '9') ||
      char === '-' ||
      char === '_' ||
      char.charCodeAt(0) > 127 // Non-ASCII characters
    );
  };

  // Helper to read an identifier
  const readIdentifier = (startPos: number): string => {
    let result = '';
    let i = startPos;

    while (i < selector.length && isIdentifierChar(selector[i])) {
      result += selector[i] ?? '';
      i++;
    }
    return result;
  };

  // Helper to skip whitespace
  const skipWhitespace = (startPos: number): number => {
    let i = startPos;
    while (i < selector.length && isWhitespace(selector[i])) {
      i++;
    }
    return i;
  };

  // Helper to read quoted string
  const readQuotedString = (startPos: number, quote: string): { value: string; endPos: number } => {
    let result = quote;
    let i = startPos + 1;
    let escaped = false;

    while (i < selector.length) {
      const char = selector[i] ?? '';
      result += char;

      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        return { value: result, endPos: i + 1 };
      }

      i++;
    }

    return { value: result, endPos: i };
  };

  // Helper to read until a specific character (with nesting support for parentheses)
  const readUntil = (startPos: number, endChar: string, supportNesting = false): { value: string; endPos: number } => {
    let result = '';
    let i = startPos;
    let depth = 0;
    let escaped = false;

    while (i < selector.length) {
      const char = selector[i] ?? '';

      if (escaped) {
        result += char;
        escaped = false;
        i++;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        result += char;
        i++;
        continue;
      }

      // Handle quoted strings
      if (char === '"' || char === "'") {
        const quoted = readQuotedString(i, char);
        result += quoted.value;
        i = quoted.endPos;
        continue;
      }

      if (supportNesting) {
        if (char === '(') {
          depth++;
        } else if (char === ')') {
          if (depth === 0) {
            return { value: result, endPos: i };
          }
          depth--;
        }
      } else {
        if (char === endChar) {
          return { value: result, endPos: i };
        }
      }

      result += char;
      i++;
    }

    return { value: result, endPos: i };
  };

  // Helper to read namespace (before |)
  const readNamespace = (startPos: number): { namespace: string | undefined; endPos: number } => {
    let i = startPos;
    let namespace = '';

    // Check for explicit namespace or universal namespace
    if (selector[i] === '*') {
      i++;
      if (selector[i] === '|') {
        return { namespace: '*', endPos: i + 1 };
      }
      // Just a universal selector, not a namespace
      return { namespace: undefined, endPos: startPos };
    }

    // Try to read identifier before |
    while (i < selector.length && isIdentifierChar(selector[i])) {
      namespace += selector[i] ?? '';
      i++;
    }

    if (i < selector.length && selector[i] === '|') {
      return { namespace: namespace || undefined, endPos: i + 1 };
    }

    // No namespace found
    return { namespace: undefined, endPos: startPos };
  };

  while (pos < selector.length) {
    const char = selector[pos];

    // Skip whitespace and check for combinator
    if (char && isWhitespace(char)) {
      pos = skipWhitespace(pos);

      // Check if there's a combinator after whitespace
      const nextChar = selector[pos];
      if (nextChar === '>' || nextChar === '+' || nextChar === '~') {
        // Skip any whitespace after the combinator
        pos = skipWhitespace(pos + 1);
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
      pos = skipWhitespace(pos);
      tokens.push({
        type: 'comma',
        content: ',',
      } as CommaToken);
      continue;
    }

    // Combinator (without leading whitespace)
    if (char === '>' || char === '+' || char === '~') {
      pos++;
      pos = skipWhitespace(pos);
      tokens.push({
        type: 'combinator',
        content: char,
      } as CombinatorToken);
      continue;
    }

    // ID selector
    if (char === '#') {
      pos++;
      const name = readIdentifier(pos);
      pos += name.length;
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
      const name = readIdentifier(pos);
      pos += name.length;
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
      pos = skipWhitespace(pos);

      // Try to read attribute name first, then check for namespace or operator
      let namespace: string | undefined;
      let name = '';

      // Read the first identifier
      const firstIdent = readIdentifier(pos);
      pos += firstIdent.length;

      // Check what comes after the first identifier
      if (selector[pos] === '|' && selector[pos + 1] !== '=') {
        // This is a namespace separator (not the |= operator)
        namespace = firstIdent;
        pos++; // Skip |
        // Now read the actual attribute name
        name = readIdentifier(pos);
        pos += name.length;
      } else {
        // No namespace, the first identifier is the attribute name
        name = firstIdent;
      }

      pos = skipWhitespace(pos);

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

        pos = skipWhitespace(pos);

        // Read value
        if (selector[pos] === '"' || selector[pos] === "'") {
          const quoted = readQuotedString(pos, selector[pos] ?? '');
          value = quoted.value;
          pos = quoted.endPos;
        } else {
          // Unquoted value
          const unquoted = readIdentifier(pos);
          value = unquoted;
          pos += unquoted.length;
        }

        pos = skipWhitespace(pos);

        // Check for case sensitivity flag
        if (
          pos < selector.length &&
          (selector[pos] === 'i' || selector[pos] === 'I' || selector[pos] === 's' || selector[pos] === 'S')
        ) {
          caseSensitive = selector[pos] as 'i' | 'I' | 's' | 'S';
          pos++;
          pos = skipWhitespace(pos);
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
      const name = readIdentifier(pos);
      pos += name.length;

      let argument: string | undefined;

      // Check for argument
      if (selector[pos] === '(') {
        pos++; // Skip (
        const result = readUntil(pos, ')', true);
        argument = result.value;
        pos = result.endPos;
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
      const name = readIdentifier(pos);
      pos += name.length;

      let argument: string | undefined;

      // Check for argument
      if (selector[pos] === '(') {
        pos++; // Skip (
        const result = readUntil(pos, ')', true);
        argument = result.value;
        pos = result.endPos;
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
          const name = readIdentifier(pos);
          pos += name.length;
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
    if (char && isIdentifierChar(char)) {
      const typeStart = pos;

      // Check for namespace
      const nsResult = readNamespace(pos);
      const namespace = nsResult.namespace;

      if (namespace !== undefined) {
        pos = nsResult.endPos;

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
      const name = readIdentifier(pos);
      pos += name.length;

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

  return tokens as Tokenize<S>;
}

/**
 * Shared utility functions for tokenizing CSS selectors and at-rules.
 * These functions provide consistent character classification and string reading
 * across different tokenizers while maintaining their specific behavioral requirements.
 */

// ============================================================================
// Character Classification Functions
// ============================================================================

/**
 * Check if character is whitespace
 */
export function isWhitespace(char: string | undefined): boolean {
  if (!char) return false;
  return char === ' ' || char === '\t' || char === '\n' || char === '\r';
}

/**
 * Check if character is a digit (0-9)
 */
export function isDigit(char: string | undefined): boolean {
  if (!char) return false;
  return char >= '0' && char <= '9';
}

/**
 * Check if character can start an identifier
 */
export function isIdentifierStart(char: string | undefined): boolean {
  if (!char) return false;
  return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '-' || char === '_';
}

/**
 * Check if character can be in an identifier
 * @param char - The character to check
 * @param allowNonAscii - Whether to allow non-ASCII characters (needed for CSS selectors)
 */
export function isIdentifierChar(char: string | undefined, allowNonAscii = false): boolean {
  if (!char) return false;

  const isBasicIdentChar =
    (char >= 'a' && char <= 'z') ||
    (char >= 'A' && char <= 'Z') ||
    (char >= '0' && char <= '9') ||
    char === '-' ||
    char === '_';

  if (isBasicIdentChar) return true;

  // Allow non-ASCII characters for CSS selectors (e.g., unicode in class names)
  if (allowNonAscii && char.charCodeAt(0) > 127) {
    return true;
  }

  return false;
}

// ============================================================================
// Position-Based String Readers
// ============================================================================

/**
 * Skip whitespace and return the new position
 */
export function skipWhitespace(input: string, startPos: number): number {
  let pos = startPos;
  while (pos < input.length && isWhitespace(input[pos])) {
    pos++;
  }
  return pos;
}

/**
 * Read an identifier starting at the given position
 * @param input - The input string
 * @param startPos - The starting position
 * @param allowNonAscii - Whether to allow non-ASCII characters
 * @returns Object with the identifier value and the ending position
 */
export function readIdentifier(
  input: string,
  startPos: number,
  allowNonAscii = false,
): { value: string; endPos: number } {
  let pos = startPos;
  let value = '';

  while (pos < input.length && isIdentifierChar(input[pos], allowNonAscii)) {
    value += input[pos] ?? '';
    pos++;
  }

  return { value, endPos: pos };
}

/**
 * Read a quoted string (with quote character)
 * @param input - The input string
 * @param startPos - The starting position (at the opening quote)
 * @param quote - The quote character (" or ')
 * @returns Object with the full quoted string (including quotes) and ending position
 */
export function readQuotedString(input: string, startPos: number, quote: string): { value: string; endPos: number } {
  let value = quote;
  let pos = startPos + 1; // Skip opening quote
  let escaped = false;

  while (pos < input.length) {
    const char = input[pos] ?? '';
    value += char;

    if (escaped) {
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === quote) {
      return { value, endPos: pos + 1 };
    }

    pos++;
  }

  return { value, endPos: pos };
}

/**
 * Read a number (integer or float) starting at the given position
 * @param input - The input string
 * @param startPos - The starting position
 * @returns Object with numeric value, whether it has a decimal point, and ending position
 */
export function readNumber(input: string, startPos: number): { value: number; hasDecimal: boolean; endPos: number } {
  let pos = startPos;
  let hasDecimal = false;

  // Handle negative or positive sign
  if (input[pos] === '-' || input[pos] === '+') {
    pos++;
  }

  // Read digits before decimal
  while (pos < input.length && isDigit(input[pos])) {
    pos++;
  }

  // Handle decimal point
  if (pos < input.length && input[pos] === '.' && pos + 1 < input.length && isDigit(input[pos + 1])) {
    hasDecimal = true;
    pos++; // Skip .
    while (pos < input.length && isDigit(input[pos])) {
      pos++;
    }
  }

  const numStr = input.slice(startPos, pos);
  const value = parseFloat(numStr);

  return { value, hasDecimal, endPos: pos };
}

/**
 * Read until a specific character is found (with optional nesting support for parentheses)
 * @param input - The input string
 * @param startPos - The starting position
 * @param endChar - The character to stop at (typically ')' or ']')
 * @param supportNesting - Whether to track nested parentheses
 * @returns Object with the content (not including endChar) and ending position (at endChar)
 */
export function readUntil(
  input: string,
  startPos: number,
  endChar: string,
  supportNesting = false,
): { value: string; endPos: number } {
  let value = '';
  let pos = startPos;
  let depth = supportNesting ? 1 : 0;
  let escaped = false;
  let inString: string | null = null;

  while (pos < input.length) {
    const char = input[pos] ?? '';

    // Handle characters inside quoted strings differently
    if (inString) {
      value += char;
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === inString) {
        inString = null;
      }
    } else {
      // Not in a string
      if (char === '"' || char === "'") {
        inString = char;
        value += char;
      } else if (supportNesting && char === '(') {
        depth++;
        value += char;
      } else if (supportNesting && char === ')') {
        depth--;
        if (depth === 0) {
          return { value, endPos: pos };
        }
        value += char;
      } else if (!supportNesting && char === endChar) {
        return { value, endPos: pos };
      } else {
        value += char;
      }
    }

    pos++;
  }

  return { value, endPos: pos };
}

/**
 * Read until a closing parenthesis (with nesting support)
 * This is a convenience wrapper around readUntil for reading function arguments
 * @param input - The input string
 * @param startPos - The starting position (after the opening '(')
 * @returns Object with the content between parentheses and ending position (at ')')
 */
export function readUntilCloseParen(input: string, startPos: number): { value: string; endPos: number } {
  return readUntil(input, startPos, ')', true);
}

/**
 * Read a namespace prefix (everything before |)
 * Returns undefined if no namespace is found
 * @param input - The input string
 * @param startPos - The starting position
 * @returns Object with optional namespace and ending position (after |) or original position
 */
export function readNamespace(input: string, startPos: number): { namespace: string | undefined; endPos: number } {
  let pos = startPos;

  // Check for explicit universal namespace (*|)
  if (input[pos] === '*' && input[pos + 1] === '|') {
    return { namespace: '*', endPos: pos + 2 };
  }

  // Try to read identifier before |
  let namespace = '';
  while (pos < input.length && isIdentifierChar(input[pos], true)) {
    namespace += input[pos] ?? '';
    pos++;
  }

  // Check if followed by | (but not |= operator)
  if (pos < input.length && input[pos] === '|' && input[pos + 1] !== '=') {
    return { namespace: namespace || undefined, endPos: pos + 1 };
  }

  // No namespace found
  return { namespace: undefined, endPos: startPos };
}

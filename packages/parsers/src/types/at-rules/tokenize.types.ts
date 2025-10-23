/**
 * Type-level tokenizer for CSS at-rules
 * This file will contain the TypeScript type-level implementation
 * that mirrors the runtime tokenizer logic
 */

// Placeholder - will be implemented similarly to selector tokenizer
import type { Token } from '#types';

/**
 * Type-level CSS at-rule tokenizer.
 * Mirrors the runtime implementation but works at compile-time.
 */

// ============================================================================
// Helper Types - Character Classification
// ============================================================================

type Whitespace = ' ' | '\t' | '\n' | '\r';

type IsWhitespace<C extends string> = C extends Whitespace ? true : false;

type LowercaseLetter =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';

type UppercaseLetter =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z';

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type IsDigit<C extends string> = C extends Digit ? true : false;

type IsIdentifierStart<C extends string> = C extends LowercaseLetter | UppercaseLetter | '-' | '_' ? true : false;

type IsIdentifierChar<C extends string> = C extends LowercaseLetter | UppercaseLetter | Digit | '-' | '_'
  ? true
  : false;

// ============================================================================
// Helper Types - String Operations
// ============================================================================

/**
 * Skip whitespace characters from the beginning of a string
 */
type SkipWhitespace<S extends string> = S extends `${infer Char}${infer Rest}`
  ? IsWhitespace<Char> extends true
    ? SkipWhitespace<Rest>
    : S
  : S;

/**
 * Read an identifier from the beginning of a string
 */
type ReadIdentifier<S extends string, Acc extends string = ''> = S extends `${infer Char}${infer Rest}`
  ? IsIdentifierChar<Char> extends true
    ? ReadIdentifier<Rest, `${Acc}${Char}`>
    : { identifier: Acc; rest: S }
  : { identifier: Acc; rest: S };

/**
 * Read until closing parenthesis (with nesting support)
 */
type ReadUntilCloseParen<S extends string, Acc extends string = '', Depth extends number = 1> = S extends ''
  ? { value: Acc; rest: '' }
  : S extends `${infer Char}${infer Rest}`
    ? Char extends ')'
      ? Depth extends 1
        ? { value: Acc; rest: Rest }
        : ReadUntilCloseParen<Rest, `${Acc}${Char}`, SubtractOne<Depth>>
      : Char extends '('
        ? ReadUntilCloseParen<Rest, `${Acc}${Char}`, AddOne<Depth>>
        : ReadUntilCloseParen<Rest, `${Acc}${Char}`, Depth>
    : { value: Acc; rest: '' };

/**
 * Read a quoted string
 */
type ReadQuoted<
  S extends string,
  Quote extends string,
  Acc extends string = '',
> = S extends `\\${infer Escaped}${infer Rest}`
  ? ReadQuoted<Rest, Quote, `${Acc}\\${Escaped}`>
  : S extends `${Quote}${infer Rest}`
    ? { value: `${Acc}${Quote}`; rest: Rest }
    : S extends `${infer Char}${infer Rest}`
      ? ReadQuoted<Rest, Quote, `${Acc}${Char}`>
      : { value: Acc; rest: S };

// ============================================================================
// Helper Types - Number Operations
// ============================================================================

type AddOne<N extends number> = N extends 0
  ? 1
  : N extends 1
    ? 2
    : N extends 2
      ? 3
      : N extends 3
        ? 4
        : N extends 4
          ? 5
          : 5; // Max depth

type SubtractOne<N extends number> = N extends 5
  ? 4
  : N extends 4
    ? 3
    : N extends 3
      ? 2
      : N extends 2
        ? 1
        : N extends 1
          ? 0
          : 0;

// ============================================================================
// Token Parsers
// ============================================================================

/**
 * Parse an @-rule name
 */
type ParseAtRuleName<S extends string> = S extends `@${infer Rest}`
  ? ReadIdentifier<Rest> extends { identifier: infer Name extends string; rest: infer R extends string }
    ? { token: { type: 'at-rule-name'; name: Name; content: `@${Name}` }; rest: R }
    : never
  : never;

/**
 * Parse a quoted string token
 */
type ParseString<S extends string> = S extends `"${infer _}`
  ? ReadQuoted<S extends `"${infer Rest}` ? Rest : '', '"'> extends {
      value: infer Value extends string;
      rest: infer R extends string;
    }
    ? { token: { type: 'string'; value: `"${Value}`; content: `"${Value}` }; rest: R }
    : never
  : S extends `'${infer _}`
    ? ReadQuoted<S extends `'${infer Rest}` ? Rest : '', "'"> extends {
        value: infer Value extends string;
        rest: infer R extends string;
      }
      ? { token: { type: 'string'; value: `'${Value}`; content: `'${Value}` }; rest: R }
      : never
    : never;

/**
 * Parse a hash/color token
 */
type ParseHash<S extends string> = S extends `#${infer Rest}`
  ? Rest extends `${infer Char}${infer _}`
    ? IsIdentifierChar<Char> extends true
      ? ReadIdentifier<Rest> extends { identifier: infer Value extends string; rest: infer R extends string }
        ? { token: { type: 'hash'; value: Value; content: `#${Value}` }; rest: R }
        : never
      : never
    : never
  : never;

/**
 * Parse number-like values (numbers, dimensions, percentages)
 * Simplified: We just capture the whole value as a string and call it a 'value' token
 * This makes the type-level implementation much simpler and more maintainable
 */
type ReadValueChars<S extends string, Acc extends string = ''> = S extends `${infer Char}${infer Rest}`
  ? Char extends Digit | '.' | '-' | '+' | '%'
    ? ReadValueChars<Rest, `${Acc}${Char}`>
    : Char extends LowercaseLetter | UppercaseLetter
      ? // Part of a unit like 'px', 'em', etc.
        ReadValueChars<Rest, `${Acc}${Char}`>
      : { value: Acc; rest: S }
  : { value: Acc; rest: S };

type ParseValue<S extends string> =
  ReadValueChars<S> extends {
    value: infer Val extends string;
    rest: infer R extends string;
  }
    ? { token: { type: 'value'; value: Val; content: Val }; rest: R }
    : never;

/**
 * Parse identifier or function or operator
 */
type ParseIdentifier<S extends string> =
  ReadIdentifier<S> extends {
    identifier: infer Name extends string;
    rest: infer R extends string;
  }
    ? // Check if it's a logical operator (and, or, not)
      Name extends 'and' | 'or' | 'not'
      ? { token: { type: 'operator'; operator: Name; content: Name }; rest: R }
      : // Check if followed by parenthesis (function)
        SkipWhitespace<R> extends `(${infer AfterParen}`
        ? ReadUntilCloseParen<AfterParen> extends { value: infer Arg extends string; rest: infer R2 extends string }
          ? Name extends 'url'
            ? { token: { type: 'url'; value: Arg; content: `${Name}(${Arg})` }; rest: R2 }
            : { token: { type: 'function'; name: Name; argument: Arg; content: `${Name}(${Arg})` }; rest: R2 }
          : never
        : // Regular identifier
          { token: { type: 'identifier'; value: Name; content: Name }; rest: R }
    : never;

/**
 * Parse comparison operators (>=, <=, =, >, <)
 */
type ParseOperator<S extends string> = S extends `>=${infer Rest}`
  ? { token: { type: 'operator'; operator: '>='; content: '>=' }; rest: Rest }
  : S extends `<=${infer Rest}`
    ? { token: { type: 'operator'; operator: '<='; content: '<=' }; rest: Rest }
    : S extends `>${infer Rest}`
      ? { token: { type: 'operator'; operator: '>'; content: '>' }; rest: Rest }
      : S extends `<${infer Rest}`
        ? { token: { type: 'operator'; operator: '<'; content: '<' }; rest: Rest }
        : S extends `=${infer Rest}`
          ? { token: { type: 'operator'; operator: '='; content: '=' }; rest: Rest }
          : never;

/**
 * Parse delimiter tokens
 */
type ParseDelimiter<S extends string, Delim extends string> = S extends `${Delim}${infer Rest}`
  ? { token: { type: 'delimiter'; delimiter: Delim; content: Delim }; rest: Rest }
  : never;

// ============================================================================
// Main Tokenizer
// ============================================================================

/**
 * Main tokenizer implementation
 */
type TokenizeImpl<S extends string, Tokens extends Token[] = []> = S extends ''
  ? Tokens
  : S extends `${infer Char}${infer Rest}`
    ? // Skip whitespace
      IsWhitespace<Char> extends true
      ? TokenizeImpl<SkipWhitespace<Rest>, Tokens>
      : // Handle @-rule name
        Char extends '@'
        ? ParseAtRuleName<S> extends { token: infer T extends Token; rest: infer R extends string }
          ? TokenizeImpl<R, [...Tokens, T]>
          : TokenizeImpl<Rest, Tokens>
        : // Handle strings
          Char extends '"' | "'"
          ? ParseString<S> extends { token: infer T extends Token; rest: infer R extends string }
            ? TokenizeImpl<R, [...Tokens, T]>
            : TokenizeImpl<Rest, Tokens>
          : // Handle hash/color
            Char extends '#'
            ? ParseHash<S> extends { token: infer T extends Token; rest: infer R extends string }
              ? TokenizeImpl<R, [...Tokens, T]>
              : TokenizeImpl<Rest, Tokens>
            : // Handle numbers and values
              IsDigit<Char> extends true
              ? ParseValue<S> extends { token: infer T extends Token; rest: infer R extends string }
                ? TokenizeImpl<R, [...Tokens, T]>
                : TokenizeImpl<Rest, Tokens>
              : // Handle negative/positive numbers
                Char extends '-' | '+' | '.'
                ? S extends `${Char}${infer NextChar}${infer _}`
                  ? IsDigit<NextChar> extends true
                    ? ParseValue<S> extends { token: infer T extends Token; rest: infer R extends string }
                      ? TokenizeImpl<R, [...Tokens, T]>
                      : TokenizeImpl<Rest, Tokens>
                    : // Fall through to identifier/operator handling
                      IsIdentifierStart<Char> extends true
                      ? ParseIdentifier<S> extends { token: infer T extends Token; rest: infer R extends string }
                        ? TokenizeImpl<R, [...Tokens, T]>
                        : TokenizeImpl<Rest, Tokens>
                      : TokenizeImpl<Rest, Tokens>
                  : TokenizeImpl<Rest, Tokens>
                : // Handle identifiers and functions
                  IsIdentifierStart<Char> extends true
                  ? ParseIdentifier<S> extends { token: infer T extends Token; rest: infer R extends string }
                    ? TokenizeImpl<R, [...Tokens, T]>
                    : TokenizeImpl<Rest, Tokens>
                  : // Handle comparison operators
                    Char extends '>' | '<' | '='
                    ? ParseOperator<S> extends { token: infer T extends Token; rest: infer R extends string }
                      ? TokenizeImpl<R, [...Tokens, T]>
                      : TokenizeImpl<Rest, Tokens>
                    : // Handle delimiters
                      Char extends '(' | ')' | ',' | ':' | '/'
                      ? ParseDelimiter<S, Char> extends { token: infer T extends Token; rest: infer R extends string }
                        ? TokenizeImpl<R, [...Tokens, T]>
                        : TokenizeImpl<Rest, Tokens>
                      : // Unknown character, skip it
                        TokenizeImpl<Rest, Tokens>
    : Tokens;

/**
 * Public tokenizer type
 */
export type TokenizeAtRule<S extends string> = TokenizeImpl<S>;

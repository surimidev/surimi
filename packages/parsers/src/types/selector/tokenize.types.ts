import type { Token } from '#types';

/**
 * Type-level CSS selector tokenizer.
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
 * Read until a specific character (simple version without nesting support)
 */
type ReadUntil<
  S extends string,
  EndChar extends string,
  Acc extends string = '',
  Depth extends number = 0,
> = S extends `${infer Char}${infer Rest}`
  ? Char extends EndChar
    ? Depth extends 0
      ? { value: Acc; rest: Rest }
      : ReadUntil<Rest, EndChar, `${Acc}${Char}`, SubtractOne<Depth>>
    : Char extends '('
      ? ReadUntil<Rest, EndChar, `${Acc}${Char}`, AddOne<Depth>>
      : Char extends ')'
        ? Depth extends 0
          ? { value: Acc; rest: S }
          : ReadUntil<Rest, EndChar, `${Acc}${Char}`, SubtractOne<Depth>>
        : ReadUntil<Rest, EndChar, `${Acc}${Char}`, Depth>
  : { value: Acc; rest: S };

/**
 * Read a quoted string (simple version)
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
// Helper Types - Number Operations (for parenthesis depth tracking)
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
 * Parse an ID selector (#id)
 */
type ParseId<S extends string> = S extends `#${infer Rest}`
  ? ReadIdentifier<Rest> extends { identifier: infer Name extends string; rest: infer R extends string }
    ? { token: { type: 'id'; name: Name; content: `#${Name}` }; rest: R }
    : never
  : never;

/**
 * Parse a class selector (.class)
 */
type ParseClass<S extends string> = S extends `.${infer Rest}`
  ? ReadIdentifier<Rest> extends { identifier: infer Name extends string; rest: infer R extends string }
    ? { token: { type: 'class'; name: Name; content: `.${Name}` }; rest: R }
    : never
  : never;

/**
 * Parse a pseudo-element (::element)
 */
type ParsePseudoElement<S extends string> = S extends `::${infer Rest}`
  ? ReadIdentifier<Rest> extends { identifier: infer Name extends string; rest: infer R extends string }
    ? R extends `(${infer _}`
      ? ReadUntil<Substring<R, 1>, ')'> extends { value: infer Arg extends string; rest: infer R2 extends string }
        ? { token: { type: 'pseudo-element'; name: Name; argument: Arg; content: `::${Name}(${Arg})` }; rest: R2 }
        : { token: { type: 'pseudo-element'; name: Name; content: `::${Name}` }; rest: R }
      : { token: { type: 'pseudo-element'; name: Name; content: `::${Name}` }; rest: R }
    : never
  : never;

/**
 * Parse a pseudo-class (:class)
 */
type ParsePseudoClass<S extends string> = S extends `:${infer Rest}`
  ? Rest extends `:${infer _}`
    ? never // This is a pseudo-element, not pseudo-class
    : ReadIdentifier<Rest> extends { identifier: infer Name extends string; rest: infer R extends string }
      ? R extends `(${infer _}`
        ? ReadUntil<Substring<R, 1>, ')'> extends { value: infer Arg extends string; rest: infer R2 extends string }
          ? Arg extends ''
            ? { token: { type: 'pseudo-class'; name: Name; argument: ''; content: `:${Name}()` }; rest: R2 }
            : { token: { type: 'pseudo-class'; name: Name; argument: Arg; content: `:${Name}(${Arg})` }; rest: R2 }
          : { token: { type: 'pseudo-class'; name: Name; content: `:${Name}` }; rest: R }
        : { token: { type: 'pseudo-class'; name: Name; content: `:${Name}` }; rest: R }
      : never
  : never;

/**
 * Get substring starting from position (helper)
 */
type Substring<S extends string, N extends number> = N extends 0
  ? S
  : N extends 1
    ? S extends `${infer _}${infer Rest}`
      ? Rest
      : ''
    : N extends 2
      ? S extends `${infer _}${infer _2}${infer Rest}`
        ? Rest
        : ''
      : S;

/**
 * Parse an attribute selector ([attr])
 */
type ParseAttribute<S extends string> = S extends `[${infer Rest}`
  ? ParseAttributeContent<SkipWhitespace<Rest>, `[`>
  : never;

type ParseAttributeContent<S extends string, Content extends string> =
  // Read first identifier
  ReadIdentifier<S> extends { identifier: infer FirstIdent extends string; rest: infer R extends string }
    ? R extends `|${infer AfterPipe}`
      ? AfterPipe extends `=${infer _}`
        ? // This is the |= operator, not a namespace
          ParseAttributeOperator<SkipWhitespace<R>, `${Content}${FirstIdent}`, undefined, FirstIdent>
        : // This is a namespace separator
          ReadIdentifier<AfterPipe> extends { identifier: infer AttrName extends string; rest: infer R2 extends string }
          ? ParseAttributeOperator<SkipWhitespace<R2>, `${Content}${FirstIdent}|${AttrName}`, FirstIdent, AttrName>
          : never
      : // No namespace
        ParseAttributeOperator<SkipWhitespace<R>, `${Content}${FirstIdent}`, undefined, FirstIdent>
    : never;

type ParseAttributeOperator<
  S extends string,
  Content extends string,
  Namespace extends string | undefined,
  Name extends string,
> = S extends `~=${infer Rest}`
  ? ParseAttributeValue<SkipWhitespace<Rest>, `${Content}~=`, Namespace, Name, '~='>
  : S extends `|=${infer Rest}`
    ? ParseAttributeValue<SkipWhitespace<Rest>, `${Content}|=`, Namespace, Name, '|='>
    : S extends `^=${infer Rest}`
      ? ParseAttributeValue<SkipWhitespace<Rest>, `${Content}^=`, Namespace, Name, '^='>
      : S extends `$=${infer Rest}`
        ? ParseAttributeValue<SkipWhitespace<Rest>, `${Content}$=`, Namespace, Name, '$='>
        : S extends `*=${infer Rest}`
          ? ParseAttributeValue<SkipWhitespace<Rest>, `${Content}*=`, Namespace, Name, '*='>
          : S extends `=${infer Rest}`
            ? ParseAttributeValue<SkipWhitespace<Rest>, `${Content}=`, Namespace, Name, '='>
            : S extends `]${infer Rest}`
              ? {
                  token: Namespace extends string
                    ? { type: 'attribute'; namespace: Namespace; name: Name; content: `${Content}]` }
                    : { type: 'attribute'; name: Name; content: `${Content}]` };
                  rest: Rest;
                }
              : never;

type ParseAttributeValue<
  S extends string,
  Content extends string,
  Namespace extends string | undefined,
  Name extends string,
  Operator extends string,
> = S extends `"${infer _}`
  ? ReadQuoted<Substring<S, 1>, '"'> extends { value: infer Value extends string; rest: infer R extends string }
    ? ParseAttributeClose<SkipWhitespace<R>, `${Content}"${Value}`, Namespace, Name, Operator, `"${Value}`>
    : never
  : S extends `'${infer _}`
    ? ReadQuoted<Substring<S, 1>, "'"> extends { value: infer Value extends string; rest: infer R extends string }
      ? ParseAttributeClose<SkipWhitespace<R>, `${Content}'${Value}`, Namespace, Name, Operator, `'${Value}`>
      : never
    : ReadIdentifier<S> extends { identifier: infer Value extends string; rest: infer R extends string }
      ? ParseAttributeClose<SkipWhitespace<R>, `${Content}${Value}`, Namespace, Name, Operator, Value>
      : never;

type ParseAttributeClose<
  S extends string,
  Content extends string,
  Namespace extends string | undefined,
  Name extends string,
  Operator extends string,
  Value extends string,
> = S extends `${infer Flag extends 'i' | 'I' | 's' | 'S'}${infer Rest}`
  ? SkipWhitespace<Rest> extends `]${infer R}`
    ? {
        token: Namespace extends string
          ? {
              type: 'attribute';
              namespace: Namespace;
              name: Name;
              operator: Operator;
              value: Value;
              caseSensitive: Flag;
              content: `${Content} ${Flag}]`;
            }
          : {
              type: 'attribute';
              name: Name;
              operator: Operator;
              value: Value;
              caseSensitive: Flag;
              content: `${Content} ${Flag}]`;
            };
        rest: R;
      }
    : never
  : S extends `]${infer Rest}`
    ? {
        token: Namespace extends string
          ? {
              type: 'attribute';
              namespace: Namespace;
              name: Name;
              operator: Operator;
              value: Value;
              content: `${Content}]`;
            }
          : { type: 'attribute'; name: Name; operator: Operator; value: Value; content: `${Content}]` };
        rest: Rest;
      }
    : never;

/**
 * Parse a type selector (element)
 */
type ParseType<S extends string> =
  ReadIdentifier<S> extends { identifier: infer FirstIdent extends string; rest: infer R extends string }
    ? R extends `|${infer AfterPipe}`
      ? AfterPipe extends `*${infer R2}`
        ? { token: { type: 'universal'; namespace: FirstIdent; content: `${FirstIdent}|*` }; rest: R2 }
        : ReadIdentifier<AfterPipe> extends { identifier: infer TypeName extends string; rest: infer R2 extends string }
          ? {
              token: { type: 'type'; namespace: FirstIdent; name: TypeName; content: `${FirstIdent}|${TypeName}` };
              rest: R2;
            }
          : never
      : { token: { type: 'type'; name: FirstIdent; content: FirstIdent }; rest: R }
    : never;

/**
 * Parse universal selector (*)
 */
type ParseUniversal<S extends string> = S extends `*|*${infer Rest}`
  ? { token: { type: 'universal'; namespace: '*'; content: '*|*' }; rest: Rest }
  : S extends `*|${infer Rest}`
    ? ReadIdentifier<Rest> extends { identifier: infer Name extends string; rest: infer R extends string }
      ? { token: { type: 'type'; namespace: '*'; name: Name; content: `*|${Name}` }; rest: R }
      : never
    : S extends `*${infer Rest}`
      ? { token: { type: 'universal'; content: '*' }; rest: Rest }
      : never;

// ============================================================================
// Main Tokenizer
// ============================================================================

/**
 * Main tokenizer implementation
 */
export type TokenizeSelector<S extends string, Tokens extends Token[] = []> = S extends ''
  ? Tokens
  : // Handle whitespace and combinators
    S extends `${infer Char}${infer Rest}`
    ? IsWhitespace<Char> extends true
      ? SkipWhitespace<Rest> extends infer AfterWs extends string
        ? AfterWs extends `${infer NextChar}${infer _}`
          ? NextChar extends '>' | '+' | '~'
            ? TokenizeSelector<
                SkipWhitespace<Substring<AfterWs, 1>>,
                [...Tokens, { type: 'combinator'; content: NextChar }]
              >
            : NextChar extends ','
              ? TokenizeSelector<AfterWs, Tokens>
              : AfterWs extends ''
                ? Tokens
                : TokenizeSelector<AfterWs, [...Tokens, { type: 'combinator'; content: ' ' }]>
          : Tokens
        : Tokens
      : // Handle comma
        Char extends ','
        ? TokenizeSelector<SkipWhitespace<Rest>, [...Tokens, { type: 'comma'; content: ',' }]>
        : // Handle combinators without leading whitespace
          Char extends '>' | '+' | '~'
          ? TokenizeSelector<SkipWhitespace<Rest>, [...Tokens, { type: 'combinator'; content: Char }]>
          : // Handle ID
            Char extends '#'
            ? ParseId<S> extends { token: infer T extends Token; rest: infer R extends string }
              ? TokenizeSelector<R, [...Tokens, T]>
              : Tokens
            : // Handle class
              Char extends '.'
              ? ParseClass<S> extends { token: infer T extends Token; rest: infer R extends string }
                ? TokenizeSelector<R, [...Tokens, T]>
                : Tokens
              : // Handle attribute
                Char extends '['
                ? ParseAttribute<S> extends { token: infer T extends Token; rest: infer R extends string }
                  ? TokenizeSelector<R, [...Tokens, T]>
                  : Tokens
                : // Handle pseudo-element or pseudo-class
                  Char extends ':'
                  ? S extends `::${infer _}`
                    ? ParsePseudoElement<S> extends { token: infer T extends Token; rest: infer R extends string }
                      ? TokenizeSelector<R, [...Tokens, T]>
                      : Tokens
                    : ParsePseudoClass<S> extends { token: infer T extends Token; rest: infer R extends string }
                      ? TokenizeSelector<R, [...Tokens, T]>
                      : Tokens
                  : // Handle universal or type with namespace
                    Char extends '*'
                    ? ParseUniversal<S> extends { token: infer T extends Token; rest: infer R extends string }
                      ? TokenizeSelector<R, [...Tokens, T]>
                      : Tokens
                    : // Handle type selector
                      IsIdentifierStart<Char> extends true
                      ? ParseType<S> extends { token: infer T extends Token; rest: infer R extends string }
                        ? TokenizeSelector<R, [...Tokens, T]>
                        : Tokens
                      : // Unknown character, skip it
                        TokenizeSelector<Rest, Tokens>
    : Tokens;

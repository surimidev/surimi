import type { StringifyAtRule, TokenizeAtRule } from './at-rules';
import type { StringifySelector, TokenizeSelector } from './selector';
import type { Token } from './tokens.types';

export * from './tokens.types';
export * from './utils.types';
export * from './selector/index';
export * from './at-rules/index';

/**
 * Helper to tokenize either selector or at-rule tokens.
 * Uses the first token's type to determine which tokenizer to use.
 */
export type Stringify<T extends Token[]> = T extends [infer First extends Token, ...infer _Rest]
  ? First['type'] extends 'at-rule-name'
    ? StringifyAtRule<T>
    : StringifySelector<T>
  : '';

export type Tokenize<S extends string> = S extends `@${string}` ? TokenizeAtRule<S> : TokenizeSelector<S>;

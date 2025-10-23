import type { Stringify, Token, Tokenize } from '#types';

import { stringifyAtRule } from './at-rules/stringify';
import { tokenizeAtRule } from './at-rules/tokenize';
import { stringifySelector } from './selectors/stringify';
import { tokenizeSelector } from './selectors/tokenize';

export { tokenizeSelector } from './selectors/tokenize';
export { stringifySelector } from './selectors/stringify';

export { tokenizeAtRule } from './at-rules/tokenize';
export { stringifyAtRule } from './at-rules/stringify';

export function stringify<T extends Token[]>(tokens: T): Stringify<T> {
  const isAtRule = tokens.length > 0 && tokens[0]?.type === 'at-rule-name';

  if (isAtRule) {
    // TODO: remove need for type cast
    return stringifyAtRule(tokens) as never;
  } else {
    return stringifySelector(tokens) as Stringify<T>;
  }
}

export function tokenize<S extends string>(input: S): Tokenize<S> {
  const isAtRule = input.trimStart().startsWith('@');

  if (isAtRule) {
    return tokenizeAtRule(input) as Tokenize<S>;
  } else {
    return tokenizeSelector(input) as Tokenize<S>;
  }
}

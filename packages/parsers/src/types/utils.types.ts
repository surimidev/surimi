import type { Token } from './tokens.types';

export type GetFirstToken<TTokens extends Token[]> = TTokens extends [infer First extends Token, ...infer _Rest]
  ? First
  : never;

export type GetLastToken<TTokens extends Token[]> = TTokens extends [...infer _Rest, infer Last extends Token]
  ? Last
  : never;

export type OmitLastToken<TTokens extends Token[]> = TTokens extends [
  ...infer Rest extends Token[],
  infer _Last extends Token,
]
  ? Rest
  : [];

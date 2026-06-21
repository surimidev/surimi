import type { CustomPropertyBuilder } from '@surimi/core';

export type VarToken = CustomPropertyBuilder;

export type VarLeafMeta = {
  syntax?: string | undefined;
  inherits?: boolean | undefined;
};

export type TokenSlot = Record<string, never>;

/**
 * Contract-only leaf marker. Use `null` (or optional `token` constant) for a plain slot,
 * or `{ syntax?, inherits? }` for meta.
 */
export type ContractLeaf = VarLeafMeta | TokenSlot | null;

type ContractMetaKey = 'syntax' | 'inherits';

type IsContractLeafType<T> = T extends null | TokenSlot
  ? true
  : T extends Record<string, unknown>
    ? [Exclude<keyof T, ContractMetaKey>] extends [never]
      ? true
      : false
    : false;

export type VarsFromShape<T> = IsContractLeafType<T> extends true
  ? VarToken
  : T extends Record<string, unknown>
    ? { [K in keyof T]: VarsFromShape<T[K]> }
    : never;

export type ModeName<TModes extends Record<string, unknown>> = Extract<keyof TModes, string>;

export type ThemeTokenLeaf<Modes extends string> = {
  [K in Modes]?: string | number;
} & VarLeafMeta;

type ThemeLeafKey<Modes extends string> = Modes | ContractMetaKey;

type IsThemeTokenLeaf<T, Modes extends string> = T extends Record<string, unknown>
  ? [Exclude<keyof T, ThemeLeafKey<Modes>>] extends [never]
    ? [keyof T] extends [never]
      ? false
      : true
    : false
  : false;

export type ThemeVarsFromTokens<T, Modes extends string> = IsThemeTokenLeaf<T, Modes> extends true
  ? VarToken
  : T extends Record<string, unknown>
    ? { [K in keyof T]: ThemeVarsFromTokens<T[K], Modes> }
    : never;

export type ThemeShapeFromTokens<T, Modes extends string> = IsThemeTokenLeaf<T, Modes> extends true
  ? ContractLeaf
  : T extends Record<string, unknown>
    ? { [K in keyof T]: ThemeShapeFromTokens<T[K], Modes> }
    : never;

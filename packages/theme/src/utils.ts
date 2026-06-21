export const RESERVED_VAR_META_KEYS = new Set(['syntax', 'inherits']);

import type { VarLeafMeta } from '#types';

export type { VarLeafMeta } from '#types';

export function buildVarName(prefix: string, path: string[]): string {
  const parts = prefix ? [prefix, ...path] : path;
  return `--${parts.join('-')}`;
}

export function isContractLeaf(value: unknown): value is null | VarLeafMeta | Record<string, never> {
  if (value === null) {
    return true;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  return Object.keys(value).every(key => RESERVED_VAR_META_KEYS.has(key));
}

export function extractVarLeafMeta(value: null | VarLeafMeta | Record<string, unknown>): VarLeafMeta {
  if (value === null || Object.keys(value).length === 0) {
    return {};
  }

  const meta: VarLeafMeta = {};

  if (typeof value.syntax === 'string') {
    meta.syntax = value.syntax;
  }

  if (typeof value.inherits === 'boolean') {
    meta.inherits = value.inherits;
  }

  return meta;
}

export function isThemeValueLeaf(node: Record<string, unknown>, modeNames: ReadonlySet<string>): boolean {
  const keys = Object.keys(node);

  if (keys.length === 0) {
    return false;
  }

  return keys.every(key => modeNames.has(key) || RESERVED_VAR_META_KEYS.has(key));
}

export function getValueAtPath(values: Record<string, unknown> | undefined, path: string[]): unknown {
  let current: unknown = values;

  for (const segment of path) {
    if (typeof current !== 'object' || current === null || Array.isArray(current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

import { type AssignVarsTarget, assignVars } from '#assign-vars';
import { defineVars } from '#define-vars';
import type { ModeName, ThemeVarsFromTokens } from '#types';
import { extractVarLeafMeta, isThemeValueLeaf } from '#utils';

export interface CreateThemeOptions<
  TModes extends Record<string, AssignVarsTarget | AssignVarsTarget[]>,
  TTokens extends Record<string, unknown>,
> {
  prefix?: string;
  modes: TModes;
  tokens: TTokens;
  registerProperties?: boolean;
}

function deriveShapeFromTokens(
  tokens: Record<string, unknown>,
  modeNames: ReadonlySet<string>,
): Record<string, unknown> {
  const shape: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(tokens)) {
    if (typeof value !== 'object' || value === null) {
      continue;
    }

    const node = value as Record<string, unknown>;

    if (isThemeValueLeaf(node, modeNames)) {
      const meta = extractVarLeafMeta(node);
      shape[key] = Object.keys(meta).length > 0 ? meta : null;
      continue;
    }

    shape[key] = deriveShapeFromTokens(node, modeNames);
  }

  return shape;
}

function sliceModeValues(
  tokens: Record<string, unknown>,
  modeNames: ReadonlySet<string>,
  mode: string,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(tokens)) {
    if (typeof value !== 'object' || value === null) {
      continue;
    }

    const node = value as Record<string, unknown>;

    if (isThemeValueLeaf(node, modeNames)) {
      if (mode in node) {
        result[key] = node[mode];
      }

      continue;
    }

    const nested = sliceModeValues(node, modeNames, mode);

    if (Object.keys(nested).length > 0) {
      result[key] = nested;
    }
  }

  return result;
}

function normalizeTargets(target: AssignVarsTarget | AssignVarsTarget[]): AssignVarsTarget[] {
  return Array.isArray(target) ? target : [target];
}

/**
 * Define tokens with per-mode values and emit CSS in one step.
 * Registers each token once (`@property` when `registerProperties` is true), then assigns
 * values per mode to the configured targets (selectors, attributes, media queries, …).
 *
 * @example
 * ```ts
 * const theme = createTheme({
 *   modes: {
 *     light: ':root',
 *     dark: '[data-theme="dark"]',
 *   },
 *   tokens: {
 *     bg: { app: { light: '#fff', dark: '#111', syntax: '<color>' } },
 *   },
 * });
 *
 * select('body').style({ background: theme.bg.app });
 * ```
 */
export function createTheme<
  const TModes extends Record<string, AssignVarsTarget | AssignVarsTarget[]>,
  const TTokens extends Record<string, unknown>,
>(
  options: CreateThemeOptions<TModes, TTokens>,
): ThemeVarsFromTokens<TTokens, ModeName<TModes>> {
  const { prefix = '', modes, tokens, registerProperties = true } = options;
  const modeNames = Object.keys(modes);
  const modeNameSet = new Set(modeNames);
  const baseMode = modeNames[0];

  if (!baseMode) {
    throw new Error('createTheme requires at least one mode');
  }

  const shape = deriveShapeFromTokens(tokens, modeNameSet);

  const vars = defineVars(shape, {
    prefix,
    registerProperties,
    initialValues: sliceModeValues(tokens, modeNameSet, baseMode),
  }) as ThemeVarsFromTokens<TTokens, ModeName<TModes>>;

  for (const mode of modeNames) {
    const values = sliceModeValues(tokens, modeNameSet, mode);
    const targets = normalizeTargets(modes[mode] as AssignVarsTarget | AssignVarsTarget[]);

    for (const target of targets) {
      assignVars(vars as Record<string, unknown>, target, values);
    }
  }

  return vars;
}

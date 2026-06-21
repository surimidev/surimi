import type { SurimiBase } from '@surimi/common';
import { SurimiContext } from '@surimi/common';
import { CustomPropertyBuilder, createSelectorBuilderFromString } from '@surimi/core';

interface SetVarsTarget {
  setVars(vars: Record<PropertyKey, string | number | SurimiBase>): unknown;
}

interface SelectableTarget {
  select(selector: string): SetVarsTarget;
}

export type AssignVarsTarget = string | SetVarsTarget | SelectableTarget;

function isSetVarsTarget(target: unknown): target is SetVarsTarget {
  return (
    typeof target === 'object' &&
    target !== null &&
    'setVars' in target &&
    typeof (target as SetVarsTarget).setVars === 'function'
  );
}

function isSelectableTarget(target: unknown): target is SelectableTarget {
  return (
    typeof target === 'object' &&
    target !== null &&
    'select' in target &&
    typeof (target as SelectableTarget).select === 'function' &&
    !isSetVarsTarget(target)
  );
}

export function resolveStyleTarget(target: AssignVarsTarget): SetVarsTarget {
  if (typeof target === 'string') {
    return createSelectorBuilderFromString([target], SurimiContext.root, SurimiContext.root);
  }

  if (isSetVarsTarget(target)) {
    return target;
  }

  if (isSelectableTarget(target)) {
    return target.select(':root');
  }

  throw new Error('Invalid style target for assignVars');
}

function flattenVarAssignments(
  vars: Record<string, unknown>,
  values: Record<string, unknown>,
  acc: [CustomPropertyBuilder, string | number][] = [],
): [CustomPropertyBuilder, string | number][] {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) {
      continue;
    }

    const varRef = vars[key];

    if (varRef instanceof CustomPropertyBuilder) {
      if (typeof value === 'string' || typeof value === 'number') {
        acc.push([varRef, value]);
      } else {
        acc.push([varRef, String(value)]);
      }

      continue;
    }

    if (typeof varRef === 'object' && varRef !== null && typeof value === 'object' && value !== null) {
      flattenVarAssignments(varRef as Record<string, unknown>, value as Record<string, unknown>, acc);
    }
  }

  return acc;
}

/**
 * Assign concrete values to tokens from `defineVars` / `createTheme` on a CSS target.
 * Target may be a selector string, a selector builder, or an at-rule builder (defaults to `:root`).
 * Values mirror the vars tree; partial trees are allowed.
 *
 * @example
 * ```ts
 * assignVars(vars, ':root', { bg: { app: '#fff' } });
 * assignVars(vars, media().prefersColorScheme('dark'), { bg: { app: '#111' } });
 * ```
 */
export function assignVars(
  vars: Record<string, unknown>,
  target: AssignVarsTarget,
  values: Record<string, unknown>,
): void {
  const resolved = resolveStyleTarget(target);
  const pairs = flattenVarAssignments(vars, values);
  resolved.setVars(Object.fromEntries(pairs));
}

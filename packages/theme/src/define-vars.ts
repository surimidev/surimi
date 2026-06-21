import { SurimiContext } from '@surimi/common';
import { CustomPropertyBuilder } from '@surimi/core';

import type { VarLeafMeta, VarsFromShape, VarToken } from '#types';
import { buildVarName, extractVarLeafMeta, getValueAtPath, isContractLeaf } from '#utils';

/** Optional plain contract leaf. Equivalent to `null`; avoids bare `{}`, which TypeScript widens. */
export const token = {} satisfies Record<string, never>;

export interface DefineVarsOptions {
  prefix?: string;
  registerProperties?: boolean;
  initialValues?: Record<string, unknown>;
}

function createVarToken(name: string, meta: VarLeafMeta, registerProperties: boolean, initialValue: unknown): VarToken {
  const syntax = meta.syntax ?? '*';

  if (registerProperties && syntax !== '*' && initialValue === undefined) {
    throw new Error(
      `@property ${name} requires an initial value when syntax is '${syntax}'. Pass initialValues to defineVars, use createTheme with mode values, or set registerProperties: false.`,
    );
  }

  const options: {
    syntax: string;
    inherits: boolean;
    initialValue?: string;
    register: boolean;
  } = {
    syntax,
    inherits: meta.inherits ?? true,
    register: registerProperties,
  };

  if (initialValue !== undefined) {
    options.initialValue = String(initialValue);
  }

  return new CustomPropertyBuilder(SurimiContext.root, name, options);
}

function buildVarsFromShape<TShape extends Record<string, unknown>>(
  shape: TShape,
  path: string[],
  options: Required<Pick<DefineVarsOptions, 'prefix' | 'registerProperties'>> &
    Pick<DefineVarsOptions, 'initialValues'>,
): VarsFromShape<TShape> {
  const refs = {} as VarsFromShape<TShape>;

  for (const [key, value] of Object.entries(shape)) {
    const nextPath = [...path, key];

    if (isContractLeaf(value)) {
      const meta = extractVarLeafMeta(value);
      const name = buildVarName(options.prefix, nextPath);
      const initialValue = getValueAtPath(options.initialValues, nextPath);

      (refs as Record<string, unknown>)[key] = createVarToken(name, meta, options.registerProperties, initialValue);
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      (refs as Record<string, unknown>)[key] = buildVarsFromShape(value as Record<string, unknown>, nextPath, options);
    }
  }

  return refs;
}

/**
 * Declare a token contract: nested shape of `null` leaves (optionally with `{ syntax?, inherits? }`).
 * Returns typed `var(--…)` refs; emits `@property` rules when `registerProperties` is true (default).
 * Typed syntax (anything other than `*`) requires an initial value at registration time — use
 * `initialValues`, `createTheme`, or `assignVars` after disabling registration.
 *
 * @example
 * ```ts
 * import { defineVars, assignVars } from 'surimi/theme';
 *
 * const vars = defineVars({
 *   bg: { app: null },
 *   text: { default: { syntax: '<color>' } },
 * });
 *
 * assignVars(vars, ':root', { bg: { app: '#fff' } });
 * select('.card').style({ background: vars.bg.app });
 * ```
 */
export function defineVars<const TShape extends Record<string, unknown>>(
  shape: TShape,
  options: DefineVarsOptions = {},
): VarsFromShape<TShape> {
  const { prefix = '', registerProperties = true, initialValues } = options;

  return buildVarsFromShape(shape, [], {
    prefix,
    registerProperties,
    ...(initialValues !== undefined ? { initialValues } : {}),
  });
}

export type { VarToken } from '#types';

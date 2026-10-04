import { type CssDeclaration, decl } from '@surimi/ast';
import type { CamelCaseToKebabCase, CssProperties } from '@surimi/common';

import { CustomPropertyBuilder } from '#builders/custom-property.builder';

/** Custom properties are case-sensitive, so `--fooBar` is kept as is. */
export function formatPropertyName<T extends string>(
  property: T,
): T extends `--${string}` ? T : CamelCaseToKebabCase<T> {
  if (property.length === 0 || property.startsWith('--')) return property as never;

  return property.replace(/([A-Z])/g, '-$1').toLowerCase() as never;
}

export function formatPropertyValue(value: unknown): string {
  if (typeof value === 'number') {
    return value.toString();
  }
  return String(value);
}

/**
 * Normalize a computed-property key or raw name to a dashed custom property name (`--name`).
 */
export function normalizeVarName(key: PropertyKey): string {
  const keyStr = typeof key === 'string' ? key : String(key);
  const varMatch = keyStr.match(/^var\((--[^)]+)\)$/);

  if (varMatch?.[1]) {
    return varMatch[1];
  }

  if (keyStr.startsWith('--')) {
    return keyStr;
  }

  return `--${keyStr}`;
}

export function createDeclarationsFromProperties(properties: CssProperties): CssDeclaration[] {
  const declarations: CssDeclaration[] = [];

  for (const [property, value] of Object.entries(properties)) {
    if (value === undefined) {
      continue;
    }

    if (value === null) {
      throw new TypeError(`Expected a value for "${property}", got null. Omit the key or use undefined`);
    }

    const formattedValue = value instanceof CustomPropertyBuilder ? value.build() : formatPropertyValue(value);

    declarations.push(decl({ prop: formatPropertyName(property), value: formattedValue }));
  }

  return declarations;
}

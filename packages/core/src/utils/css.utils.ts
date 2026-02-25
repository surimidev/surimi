import { decl, type CssDeclaration } from '@surimi/ast';
import type { CamelCaseToKebabCase, CssProperties } from '@surimi/common';

import { CustomPropertyBuilder } from '#builders/custom-property.builder';

export function formatPropertyName<T extends string>(property: T): CamelCaseToKebabCase<T> {
  if (property.length === 0) return property as never;

  return property.replace(/([A-Z])/g, '-$1').toLowerCase() as CamelCaseToKebabCase<T>;
}

export function formatPropertyValue(value: unknown): string {
  if (typeof value === 'number') {
    return value.toString();
  }
  return String(value);
}

export function createDeclarationsFromProperties(properties: CssProperties): CssDeclaration[] {
  const declarations: CssDeclaration[] = [];

  for (const [property, value] of Object.entries(properties)) {
    if (value != null) {
      const formattedProperty = formatPropertyName(property);
      const formattedValue = value instanceof CustomPropertyBuilder ? value.build() : formatPropertyValue(value);

      declarations.push(
        decl({
          prop: formattedProperty,
          value: formattedValue,
        }),
      );
    }
  }

  return declarations;
}

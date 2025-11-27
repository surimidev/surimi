/**
 * Utility functions for working with PostCSS,
 * or formatting CSS properties and values to be used by PostCSS.
 */

import postcss from 'postcss';

import { CustomPropertyBuilder } from '#builders/custom-property.builder';
import type { CamelCaseToKebabCase, CssProperties } from '@surimi/common';

/**
 * Formats a camelCase property name to kebab-case for CSS
 */
export function formatPropertyName<T extends string>(property: T): CamelCaseToKebabCase<T> {
  if (property.length === 0) return property as never;

  return property.replace(/([A-Z])/g, '-$1').toLowerCase() as CamelCaseToKebabCase<T>;
}

/**
 * Formats a property value to a string suitable for PostCSS
 */
export function formatPropertyValue(value: unknown): string {
  if (typeof value === 'number') {
    return value.toString();
  }
  return String(value);
}

/**
 * Creates PostCSS declaration nodes from CSS properties.
 * Handles both standard CSS values and custom properties.
 */
export function createDeclarationsFromProperties(properties: CssProperties): postcss.Declaration[] {
  const declarations: postcss.Declaration[] = [];

  for (const [property, value] of Object.entries(properties)) {
    if (value != null) {
      // Ensure the property key is formatted to kebab-case
      const formattedProperty = formatPropertyName(property);
      const formattedValue = value instanceof CustomPropertyBuilder ? value.build() : formatPropertyValue(value);

      const declaration = postcss.decl({
        prop: formattedProperty,
        value: formattedValue,
      });

      declarations.push(declaration);
    }
  }

  return declarations;
}

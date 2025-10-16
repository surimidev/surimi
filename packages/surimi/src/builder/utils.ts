import postcss, { type Declaration } from 'postcss';

import type { CSSProperties } from '../types';

/**
 * CSS generation utilities for PostCSS AST manipulation.
 */

/**
 * Formats a camelCase property name to kebab-case for CSS
 */
export function formatPropertyName(property: string): string {
  return property.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Formats a property value to a string suitable for CSS
 */
export function formatPropertyValue(value: unknown): string {
  if (typeof value === 'number') {
    return value.toString();
  }
  return String(value);
}

/**
 * Creates PostCSS declaration nodes from CSS properties object
 */
export function createDeclarations(properties: CSSProperties): Declaration[] {
  const declarations: Declaration[] = [];

  for (const [property, value] of Object.entries(properties)) {
    if (value !== undefined && value !== null) {
      const formattedProperty = formatPropertyName(property);
      const formattedValue = formatPropertyValue(value);

      const declaration = postcss.decl({
        prop: formattedProperty,
        value: formattedValue,
      });

      declarations.push(declaration);
    }
  }

  return declarations;
}

/**
 * Combines a base selector with pseudo-classes and pseudo-elements
 */
export function combineSelector(
  baseSelector: string,
  pseudoClasses: string[] = [],
  pseudoElements: string[] = [],
): string {
  let selector = baseSelector;

  for (const pseudoClass of pseudoClasses) {
    selector += `:${pseudoClass}`;
  }

  for (const pseudoElement of pseudoElements) {
    selector += `::${pseudoElement}`;
  }

  return selector;
}

/**
 * Builds a selector with a relationship combinator
 */
export function buildSelectorWithRelationship(
  baseSelector: string,
  relationship: 'child' | 'descendant' | 'adjacent' | 'sibling',
  targetSelector: string,
): string {
  switch (relationship) {
    case 'child':
      return `${baseSelector} > ${targetSelector}`;
    case 'descendant':
      return `${baseSelector} ${targetSelector}`;
    case 'adjacent':
      return `${baseSelector} + ${targetSelector}`;
    case 'sibling':
      return `${baseSelector} ~ ${targetSelector}`;
    default:
      return `${baseSelector} ${targetSelector}`;
  }
}

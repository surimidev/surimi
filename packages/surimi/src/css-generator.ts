/**
 * CSS generation utilities for PostCSS AST manipulation.
 *
 * These functions handle the low-level transformation of TypeScript objects
 * into PostCSS nodes (declarations, rules, selectors) that can be serialized to CSS.
 */
import postcss, { type Declaration } from 'postcss';

import type { CSSProperties } from '#types';

export function formatPropertyName(property: string): string {
  return property.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function formatPropertyValue(value: unknown): string {
  if (typeof value === 'number') {
    return value.toString();
  }
  return String(value);
}

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

export function joinSelectors(...selectors: string[]): string {
  return selectors.join(', ');
}

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

/**
 * Shared utils across different builders / mixins.
 */

import type { BuilderContext, ExtractContextString, FlatBuilderContext } from '#types/builder.types';
import type { SelectorRelationship } from '#types/css.types';
import { JoinSelectors } from '#types/selector.types';

/**
 * Combine multiple selectors and pseudoElements / pseudoClasses into a single selector string.
 *
 * Also splits up groups and applies all child selectors, classes etc. to each item of a group.
 *
 * Note, that the order of pseudo-classes and pseudo-elements matters in CSS.
 * If users constructed something like `.button:active::after:hover`, it will be combined as `.button:hover:active::after`.
 *
 * @example
 * ```typescript
 * combineSelectors([
 *   { selector: '.button, #link' },
 *   { pseudoClass: 'hover' },
 *   { pseudoElement: 'after' },
 * ]);
 * // Returns: '.button:hover::after, #link:hover::after'
 * ```
 *
 * @example
 * ```typescript
 * combineSelectors([
 *   { selector: 'div' },
 *   { pseudoClass: 'first-child' },
 *   { pseudoElement: 'before' },
 * ]);
 * // Returns: 'div:first-child::before'
 * ```
 *
 * @example
 * ```typescript
 * combineSelectors([
 *   { group: [
 *     { selector: 'a.link' },
 *     { selector: '.link' },
 *   ] },
 *   { pseudoClass: 'visited' },
 * ]);
 * // Returns: 'a.link:visited, .link:visited'
 * ```
 */
export function combineSelectors(items: FlatBuilderContext) {
  const groupItems = items.filter(item => 'group' in item);
  const selectorItem = items.find(item => 'selector' in item);
  const pseudoClasses = items.filter(item => 'pseudoClass' in item).map(item => item.pseudoClass);
  const pseudoElements = items.filter(item => 'pseudoElement' in item).map(item => item.pseudoElement);

  /**
   * Recursively extract all selectors from a group, flattening nested groups
   */
  function extractSelectorsFromGroup(group: FlatBuilderContext): string[] {
    const selectors: string[] = [];

    for (const item of group) {
      if ('selector' in item) {
        selectors.push(item.selector);
      } else if ('group' in item) {
        // Recursively handle nested groups
        selectors.push(...extractSelectorsFromGroup(item.group));
      }
      // Ignore pseudo-classes/elements within groups - they should be applied at the context level
    }

    return selectors;
  }

  /**
   * Apply pseudo-classes and pseudo-elements to a selector
   */
  function applySelectorModifiers(selector: string): string {
    let combined = selector;

    for (const pseudoClass of pseudoClasses) {
      combined += `:${pseudoClass}`;
    }

    for (const pseudoElement of pseudoElements) {
      combined += `::${pseudoElement}`;
    }

    return combined;
  }

  // Handle groups (including multiple and nested groups)
  if (groupItems.length > 0) {
    // Collect all selectors from all groups
    const allGroupSelectors = groupItems.flatMap(groupItem => extractSelectorsFromGroup(groupItem.group));

    // Apply modifiers to each selector and join with commas
    return allGroupSelectors.map(applySelectorModifiers).join(', ');
  }

  // Handle single selector case
  const selector = selectorItem?.selector ?? '';
  return applySelectorModifiers(selector);
}

/**
 * Builds a selector with a relationship combinator
 */
export function buildSelectorWithRelationship(
  baseSelector: string,
  relationship: SelectorRelationship,
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
      throw new Error(`Unknown relationship type: ${relationship as string}`);
  }
}

/**
 * Join multiple selectors with comma separation
 */
export function joinSelectors<TSelectors extends string[]>(...selectors: TSelectors): JoinSelectors<TSelectors> {
  return selectors.join(', ') as JoinSelectors<TSelectors>;
}

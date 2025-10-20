/**
 * Shared utils across different builders / mixins.
 */

import * as parsel from 'parsel-js';

import type { BuilderContextItem, ExtractBuildContextFromString, FlatBuilderContext } from '#types/builder.types';
import type { SelectorRelationship } from '#types/css.types';
import type { JoinSelectors } from '#types/selector.types';

/**
 * Combine multiple selectors and pseudoElements / pseudoClasses into a single selector string.
 *
 * Processes items in the order they appear, applying pseudo-classes and pseudo-elements
 * to the most recent selector. This ensures proper CSS selector structure.
 *
 * @example
 * ```typescript
 * combineSelectors([
 *   { selector: '.form' },
 *   { selector: 'input', relation: 'child' },
 *   { pseudoClass: 'first-child' },
 *   { selector: '.label', relation: 'adjacent' },
 * ]);
 * // Returns: '.form > input:first-child + .label'
 * ```
 *
 * @example
 * ```typescript
 * combineSelectors([
 *   { selector: '.button' },
 *   { pseudoClass: 'hover' },
 *   { pseudoElement: 'after' },
 * ]);
 * // Returns: '.button:hover::after'
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
export function combineSelectors(items: FlatBuilderContext): string {
  const groupItems = items.filter(item => 'group' in item);

  // Handle groups first - apply all non-group items to each group selector
  if (groupItems.length > 0) {
    const nonGroupItems = items.filter(item => !('group' in item));
    const allGroupSelectors = groupItems.flatMap(groupItem => extractSelectorsFromGroup(groupItem.group));

    return allGroupSelectors
      .map(groupSelector => {
        const contextWithGroupSelector = [{ selector: groupSelector }, ...nonGroupItems];
        return combineSelectorsSequentially(contextWithGroupSelector);
      })
      .join(', ');
  }

  return combineSelectorsSequentially(items);
}

/**
 * Recursively extract all selectors from a group, flattening nested groups
 */
function extractSelectorsFromGroup(group: FlatBuilderContext): string[] {
  const selectors: string[] = [];

  for (const item of group) {
    if ('selector' in item) {
      selectors.push(item.selector);
    } else if ('group' in item) {
      selectors.push(...extractSelectorsFromGroup(item.group));
    }
  }

  return selectors;
}

/**
 * Combine items sequentially, building the selector from left to right
 */
function combineSelectorsSequentially(items: FlatBuilderContext): string {
  let result = '';

  for (const item of items) {
    if ('selector' in item) {
      if (result === '') {
        // First selector - no relationship needed
        result = item.selector;
      } else {
        // Subsequent selector - use its relationship to combine with previous result
        const relationship = item.relation ?? 'descendant';
        result = buildSelectorWithRelationship(result, relationship, item.selector);
      }
    } else if ('pseudoClass' in item) {
      // Apply pseudo-class to the last selector in the result
      result += `:${item.pseudoClass}`;
    } else if ('pseudoElement' in item) {
      // Apply pseudo-element to the last selector in the result
      result += `::${item.pseudoElement}`;
    }
    // Skip group items as they are handled at the top level
  }

  return result;
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

/**
 * Parse a selector string into its build context representation
 * For example, '.button:hover::after' becomes
 * [
 *   { selector: '.button' },
 *   { pseudoClass: 'hover' },
 *   { pseudoElement: 'after' },
 * ]
 *
 * Uses parsel-js for robust CSS selector parsing.
 * Supports:
 * - Simple selectors (class, ID, element, attribute)
 * - Pseudo-classes (:hover, :focus, etc.)
 * - Pseudo-elements (::before, ::after, etc.)
 * - Combinators (>, +, ~, space for descendant)
 * - Complex selectors with parentheses and quoted values
 * - Selector lists (comma-separated)
 *
 * This does NOT support media queries, groups, or other advanced BuildContext features.
 */
export function parseSelectorString<S extends string>(selector: S): ExtractBuildContextFromString<S> {
  if (!selector || selector.trim() === '') {
    return [] as ExtractBuildContextFromString<S>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = [];

  try {
    // Parse with parsel-js, enabling list parsing for comma-separated selectors
    const parsed = parsel.parse(selector.trim(), { list: true });

    if (!parsed) {
      throw new Error('Failed to parse selector');
    }

    if (parsed.type === 'list') {
      // Handle selector lists - flatten them as individual items
      // This matches the expected test behavior where comma-separated selectors become individual results
      const listItems = parsed.list.map(selectorNode => parseParselNode(selectorNode)).flat();
      result.push(...listItems);
    } else {
      // Single selector or complex selector
      const items = parseParselNode(parsed);
      result.push(...items);
    }
  } catch (error) {
    // If parsing fails, fall back to treating it as a simple selector
    console.warn(`Failed to parse selector "${selector}":`, error);
    result.push({ selector: selector.trim() });
  }

  return result as ExtractBuildContextFromString<S>;
}

/**
 * Parse a single parsel AST node into build context items
 */
function parseParselNode(node: parsel.AST): BuilderContextItem[] {
  const result: BuilderContextItem[] = [];

  switch (node.type) {
    case 'complex': {
      // Handle complex selectors with combinators
      const leftItems = parseParselNode(node.left);
      const rightItems = parseParselNode(node.right);

      // Map combinator to our relation type
      let relation: 'child' | 'adjacent' | 'sibling' | 'descendant';
      switch (node.combinator.trim()) {
        case '>':
          relation = 'child';
          break;
        case '+':
          relation = 'adjacent';
          break;
        case '~':
          relation = 'sibling';
          break;
        case ' ':
        default:
          relation = 'descendant';
          break;
      }

      // Add the relation to the first selector item in the right part
      if (rightItems.length > 0) {
        const firstRightItem = rightItems[0];
        if (firstRightItem && 'selector' in firstRightItem && firstRightItem.selector) {
          firstRightItem.relation = relation;
        } else {
          // If the first item isn't a selector, we need to find the first selector item
          const firstSelectorItem = rightItems.find(item => 'selector' in item && item.selector);
          if (firstSelectorItem && 'selector' in firstSelectorItem) {
            firstSelectorItem.relation = relation;
          }
        }
      }

      result.push(...leftItems, ...rightItems);
      break;
    }

    case 'compound': {
      // Handle compound selectors (multiple parts without combinators)
      const selectorParts: string[] = [];
      const pseudoItems: BuilderContextItem[] = [];

      for (const item of node.list) {
        switch (item.type) {
          case 'type':
          case 'class':
          case 'id':
          case 'attribute':
          case 'universal':
            selectorParts.push(item.content);
            break;
          case 'pseudo-class':
            // Use the full content to include arguments like nth-child(2n+1)
            pseudoItems.push({ pseudoClass: item.content.replace(/^:/, '') });
            break;
          case 'pseudo-element':
            // Use the full content to include vendor prefixes properly
            pseudoItems.push({ pseudoElement: item.content.replace(/^::/, '') });
            break;
        }
      }

      // Combine all selector parts into a single selector
      if (selectorParts.length > 0) {
        result.push({ selector: selectorParts.join('') });
      }

      // Add pseudo-classes and pseudo-elements
      result.push(...pseudoItems);
      break;
    }

    case 'type':
    case 'class':
    case 'id':
    case 'attribute':
    case 'universal': {
      // Simple selector node
      result.push({ selector: node.content });
      break;
    }

    case 'pseudo-class': {
      result.push({ pseudoClass: node.content.replace(/^:/, '') });
      break;
    }

    case 'pseudo-element': {
      result.push({ pseudoElement: node.content.replace(/^::/, '') });
      break;
    }

    case 'list': {
      // This shouldn't happen in our current usage, but handle it gracefully
      // We would need to return a group, but that's not supported in this function's return type
      // Instead, we'll just process the first item
      if (node.list.length > 0 && node.list[0]) {
        return parseParselNode(node.list[0]);
      }
      break;
    }
  }

  return result;
}

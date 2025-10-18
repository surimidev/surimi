/**
 * Shared utils across different builders / mixins.
 */

import type { BuilderContext, ExtractContextString, FlatBuilderContext } from '#types/builder.types';
import type { SelectorRelationship } from '#types/css.types';
import { JoinSelectors, ValidSelector } from '#types/selector.types';

/**
 * Combine multiple selectors and pseudoElements / pseudoClasses into a single selector string.
 * Note, that the order of pseudo-classes and pseudo-elements matters in CSS.
 * If users constructed something like `.button:active::after:hover`, it will be combined as `.button:hover:active::after`.
 */
export function combineSelectors(items: FlatBuilderContext) {
  let selector = items.find(item => 'selector' in item)?.selector ?? '';
  const pseudoClasses = items.filter(item => 'pseudoClass' in item).map(item => item.pseudoClass);
  const pseudoElements = items.filter(item => 'pseudoElement' in item).map(item => item.pseudoElement);

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

// TODO: Remove, this is used only for testing
export function buildContextString<TContext extends BuilderContext>(context: TContext): ExtractContextString<TContext> {
  return context
    .map(item => {
      if ('selector' in item) {
        return item.selector;
      } else if ('pseudoClass' in item) {
        return `:${item.pseudoClass}`;
      } else if ('pseudoElement' in item) {
        return `::${item.pseudoElement}`;
      } else if ('atRule' in item) {
        return `${item.atRule} ${item.params} ⤷`;
      }
      return '';
    })
    .join('') as ExtractContextString<TContext>;
}

/**
 * Join multiple selectors with comma separation
 */
export function joinSelectors<TSelectors extends ValidSelector[]>(...selectors: TSelectors): JoinSelectors<TSelectors> {
  return selectors.join(', ') as JoinSelectors<TSelectors>;
}

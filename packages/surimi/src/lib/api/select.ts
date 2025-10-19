import type postcss from 'postcss';

import type { BuilderContext, ExtractContextString } from '#types/builder.types';
import type { JoinSelectorsAsGroup, SelectorsAsGroup, ValidSelector } from '#types/selector.types';
import type { ArrayWithAtLeastOneItem } from '#types/util.types';

import { SelectorBuilder } from '../builders';

/**
 * @internal Helper method for creating 'select' methods. Should not be exported publicly.
 *
 * Using an existing builder context, creates a new SelectorBuilder with the provided selectors.
 * The postcss root is passed to the new selector builder.
 */
export function _select<TBaseContext extends BuilderContext, TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(
  baseContext: TBaseContext,
  postcssRoot: postcss.Root,
  selectors: TSelectors,
): SelectorBuilder<`${ExtractContextString<TBaseContext>}${JoinSelectorsAsGroup<TSelectors>}`> {
  if (selectors.length === 0) {
    throw new Error('At least one selector must be provided');
  } else if (selectors.length === 1) {
    if (typeof selectors[0] !== 'string') {
      throw new Error('Selector must be a string');
    }

    // TODO: Fix/remove type assertion. Not sure why it's needed.
    return new SelectorBuilder([...baseContext, { selector: selectors[0] }] as never, postcssRoot);
  }

  // As with types, filter out empty strings
  const selectorItems = selectors
    .filter(i => i.length > 0)
    .map(selector => ({ selector })) as SelectorsAsGroup<TSelectors>;

  // TODO: Fix/remove type assertion. Not sure why it's needed.
  return new SelectorBuilder([...baseContext, { group: selectorItems }] as never, postcssRoot);
}

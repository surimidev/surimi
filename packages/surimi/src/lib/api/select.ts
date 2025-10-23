import type postcss from 'postcss';

import { tokenize } from '@surimi/parsers';

import type { JoinSelectors, ValidSelector } from '#types/selector.types';
import type { ArrayWithAtLeastOneItem } from '#types/util.types';
import { joinSelectors } from '#utils/selector.utils';

import { SelectorBuilder } from '../builders';

/**
 * @internal Helper method for creating 'select' methods. Should not be exported publicly.
 *
 * Using an existing builder context, creates a new SelectorBuilder with the provided selectors.
 * The postcss root is passed to the new selector builder.
 */
export function _select<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(
  selectors: TSelectors,
  postcssContainer: postcss.Container,
  postcssRoot: postcss.Root,
): SelectorBuilder<JoinSelectors<TSelectors>> {
  if (selectors.length === 0) {
    throw new Error('At least one selector must be provided');
  }
  if (typeof selectors[0] !== 'string') {
    throw new Error('Selector must be a string');
  }

  const joinedSelectors = joinSelectors(selectors);
  const selectorTokens = tokenize(joinedSelectors);

  return new SelectorBuilder(selectorTokens, postcssContainer, postcssRoot);
}

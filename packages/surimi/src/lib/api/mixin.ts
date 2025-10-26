import { tokenize } from '@surimi/parsers';

import { Surimi } from '#surimi';
import type { ValidSelector } from '#types/selector.types';
import type { ArrayWithAtLeastOneItem } from '#types/util.types';
import { joinSelectors } from '#utils/selector.utils';

import { MixinBuilder } from '../builders';

export function mixin<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(...selectors: TSelectors) {
  if (selectors.length === 0) {
    throw new Error('At least one selector must be provided');
  }
  if (typeof selectors[0] !== 'string') {
    throw new Error('Selector must be a string');
  }

  const joinedSelectors = joinSelectors(selectors);
  const selectorTokens = tokenize(joinedSelectors);

  return new MixinBuilder(selectorTokens, Surimi.root, Surimi.root);
}

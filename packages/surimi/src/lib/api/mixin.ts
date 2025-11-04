import { tokenize } from '@surimi/parsers';

import { SurimiContext } from '#surimi';
import type { ValidSelector } from '#types/selector.types';
import type { ArrayWithAtLeastOneItem } from '#types/util.types';
import { joinSelectors } from '#utils/selector.utils';

import { MixinBuilder } from '../builders';

/**
 * Create re-usable mixin selections. Select anything you would like to mix in,
 * like class names, IDs, element names, attributes, etc. just like with the main `select` function.
 *
 * Then, define styles on it using `style()`. Instead of being applied directly,
 * these styles can be applied to other selectors using the `use()` method
 * from builders that support styling.
 *
 * @example
 * ```ts
 * const underlineOnHover = mixin(':hover').style({
 *  textDecoration: 'underline',
 * });
 *
 * select('.link').use(underlineOnHover);
 * ```
 */
export function mixin<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(...selectors: TSelectors) {
  if (selectors.length === 0) {
    throw new Error('At least one selector must be provided');
  }
  if (typeof selectors[0] !== 'string') {
    throw new Error('Selector must be a string');
  }

  const joinedSelectors = joinSelectors(selectors);
  const selectorTokens = tokenize(joinedSelectors);

  return new MixinBuilder(selectorTokens, SurimiContext.root, SurimiContext.root);
}

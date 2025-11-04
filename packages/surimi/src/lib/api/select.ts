import type postcss from 'postcss';

import type { Stringify, Token } from '@surimi/parsers';
import { tokenize } from '@surimi/parsers';

import { SurimiContext } from '#surimi';
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

/**
 * @internal Helper method for creating 'selectByContext' methods. Should not be exported publicly.
 *
 * Using an existing builder context, creates a new SelectorBuilder with the provided tokenized context.
 * The postcss root is passed to the new selector builder.
 */
export function _selectByContext<TContext extends Token[]>(
  context: TContext,
  postcssContainer: postcss.Container,
  postcssRoot: postcss.Root,
): SelectorBuilder<Stringify<TContext>> {
  return new SelectorBuilder<Stringify<TContext>>(context as never, postcssContainer, postcssRoot);
}

/**
 * The main way to select things in Surimi.
 *
 * Pass this anything you would like to select, like class names, IDs, element names, attributes, etc.
 * Will return a tagged SelectorBuilder that allows you to
 * - navigate the DOM
 * - target pseudo-classes and pseudo-elements
 * - apply styles
 * - and more.
 *
 * **IMPORTANT:**
 * Make sure to select each item in a new argument, so that surimi can properly figure out lists of selectors.
 * For example, use `select('.class1', '.class2')` instead of `select('.class1, .class2')`.
 * When typing in selectors, you will get autocompletion for valid CSS selectors in most editors.
 *
 * @example
 * ```ts
 * const button = select('.button');
 *
 * button.style({
 *   backgroundColor: 'blue',
 *   color: 'white',
 * });
 * ```
 */
export function select<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(...selectors: TSelectors) {
  return _select(selectors, SurimiContext.root, SurimiContext.root);
}

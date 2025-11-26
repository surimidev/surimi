import type postcss from 'postcss';

import type { Stringify, Token } from '@surimi/parsers';
import { tokenize } from '@surimi/parsers';

import { SelectorBuilder } from '#builders/selector.builder';
import type { ArrayWithAtLeastOneItem, JoinSelectors, ValidSelector } from '#types';
import { joinSelectors } from '#utils/selector.utils';

/**
 * @internal Helper method for creating 'select' methods. Should not be exported publicly.
 *
 * Using an existing builder context, creates a new SelectorBuilder with the provided selectors.
 * The postcss root is passed to the new selector builder.
 */
export function createSelectorBuilderFromString<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(
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
export function createSelectorBuilderFromContext<TContext extends Token[]>(
  context: TContext,
  postcssContainer: postcss.Container,
  postcssRoot: postcss.Root,
): SelectorBuilder<Stringify<TContext>> {
  return new SelectorBuilder<Stringify<TContext>>(context as never, postcssContainer, postcssRoot);
}

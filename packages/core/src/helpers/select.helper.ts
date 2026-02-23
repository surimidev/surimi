import type { CssContainer, CssRoot } from '@surimi/ast';
import type { ArrayWithAtLeastOneItem, JoinSelectors, ValidSelector } from '@surimi/common';
import type { Stringify, Token } from '@surimi/parsers';
import { tokenize } from '@surimi/parsers';

import { SelectorBuilder } from '#builders/selector.builder';
import { joinSelectors } from '#utils/selector.utils';

export function createSelectorBuilderFromString<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(
  selectors: TSelectors,
  container: CssContainer,
  root: CssRoot,
): SelectorBuilder<JoinSelectors<TSelectors>> {
  if (selectors.length === 0) {
    throw new Error('At least one selector must be provided');
  }
  if (typeof selectors[0] !== 'string') {
    throw new Error('Selector must be a string');
  }

  const joinedSelectors = joinSelectors(selectors);
  const selectorTokens = tokenize(joinedSelectors);

  return new SelectorBuilder(selectorTokens, container, root);
}

export function createSelectorBuilderFromContext<TContext extends Token[]>(
  context: TContext,
  container: CssContainer,
  root: CssRoot,
): SelectorBuilder<Stringify<TContext>> {
  return new SelectorBuilder<Stringify<TContext>>(context as never, container, root);
}

import type { ArrayWithAtLeastOneItem, JoinSelectors, ValidSelector } from '@surimi/common';
import type { Token, Tokenize } from '@surimi/parsers';

import { CoreBuilder, SelectorBuilder } from '#builders';
import { createSelectorBuilderFromContext, createSelectorBuilderFromString } from '#helpers/select.helper';

/**
 * Mixin mainly for selecting things in a nested way within an existing selector context
 */
export abstract class WithSelecting<TContext extends string> extends CoreBuilder<Tokenize<TContext>> {
  /**
   * Nest a selection within the current selector context.
   */
  public select<T extends ArrayWithAtLeastOneItem<ValidSelector>>(...selectors: T): SelectorBuilder<JoinSelectors<T>>;
  public select<T extends ValidSelector>(selectorBuilder: SelectorBuilder<T>): SelectorBuilder<T>;
  public select<T extends ArrayWithAtLeastOneItem<ValidSelector>>(...selectors: T | [SelectorBuilder<string>]) {
    if (selectors.length === 1 && selectors[0] instanceof SelectorBuilder) {
      const selectorBuilder = selectors[0];
      return createSelectorBuilderFromString([selectorBuilder.build()], this.getOrCreateRule(), this._postcssRoot);
    }

    return createSelectorBuilderFromString(selectors as T, this.getOrCreateRule(), this._postcssRoot);
  }

  /**
   * Instead of selecting by string selectors, select by providing a tokenized context.
   *
   * You probably won't need to use this directly.
   */
  public selectByContext<TContext extends Token[]>(context: TContext) {
    return createSelectorBuilderFromContext(context, this.getOrCreateRule(), this._postcssRoot);
  }
}

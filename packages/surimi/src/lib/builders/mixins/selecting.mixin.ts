import type { Token, Tokenize } from '@surimi/parsers';

import { _select, _selectByContext } from '#lib/api/select';
import type { ValidSelector } from '#types/selector.types';
import type { ArrayWithAtLeastOneItem } from '#types/util.types';

import { CoreBuilder } from '../core.builder';
import { SelectorBuilder } from '../selector.builder';

/**
 * Mixin mainly for selecting things in a nested way within an existing selector context
 */
export abstract class WithSelecting<TContext extends string> extends CoreBuilder<Tokenize<TContext>> {
  /**
   * Nest a selection within the current selector context.
   */
  public select(...selectors: ArrayWithAtLeastOneItem<ValidSelector>): ReturnType<typeof _select>;
  public select(selectorBuilder: SelectorBuilder<string>): ReturnType<typeof _select>;
  public select<T extends ArrayWithAtLeastOneItem<ValidSelector>>(...selectors: T | [SelectorBuilder<string>]) {
    if (selectors.length === 1 && selectors[0] instanceof SelectorBuilder) {
      const selectorBuilder = selectors[0];
      return _select([selectorBuilder.toString()], this.getOrCreateRule(), this._postcssRoot);
    }

    return _select(selectors as T, this.getOrCreateRule(), this._postcssRoot);
  }

  /**
   * Instead of selecting by string selectors, select by providing a tokenized context.
   *
   * You probably won't need to use this directly.
   */
  public selectByContext<TContext extends Token[]>(context: TContext) {
    return _selectByContext(context, this.getOrCreateRule(), this._postcssRoot);
  }
}

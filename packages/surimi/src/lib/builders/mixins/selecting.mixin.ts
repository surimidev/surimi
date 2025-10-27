import type { Token } from '@surimi/parsers';
import { type Tokenize } from '@surimi/parsers';

import { _select, _selectByContext } from '#lib/api/select';
import type { ValidSelector } from '#types/selector.types';
import type { ArrayWithAtLeastOneItem } from '#types/util.types';

import { CoreBuilder } from '../core.builder';

/**
 * Mixin mainly for selecting things in a nested way within an existing selector context
 */
export class WithSelecting<TContext extends string> extends CoreBuilder<Tokenize<TContext>> {
  /**
   * Nest a selection within the current selector context.
   */
  public select<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(...selectors: TSelectors) {
    return _select(selectors, this.getOrCreateRule(), this.postcssRoot);
  }

  /**
   * Instead of selecting by string selectors, select by providing a tokenized context.
   *
   * You probably won't need to use this directly.
   */
  public selectByContext<TContext extends Token[]>(context: TContext) {
    return _selectByContext(context, this.getOrCreateRule(), this.postcssRoot);
  }
}

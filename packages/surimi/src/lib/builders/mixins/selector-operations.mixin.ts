import { tokenizeSelector, type Tokenize } from '@surimi/parsers';

import { _select } from '#lib/api/select';
import type { ValidSelector } from '#types/selector.types';

import { CoreBuilder } from '../core.builder';
import { SelectorBuilder } from '../selector.builder';

/**
 * Mixin mainly for selecting things in a nested way within an existing selector context
 */
export class WithSelectorOperations<TContext extends string> extends CoreBuilder<Tokenize<TContext>> {
  /**
   * Combine a selector with the previous one using a comma (`,`) to create a group of selectors.
   *
   * To join two selectors, use the `join` method instead.
   *
   * @example
   * ```ts
   * select('.btn').and('.link').style({ color: 'blue' });
   * // Results in the CSS: `.btn, .link { color: blue; }`
   * ```
   */
  public and<TSelector extends ValidSelector>(selector: TSelector) {
    const selectorTokens = tokenizeSelector(selector);

    return new SelectorBuilder<`${TContext}, ${TSelector}`>(
      [...this.context, { type: 'comma', content: ',' }, ...selectorTokens] as never,
      this.postcssContainer,
      this.postcssRoot,
    );
  }

  /**
   * Combine the current selector with another selector to create a combined selector.
   *
   * We currently DO NOT validate the order of selectors here.
   * Passing, for example, an `html` type selector after a class selector will yeild invalid CSS without an error!
   *
   * To create a group of selectors, use the `and` method instead.
   *
   * @example
   * ```ts
   * select('.btn').join('.link').style({ color: 'blue' });
   * // Results in the CSS: `.btn.link { color: blue; }`
   * ```
   */
  public join<TSelector extends ValidSelector>(selector: TSelector) {
    const selectorTokens = tokenizeSelector(selector);

    return new SelectorBuilder<`${TContext} ${TSelector}`>(
      [...this.context, ...selectorTokens] as never,
      this.postcssContainer,
      this.postcssRoot,
    );
  }
}

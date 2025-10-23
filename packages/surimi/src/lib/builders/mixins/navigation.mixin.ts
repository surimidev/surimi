import type { Tokenize } from '@surimi/parsers';
import { tokenizeSelector } from '@surimi/parsers';

import { _select } from '#lib/api/select';

import { CoreBuilder } from '../core.builder';
import { SelectorBuilder } from '../selector.builder';

/**
 * Mixin mainly for the SelectorBuilder that provides navigation methods to traverse the DOM
 */
export class WithNavigation<TContext extends string> extends CoreBuilder<Tokenize<TContext>> {
  public child<TChild extends string>(selector: TChild): SelectorBuilder<`${TContext} > ${TChild}`> {
    return new SelectorBuilder(
      [...this.context, ...tokenizeSelector(`> ${selector}`)] as never,
      this.postcssContainer,
      this.postcssRoot,
    );
  }

  public descendant<TDescendant extends string>(selector: TDescendant): SelectorBuilder<`${TContext} ${TDescendant}`> {
    return new SelectorBuilder(
      [...this.context, ...tokenizeSelector(` ${selector}`)] as never,
      this.postcssContainer,
      this.postcssRoot,
    );
  }

  public adjacent<TAdjacent extends string>(selector: TAdjacent): SelectorBuilder<`${TContext} + ${TAdjacent}`> {
    return new SelectorBuilder(
      [...this.context, ...tokenizeSelector(`+ ${selector}`)] as never,
      this.postcssContainer,
      this.postcssRoot,
    );
  }

  public sibling<TSibling extends string>(selector: TSibling): SelectorBuilder<`${TContext} ~ ${TSibling}`> {
    return new SelectorBuilder(
      [...this.context, ...tokenizeSelector(`~ ${selector}`)] as never,
      this.postcssContainer,
      this.postcssRoot,
    );
  }
}

import { GetFirstToken, OmitLastToken, Stringify, Tokenize, tokenizeSelector } from '@surimi/parsers';

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

  /** Navigate to the parent selector, as in the previous one. */
  public parent(): SelectorBuilder<Stringify<OmitLastToken<Tokenize<TContext>>>> {
    if (this.context.length === 0) {
      throw new Error('No parent selector found');
    }

    const newContext = this.context.slice(0, -1) as OmitLastToken<Tokenize<TContext>>;

    return new SelectorBuilder(newContext, this.postcssContainer, this.postcssRoot);
  }

  /**
   * Navigate back to the root selector
   * Not to be confused with `.root()` which selects the `:root` pseudo-class
   */
  public main(): SelectorBuilder<Stringify<[GetFirstToken<Tokenize<TContext>>]>> {
    if (this.context.length === 0) {
      throw new Error('No root selector found');
    }

    const newContext = [this.context[0]] as [GetFirstToken<Tokenize<TContext>>];
    return new SelectorBuilder(newContext as never, this.postcssContainer, this.postcssRoot);
  }
}

import type {
  ExtractBuildContextFromString,
  ExtractContextString,
  GetFirstSelector,
  GetParentSelector,
} from '#types/builder.types';

import { CoreBuilder } from '../core.builder';
import { SelectorBuilder } from '../selector.builder';

/**
 * Mixin mainly for the SelectorBuilder that provides navigation methods to traverse the DOM
 */
export class WithNavigation<TContext extends string> extends CoreBuilder<ExtractBuildContextFromString<TContext>> {
  public child<TChild extends string>(selector: TChild): SelectorBuilder<`${TContext} > ${TChild}`> {
    return new SelectorBuilder([...this.context, { selector, relation: 'child' }] as never, this.postcssRoot);
  }

  public descendant<TDescendant extends string>(selector: TDescendant): SelectorBuilder<`${TContext} ${TDescendant}`> {
    return new SelectorBuilder([...this.context, { selector, relation: 'descendant' }] as never, this.postcssRoot);
  }

  public adjacent<TAdjacent extends string>(selector: TAdjacent): SelectorBuilder<`${TContext} + ${TAdjacent}`> {
    return new SelectorBuilder([...this.context, { selector, relation: 'adjacent' }] as never, this.postcssRoot);
  }

  public sibling<TSibling extends string>(selector: TSibling): SelectorBuilder<`${TContext} ~ ${TSibling}`> {
    return new SelectorBuilder([...this.context, { selector, relation: 'sibling' }] as never, this.postcssRoot);
  }

  /** Navigate to the parent selector, as in the previous one. */
  public parent(): SelectorBuilder<ExtractContextString<GetParentSelector<ExtractBuildContextFromString<TContext>>>> {
    if (this.context.length === 0) {
      throw new Error('No parent selector found');
    }

    const newContext = this.context.slice(0, -1) as GetParentSelector<ExtractBuildContextFromString<TContext>>;

    // TODO: remvoe need for casting
    return new SelectorBuilder(newContext as never, this.postcssRoot);
  }

  /**
   * Navigate back to the root selector
   * Not to be confused with `.root()` which selects the `:root` pseudo-class
   *
   * TODO: This does mess things up with media queries right now. Needs to be fixed
   */
  public main(): SelectorBuilder<ExtractContextString<GetFirstSelector<ExtractBuildContextFromString<TContext>>>> {
    if (this.context.length === 0) {
      throw new Error('No root selector found');
    }

    const newContext = [this.context[0]] as GetFirstSelector<ExtractBuildContextFromString<TContext>>;
    return new SelectorBuilder(newContext as never, this.postcssRoot);
  }
}

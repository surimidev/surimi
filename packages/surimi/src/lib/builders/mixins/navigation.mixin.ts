import type { ExtractBuildContextFromString } from '#types/builder.types';

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
}

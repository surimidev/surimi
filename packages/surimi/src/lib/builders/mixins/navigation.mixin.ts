import type { ExtractBuildContextFromString } from '#types/builder.types';

import { CoreBuilder } from '../core.builder';
import { SelectorBuilder } from '../selector.builder';

export class WithNavigation<TContext extends string> extends CoreBuilder<ExtractBuildContextFromString<TContext>> {
  public child<TChild extends string>(selector: TChild): SelectorBuilder<`${TContext} > ${TChild}`> {
    return new SelectorBuilder<`${TContext} > ${TChild}`>(
      [...this.context, { selector, relation: 'child' }] as any,
      this.postcssRoot,
    );
  }

  public descendant<TDescendant extends string>(selector: TDescendant): SelectorBuilder<`${TContext} ${TDescendant}`> {
    return new SelectorBuilder<`${TContext} ${TDescendant}`>(
      [...this.context, { selector, relation: 'descendant' }] as any,
      this.postcssRoot,
    );
  }

  public adjacent<TAdjacent extends string>(selector: TAdjacent): SelectorBuilder<`${TContext} + ${TAdjacent}`> {
    return new SelectorBuilder<`${TContext} + ${TAdjacent}`>(
      [...this.context, { selector, relation: 'adjacent' }] as any,
      this.postcssRoot,
    );
  }

  public sibling<TSibling extends string>(selector: TSibling): SelectorBuilder<`${TContext} ~ ${TSibling}`> {
    return new SelectorBuilder<`${TContext} ~ ${TSibling}`>(
      [...this.context, { selector, relation: 'sibling' }] as any,
      this.postcssRoot,
    );
  }
}

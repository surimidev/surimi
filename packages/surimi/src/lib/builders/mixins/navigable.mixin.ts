import type { BuilderContext, ExtractContextString } from '#types/builder.types';
import { buildContextString } from '#utils/builder.utils.js';

import type { MixinConstructor } from '.';

export default function NavigableMixin<
  TPContextString extends ExtractContextString<TPContext>,
  TPContext extends BuilderContext,
  TBase extends MixinConstructor<TPContextString, TPContext>,
>(Base: TBase) {
  return class NavigableBuilder extends Base {
    public navigate() {
      return buildContextString(this.context);
    }
  };
}

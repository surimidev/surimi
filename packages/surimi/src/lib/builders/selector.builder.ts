import postcss from 'postcss';

import { Mixins, StylableMixin } from '#lib/builders/mixins';
import type { BuilderContext, ExtractBuildContextFromString, ExtractContextString } from '#types/builder.types';

import { CoreBuilder } from './core.builder';
import NavigableMixin from './mixins/navigable.mixin';

export default class SelectorBuilder<TContextString extends string> extends StylableMixin(NavigableMixin(CoreBuilder)) {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- Not useless! Needed for TS to infer the types correctly
  constructor(context: ExtractBuildContextFromString<TContextString>, postcssRoot: postcss.Root) {
    super(context, postcssRoot);
  }

  public test() {
    return this;
  }
}

const test = new SelectorBuilder<'.button'>([{ selector: '.button' }] as const, postcss.root());

import type postcss from 'postcss';

import type { BuilderContext, ExtractBuildContextFromString } from '#types/builder.types';
import { buildContextString } from '#utils/builder.utils';

/**
 * Core builder class that provides access to the PostCSS root and builder context.
 */
export class CoreBuilder<TContext extends BuilderContext> {
  public context: TContext;
  public postcssRoot: postcss.Root;

  public getContextString() {
    return buildContextString(this.context);
  }

  public constructor(context: TContext, postcssRoot: postcss.Root) {
    this.context = context;
    this.postcssRoot = postcssRoot;
  }
}

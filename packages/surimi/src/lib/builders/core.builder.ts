import type postcss from 'postcss';

import type { BuilderContext } from '#types/builder.types';

/**
 * Core builder class that provides access to the PostCSS root and builder context.
 */
export class CoreBuilder<TContext extends BuilderContext> {
  public context: TContext;
  public postcssRoot: postcss.Root;

  public constructor(context: TContext, postcssRoot: postcss.Root) {
    this.context = context;
    this.postcssRoot = postcssRoot;
  }
}

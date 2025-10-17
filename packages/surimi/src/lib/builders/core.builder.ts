import type postcss from 'postcss';

import type { BuilderContext, ExtractContextString } from '#types/builder.types';

/**
 * Core builder class that provides access to the PostCSS root and builder context.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- TContext is used to show type-hints
export class CoreBuilder<TContextString extends ExtractContextString<TContext>, TContext extends BuilderContext> {
  public context: TContext;
  public postcssRoot: postcss.Root;

  public constructor(context: TContext, postcssRoot: postcss.Root) {
    this.context = context;
    this.postcssRoot = postcssRoot;
  }
}

import type { CoreBuilder } from '#lib/builders/core.builder';
import type { BuilderContext, ExtractContextString } from '#types/builder.types';

export * from './stylable.mixin';

export type MixinConstructor<
  TContextString extends ExtractContextString<TContext>,
  TContext extends BuilderContext,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  TBase = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = new (...args: any[]) => CoreBuilder<TContextString, TContext> & TBase;

/**
 * Mixin function type that takes a base class and returns an extended class
 */
export type MixinFunction<TContextString extends ExtractContextString<TContext>, TContext extends BuilderContext> = <
  TBase extends MixinConstructor<TContextString, TContext>,
>(
  Base: TBase,
) => MixinConstructor<TContextString, TContext, TBase>;

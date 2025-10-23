import type { Tokenize } from '@surimi/parsers';

import type { CoreBuilder } from '#lib/builders/core.builder';

export * from './styling.mixin';
export * from './navigation.mixin';
export * from './pseudo-classes.mixin';
export * from './pseudo-elements.mixin';
export * from './selecting.mixin';
export * from './selector-operations.mixin';

export type MixinConstructor<
  TContext extends string,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- default is anything that can be extended
  TBase = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- typescript mixins only work with an `any` spread constructor
> = new (...args: any[]) => CoreBuilder<Tokenize<TContext>> & TBase;

/**
 * Mixin function type that takes a base class and returns an extended class
 */
export type MixinFunction<TContext extends string> = <TBase extends MixinConstructor<TContext>>(
  Base: TBase,
) => MixinConstructor<TContext, TBase>;

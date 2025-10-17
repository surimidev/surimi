import type { BuilderContext, WithPseudoClass } from '#types';

// interfaces/builder.interfaces.ts
export interface IBuilderCore<TContext extends string> {
  readonly context: BuilderContext<TContext>;
  readonly root: postcss.Root;

  // Internal methods for type safety
  __getContextType(): TContext;
  __cloneWithContext<TNewContext extends string>(newContext: BuilderContext<TNewContext>): IBuilderCore<TNewContext>;
}

export interface IStyleable<TContext extends string> {
  style(properties: CSSProperties): IStyleable<ResetPseudoStates<TContext>>;
}

export interface IPseudoSelectable<TContext extends string> {
  hover(): IPseudoSelectable<WithPseudoClass<TContext, 'hover'>>;
  focus(): IPseudoSelectable<WithPseudoClass<TContext, 'focus'>>;
  active(): IPseudoSelectable<WithPseudoClass<TContext, 'active'>>;
  disabled(): IPseudoSelectable<WithPseudoClass<TContext, 'disabled'>>;

  // Functional pseudo-classes
  is<TSelector extends string>(selector: TSelector): IPseudoSelectable<WithPseudoClass<TContext, `is(${TSelector})`>>;
  not<TSelector extends string>(selector: TSelector): IPseudoSelectable<WithPseudoClass<TContext, `not(${TSelector})`>>;
  has<TSelector extends string>(selector: TSelector): IPseudoSelectable<WithPseudoClass<TContext, `has(${TSelector})`>>;
  where<TSelector extends string>(
    selector: TSelector,
  ): IPseudoSelectable<WithPseudoClass<TContext, `where(${TSelector})`>>;

  // Structural pseudo-classes
  nthChild<TValue extends number | string>(
    value: TValue,
  ): IPseudoSelectable<WithPseudoClass<TContext, `nth-child(${TValue})`>>;
  firstChild(): IPseudoSelectable<WithPseudoClass<TContext, 'first-child'>>;
  lastChild(): IPseudoSelectable<WithPseudoClass<TContext, 'last-child'>>;
  nthOfType<TValue extends number | string>(
    value: TValue,
  ): IPseudoSelectable<WithPseudoClass<TContext, `nth-of-type(${TValue})`>>;

  // Pseudo-elements
  before(): IPseudoSelectable<WithPseudoElement<TContext, 'before'>>;
  after(): IPseudoSelectable<WithPseudoElement<TContext, 'after'>>;
}

export interface INavigable<TContext extends string> {
  parent(): INavigable<ExtractParent<TContext>>;
  root(): INavigable<ExtractRoot<TContext>>;
}

export interface IRelationshipSelectable<TContext extends string> {
  child<TSelector extends SelectorInput>(
    selector: TSelector,
  ): ISelectorBuilder<WithRelationship<TContext, 'child', InferSelectorString<TSelector>>>;

  descendant<TSelector extends SelectorInput>(
    selector: TSelector,
  ): ISelectorBuilder<WithRelationship<TContext, 'descendant', InferSelectorString<TSelector>>>;

  adjacent<TSelector extends SelectorInput>(
    selector: TSelector,
  ): ISelectorBuilder<WithRelationship<TContext, 'adjacent', InferSelectorString<TSelector>>>;

  sibling<TSelector extends SelectorInput>(
    selector: TSelector,
  ): ISelectorBuilder<WithRelationship<TContext, 'sibling', InferSelectorString<TSelector>>>;
}

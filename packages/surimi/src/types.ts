/**
 * Type definitions for Surimi CSS builder.
 *
 * Key architectural patterns:
 * - Interface/Implementation separation: I* interfaces define contracts, classes provide implementation
 * - Immutable builder pattern: Each method returns new instance rather than mutating current one
 * - Context-aware building: BuilderContext carries state through method chains
 * - Generic context tracking: TContext parameter tracks current selector for IntelliSense
 */
import type * as CSS from 'csstype';

export type CSSProperties = CSS.Properties;

/**
 * Core type utilities for selector building and context management
 */

/**
 * Interface that all selector classes must implement
 * This allows unified handling of class and id selectors
 */
export interface ISurimiSelector {
  /** Returns the raw name without prefix (e.g., "button" for class, "header" for id) */
  toString(): string;
  /** Returns the CSS selector string (e.g., ".button", "#header") */
  toSelector(): string;
}

/**
 * Union type for acceptable selector inputs
 */
export type SelectorInput = string | ISurimiSelector;

/**
 * Helper type to normalize selector inputs to strings
 */
export type NormalizedSelector<T> = T extends ISurimiSelector ? string : T;

/**
 * Helper type to convert SelectorInput array to string array for JoinSelectors
 */
export type NormalizeSelectorArray<T extends readonly SelectorInput[]> = {
  readonly [K in keyof T]: NormalizedSelector<T[K]>;
};

// Extract the first/primary selector from a comma-separated list
type ExtractPrimarySelector<T extends string> = T extends `${infer First},${string}` ? First : T;

// Parse pseudo-classes and pseudo-elements from a selector to get base
type ParseSelector<T extends string> = T extends `${infer Base}::${string}`
  ? Base // Handle pseudo-elements first (::)
  : T extends `${infer Base}:${string}`
    ? Base // Then pseudo-classes (:)
    : T;

// Reset to base selector (used after .style() calls)
type ResetToBase<T extends string> = ParseSelector<ExtractPrimarySelector<T>>;

// Join multiple selectors with comma separation
export type JoinSelectors<T extends readonly string[]> = T extends readonly [infer First extends string]
  ? First
  : T extends readonly [infer First extends string, ...infer Rest extends readonly string[]]
    ? `${First}, ${JoinSelectors<Rest>}`
    : never;

/**
 * Context utilities for media queries and selector extraction
 */

// Build unified context that includes selector and media query
export type WithMediaContext<TSelector extends string, TMediaQuery extends string> = `${TSelector} @${TMediaQuery}`;

// Extract selector from context (handles both plain selectors and media contexts)
type ExtractSelector<T extends string> = T extends `${infer Selector} @${string}` ? Selector : T;

/**
 * Selector building utilities
 */

// Build selector with pseudo-class
type WithPseudoClass<TBase extends string, TPseudo extends string> = `${TBase}:${TPseudo}`;

// Build selector with pseudo-element
type WithPseudoElement<TBase extends string, TPseudo extends string> = `${TBase}::${TPseudo}`;

// Build selector with relationship combinator
type WithRelationship<
  TBase extends string,
  TRelation extends string,
  TTarget extends string,
> = TRelation extends 'child'
  ? `${TBase} > ${TTarget}`
  : TRelation extends 'descendant'
    ? `${TBase} ${TTarget}`
    : TRelation extends 'adjacent'
      ? `${TBase} + ${TTarget}`
      : TRelation extends 'sibling'
        ? `${TBase} ~ ${TTarget}`
        : `${TBase} ${TTarget}`;

/**
 * Unified media context handling utility
 */
type WithContextualSelector<
  TContext extends string,
  TNewSelector extends string,
> = TContext extends `${string} @${infer Media}` ? WithMediaContext<TNewSelector, Media> : TNewSelector;

/**
 * Context analysis utilities
 */

// Check if context has media query
export type HasMediaContext<T extends string> = T extends `${string} @${string}` ? true : false;

// Check if context has pseudo-classes or pseudo-elements
export type HasPseudoContext<T extends string> = T extends `${string}:${string}` ? true : false;

/**
 * Unified builder interface - handles both regular selectors and media-scoped selectors
 * TContext tracks the complete context: "selector" or "selector @(media-query)"
 */
export interface ISelectorBuilder<TContext extends string = string> {
  // Style application - resets context to base selector
  style(properties: CSSProperties): ISelectorBuilder<ResetToBase<ExtractSelector<TContext>>>;

  // Pseudo-classes - append to current selector
  hover(): ISelectorBuilder<WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'hover'>>>;
  focus(): ISelectorBuilder<WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'focus'>>>;
  active(): ISelectorBuilder<WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'active'>>>;
  disabled(): ISelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'disabled'>>
  >;

  // Pseudo-elements - append to current selector
  before(): ISelectorBuilder<WithContextualSelector<TContext, WithPseudoElement<ExtractSelector<TContext>, 'before'>>>;
  after(): ISelectorBuilder<WithContextualSelector<TContext, WithPseudoElement<ExtractSelector<TContext>, 'after'>>>;

  // Selector relationships - create new target
  child<TChild extends string>(
    selector: TChild,
  ): ISelectorBuilder<WithContextualSelector<TContext, WithRelationship<ExtractSelector<TContext>, 'child', TChild>>>;
  descendant<TDescendant extends string>(
    selector: TDescendant,
  ): ISelectorBuilder<
    WithContextualSelector<TContext, WithRelationship<ExtractSelector<TContext>, 'descendant', TDescendant>>
  >;

  // Complex selector combinations
  and<TSelector extends string>(
    selector: TSelector,
  ): ISelectorBuilder<WithContextualSelector<TContext, `${ExtractSelector<TContext>}${TSelector}`>>;
  is<TSelector extends string>(
    selector: TSelector,
  ): ISelectorBuilder<WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `is(${TSelector})`>>>;
  where<TSelector extends string>(
    selector: TSelector,
  ): ISelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `where(${TSelector})`>>
  >;
  not<TSelector extends string>(
    selector: TSelector,
  ): ISelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `not(${TSelector})`>>
  >;

  // Combinator selectors
  adjacent<TSelector extends string>(
    selector: TSelector,
  ): ISelectorBuilder<
    WithContextualSelector<TContext, WithRelationship<ExtractSelector<TContext>, 'adjacent', TSelector>>
  >;
  sibling<TSelector extends string>(
    selector: TSelector,
  ): ISelectorBuilder<
    WithContextualSelector<TContext, WithRelationship<ExtractSelector<TContext>, 'sibling', TSelector>>
  >;

  // Advanced pseudo-selectors
  nthChild<TValue extends number | string>(
    value: TValue,
  ): ISelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `nth-child(${TValue})`>>
  >;
  firstChild(): ISelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'first-child'>>
  >;
  lastChild(): ISelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'last-child'>>
  >;
  nthOfType<TValue extends number | string>(
    value: TValue,
  ): ISelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `nth-of-type(${TValue})`>>
  >;

  // Attribute selectors - shows attribute integrated in type for better IntelliSense
  attr<TAttr extends string>(attribute: TAttr): IAttributeBuilder<WithAttributeExistence<TContext, TAttr>, TAttr>;

  // Enhanced navigation
  parent(): ISelectorBuilder<ExtractParentSelector<TContext>>;
  root(): ISelectorBuilder<ExtractRootSelector<TContext>>;
}

/**
 * Fluent media query builder for constructing complex media queries
 * TQuery tracks the current media query conditions for IntelliSense
 */
export interface IMediaQueryBuilder<TQuery extends string = ''> {
  // Fluent media query construction with generic values
  maxWidth<TValue extends string>(
    value: TValue,
  ): IMediaQueryBuilder<TQuery extends '' ? `(max-width: ${TValue})` : `${TQuery} and (max-width: ${TValue})`>;
  minWidth<TValue extends string>(
    value: TValue,
  ): IMediaQueryBuilder<TQuery extends '' ? `(min-width: ${TValue})` : `${TQuery} and (min-width: ${TValue})`>;
  maxHeight<TValue extends string>(
    value: TValue,
  ): IMediaQueryBuilder<TQuery extends '' ? `(max-height: ${TValue})` : `${TQuery} and (max-height: ${TValue})`>;
  minHeight<TValue extends string>(
    value: TValue,
  ): IMediaQueryBuilder<TQuery extends '' ? `(min-height: ${TValue})` : `${TQuery} and (min-height: ${TValue})`>;
  orientation<TValue extends 'landscape' | 'portrait'>(
    value: TValue,
  ): IMediaQueryBuilder<TQuery extends '' ? `(orientation: ${TValue})` : `${TQuery} and (orientation: ${TValue})`>;

  // Combinators
  and(): IMediaQueryBuilder<TQuery>;
  or(): IMediaQueryBuilder<TQuery>;

  // Raw query support for complex cases
  raw<TRaw extends string>(query: TRaw): IMediaQueryBuilder<TRaw>;

  // Select elements within media context - returns unified selector builder
  select<TSelectors extends readonly SelectorInput[]>(
    ...selectors: TSelectors
  ): ISelectorBuilder<WithMediaContext<JoinSelectors<NormalizeSelectorArray<TSelectors>>, TQuery>>;
}

/**
 * Context for building CSS rules
 */
export interface BuilderContext {
  baseSelector: string;
  pseudoClasses: string[];
  pseudoElements: string[];
  mediaQuery?: string | undefined;
}

/**
 * Select function signature supporting multiple selector formats
 * Returns a builder with the joined selectors as the target type
 */
export type SelectFunction = <T extends readonly string[]>(...selectors: T) => ISelectorBuilder<JoinSelectors<T>>;

/**
 * Attribute builder interface for fluent attribute selector building
 * TContext shows the integrated selector context (e.g., "input[data-validate]")
 * TAttribute maintains the attribute name for implementation purposes
 */
export interface IAttributeBuilder<TContext extends string, TAttribute extends string> {
  // Apply attribute existence selector and return to selector builder
  style(properties: CSSProperties): ISelectorBuilder<ResetToBase<ExtractSelector<TContext>>>;

  // Attribute matching methods - all return ISelectorBuilder for consistent API
  equals<TValue extends string>(value: TValue): ISelectorBuilder<WithAttribute<TContext, TAttribute, 'equals', TValue>>;
  startsWith<TValue extends string>(
    value: TValue,
  ): ISelectorBuilder<WithAttribute<TContext, TAttribute, 'starts-with', TValue>>;
  endsWith<TValue extends string>(
    value: TValue,
  ): ISelectorBuilder<WithAttribute<TContext, TAttribute, 'ends-with', TValue>>;
  contains<TValue extends string>(
    value: TValue,
  ): ISelectorBuilder<WithAttribute<TContext, TAttribute, 'contains', TValue>>;

  // Continue building with attribute existence
  hover(): ISelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'hover'>>
  >;
  focus(): ISelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'focus'>>
  >;
  active(): ISelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'active'>>
  >;
  disabled(): ISelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'disabled'>>
  >;

  // Chain more attribute selectors
  attr<TAttr extends string>(attribute: TAttr): IAttributeBuilder<WithAttributeExistence<TContext, TAttribute>, TAttr>;

  // Advanced pseudo-selectors
  nthChild(
    value: number | string,
  ): ISelectorBuilder<
    WithContextualSelector<
      TContext,
      WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, `nth-child(${string})`>
    >
  >;
  firstChild(): ISelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'first-child'>>
  >;
  lastChild(): ISelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'last-child'>>
  >;
  nthOfType(
    value: number | string,
  ): ISelectorBuilder<
    WithContextualSelector<
      TContext,
      WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, `nth-of-type(${string})`>
    >
  >;
}

/**
 * Attribute selector utilities
 */

// Build attribute existence selector [attr]
type WithAttributeExistence<
  TContext extends string,
  TAttribute extends string,
> = TContext extends `${infer Selector} @${infer Media}`
  ? WithMediaContext<`${Selector}[${TAttribute}]`, Media>
  : `${TContext}[${TAttribute}]`;

// Build attribute value selector with operator [attr="value"] or [attr^="value"] etc.
// Replaces existing attribute existence selector with value selector if it exists
type WithAttribute<
  TContext extends string,
  TAttribute extends string,
  TOperator extends string,
  TValue extends string,
> = TContext extends `${infer Selector} @${infer Media}`
  ? WithMediaContext<ReplaceAttributeExistenceWithValue<Selector, TAttribute, TOperator, TValue>, Media>
  : ReplaceAttributeExistenceWithValue<TContext, TAttribute, TOperator, TValue>;

// Replace [attr] with [attr="value"] or append if no existence selector found
type ReplaceAttributeExistenceWithValue<
  TContext extends string,
  TAttribute extends string,
  TOperator extends string,
  TValue extends string,
> = TContext extends `${infer Before}[${TAttribute}]${infer After}`
  ? `${Before}${BuildAttributeSelector<TAttribute, TOperator, TValue>}${After}`
  : `${TContext}${BuildAttributeSelector<TAttribute, TOperator, TValue>}`;

// Build the actual attribute selector syntax
type BuildAttributeSelector<
  TAttribute extends string,
  TOperator extends string,
  TValue extends string,
> = TOperator extends 'equals'
  ? `[${TAttribute}="${TValue}"]`
  : TOperator extends 'starts-with'
    ? `[${TAttribute}^="${TValue}"]`
    : TOperator extends 'ends-with'
      ? `[${TAttribute}$="${TValue}"]`
      : TOperator extends 'contains'
        ? `[${TAttribute}*="${TValue}"]`
        : `[${TAttribute}="${TValue}"]`;

/**
 * Navigation utilities
 */

// Extract parent selector by removing the last relationship combinator
type ExtractParentSelector<TContext extends string> = TContext extends `${infer Parent} > ${string}`
  ? Parent
  : TContext extends `${infer Parent} ${string}`
    ? Parent
    : TContext extends `${infer Parent} + ${string}`
      ? Parent
      : TContext extends `${infer Parent} ~ ${string}`
        ? Parent
        : never;

// Extract root selector recursively by removing all relationships
type ExtractRootSelector<TContext extends string> = TContext extends `${infer Root} > ${string}`
  ? ExtractRootSelector<Root>
  : TContext extends `${infer Root} ${string}`
    ? ExtractRootSelector<Root>
    : TContext extends `${infer Root} + ${string}`
      ? ExtractRootSelector<Root>
      : TContext extends `${infer Root} ~ ${string}`
        ? ExtractRootSelector<Root>
        : TContext;

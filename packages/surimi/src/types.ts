/**
 * Type definitions for Surimi CSS builder.
 *
 * Key architectural patterns:
 * - Interface/Implementation separation: I* interfaces define contracts, classes provide implementation
 * - Immutable builder pattern: Each method returns new instance rather than mutating current one
 * - Context-aware building: BuilderContext carries state through method chains
 * - Generic target tracking: TTarget parameter tracks current selector for IntelliSense
 */
import type * as CSS from 'csstype';

export type CSSProperties = CSS.Properties;

/**
 * Type utilities for selector tracking and IntelliSense enhancement
 */

// Extract the first/primary selector from a comma-separated list
type ExtractPrimarySelector<T extends string> = T extends `${infer First},${string}` ? First : T;

// Parse pseudo-classes and pseudo-elements from a selector
type ParseSelector<T extends string> = T extends `${infer Base}::${string}`
  ? Base // Handle pseudo-elements first (::)
  : T extends `${infer Base}:${string}`
    ? Base // Then pseudo-classes (:)
    : T;

// Build selector with pseudo-class
type WithPseudoClass<TBase extends string, TPseudo extends string> = `${TBase}:${TPseudo}`;

// Build selector with pseudo-element
type WithPseudoElement<TBase extends string, TPseudo extends string> = `${TBase}::${TPseudo}`;

// Build selector with relationship
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

// Reset to base selector (used after .style() calls)
type ResetToBase<T extends string> = ParseSelector<ExtractPrimarySelector<T>>;

// Join multiple selectors with comma separation
export type JoinSelectors<T extends readonly string[]> = T extends readonly [infer First extends string]
  ? First
  : T extends readonly [infer First extends string, ...infer Rest extends readonly string[]]
    ? `${First}, ${JoinSelectors<Rest>}`
    : never;

// Media query type utilities for enhanced IntelliSense
type _ParseMediaQuery<T extends string> =
  // Extract max-width values: (max-width: 768px) -> "≤768px"
  T extends `(max-width: ${infer Value})`
    ? `≤${Value}`
    : // Extract min-width values: (min-width: 1024px) -> "≥1024px"
      T extends `(min-width: ${infer Value})`
      ? `≥${Value}`
      : // Extract max-height values: (max-height: 600px) -> "h≤600px"
        T extends `(max-height: ${infer Value})`
        ? `h≤${Value}`
        : // Extract min-height values: (min-height: 800px) -> "h≥800px"
          T extends `(min-height: ${infer Value})`
          ? `h≥${Value}`
          : // Extract orientation: (orientation: landscape) -> "landscape"
            T extends `(orientation: ${infer Orientation})`
            ? Orientation
            : // Extract aspect-ratio: (aspect-ratio: 16/9) -> "16:9"
              T extends `(aspect-ratio: ${infer Ratio})`
              ? Ratio extends `${infer A}/${infer B}`
                ? `${A}:${B}`
                : Ratio
              : // Simple media types: screen, print, etc.
                T extends `${infer MediaType}`
                ? MediaType
                : // Fallback for complex queries
                  'media';

// Build unified context that includes selector and media query
export type WithMediaContext<TSelector extends string, TMediaQuery extends string> = `${TSelector} @${TMediaQuery}`;

// Extract selector from context (handles both plain selectors and media contexts)
type ExtractSelector<T extends string> = T extends `${infer Selector} @${string}` ? Selector : T;

// Extract media query from context
type _ExtractMediaQuery<T extends string> = T extends `${string} @${infer Media}` ? Media : never;

/**
 * Unified builder interface - handles both regular selectors and media-scoped selectors
 * TContext tracks the complete context: "selector" or "selector @(media-query)"
 */
export interface ISelectorBuilder<TContext extends string = string> {
  // Style application - resets context to base selector
  style(properties: CSSProperties): ISelectorBuilder<ResetToBase<ExtractSelector<TContext>>>;

  // Pseudo-classes - append to current selector
  hover(): ISelectorBuilder<
    TContext extends `${infer Selector} @${infer Media}`
      ? WithMediaContext<WithPseudoClass<Selector, 'hover'>, Media>
      : WithPseudoClass<TContext, 'hover'>
  >;
  focus(): ISelectorBuilder<
    TContext extends `${infer Selector} @${infer Media}`
      ? WithMediaContext<WithPseudoClass<Selector, 'focus'>, Media>
      : WithPseudoClass<TContext, 'focus'>
  >;
  active(): ISelectorBuilder<
    TContext extends `${infer Selector} @${infer Media}`
      ? WithMediaContext<WithPseudoClass<Selector, 'active'>, Media>
      : WithPseudoClass<TContext, 'active'>
  >;
  disabled(): ISelectorBuilder<
    TContext extends `${infer Selector} @${infer Media}`
      ? WithMediaContext<WithPseudoClass<Selector, 'disabled'>, Media>
      : WithPseudoClass<TContext, 'disabled'>
  >;

  // Pseudo-elements - append to current selector
  before(): ISelectorBuilder<
    TContext extends `${infer Selector} @${infer Media}`
      ? WithMediaContext<WithPseudoElement<Selector, 'before'>, Media>
      : WithPseudoElement<TContext, 'before'>
  >;
  after(): ISelectorBuilder<
    TContext extends `${infer Selector} @${infer Media}`
      ? WithMediaContext<WithPseudoElement<Selector, 'after'>, Media>
      : WithPseudoElement<TContext, 'after'>
  >;

  // Selector relationships - create new target
  child<TChild extends string>(
    selector: TChild,
  ): ISelectorBuilder<
    TContext extends `${infer Selector} @${infer Media}`
      ? WithMediaContext<WithRelationship<Selector, 'child', TChild>, Media>
      : WithRelationship<TContext, 'child', TChild>
  >;
  descendant<TDescendant extends string>(
    selector: TDescendant,
  ): ISelectorBuilder<
    TContext extends `${infer Selector} @${infer Media}`
      ? WithMediaContext<WithRelationship<Selector, 'descendant', TDescendant>, Media>
      : WithRelationship<TContext, 'descendant', TDescendant>
  >;
}

// Future expansion will be added here when needed
// Navigation (for Phase 3): parent(), root()
// Combinations (for Phase 2): and(), not(), adjacent(), sibling()

// Extract selector from media context for pseudo-class/element operations
type _ExtractSelectorFromMedia<T extends string> = T extends `${infer Selector} @${string}` ? Selector : T;

// Rebuild media context with updated selector
type _UpdateMediaSelector<T extends string, NewSelector extends string> = T extends `${string} @${infer MediaContext}`
  ? `${NewSelector} @${MediaContext}`
  : NewSelector;

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
  select<TSelectors extends readonly string[]>(...selectors: TSelectors): ISelectorBuilder<WithMediaContext<JoinSelectors<TSelectors>, TQuery>>;
}

/**
 * Global Surimi interface for top-level operations
 */
export interface ISurimiGlobal {
  select<T extends readonly string[]>(...selectors: T): ISelectorBuilder<JoinSelectors<T>>;
  media(): IMediaQueryBuilder;
  media<TQuery extends string>(query: TQuery): IMediaQueryBuilder<TQuery>;
  build(): string;
  clear(): void;
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
export type SelectFunction = <T extends readonly string[]>(
  ...selectors: T
) => ISelectorBuilder<JoinSelectors<T>>;

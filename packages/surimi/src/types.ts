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
 * Union type for acceptable selector inputs
 */
export type SelectorInput = string;

// Join multiple selectors with comma separation
export type JoinSelectors<T extends readonly string[]> = T extends readonly [infer First extends string]
  ? First
  : T extends readonly [infer First extends string, ...infer Rest extends readonly string[]]
    ? `${First}, ${JoinSelectors<Rest>}`
    : never;

// Extract the first/primary selector from a comma-separated list
type ExtractPrimarySelector<T extends string> = T extends `${infer First},${string}` ? First : T;

// Parse pseudo-classes and pseudo-elements from a selector to get base
type ParseSelector<T extends string> = T extends `${infer Base}::${string}`
  ? Base // Handle pseudo-elements first (::)
  : T extends `${infer Base}:${string}`
    ? Base // Then pseudo-classes (:)
    : T;

// Reset to base selector (used after .style() calls)
export type ResetToBase<T extends string> = ParseSelector<ExtractPrimarySelector<T>>;

/**
 * Context utilities for media queries and selector extraction
 */

// Build unified context that includes selector and media query
export type WithMediaContext<TSelector extends string, TMediaQuery extends string> = `${TSelector} @${TMediaQuery}`;

// Extract selector from context (handles both plain selectors and media contexts)
export type ExtractSelector<T extends string> = T extends `${infer Selector} @${string}` ? Selector : T;

/**
 * Selector building utilities
 */

// Build selector with pseudo-class
export type WithPseudoClass<TBase extends string, TPseudo extends string> = `${TBase}:${TPseudo}`;

// Build selector with pseudo-element
export type WithPseudoElement<TBase extends string, TPseudo extends string> = `${TBase}::${TPseudo}`;

// Build selector with relationship combinator
export type WithRelationship<
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
export type WithContextualSelector<
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
 * Attribute selector utilities
 */

// Build attribute existence selector [attr]
export type WithAttributeExistence<
  TContext extends string,
  TAttribute extends string,
> = TContext extends `${infer Selector} @${infer Media}`
  ? WithMediaContext<`${Selector}[${TAttribute}]`, Media>
  : `${TContext}[${TAttribute}]`;

// Build attribute value selector with operator [attr="value"] or [attr^="value"] etc.
// Replaces existing attribute existence selector with value selector if it exists
export type WithAttribute<
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
export type ExtractParentSelector<TContext extends string> = TContext extends `${infer Parent} > ${string}`
  ? Parent
  : TContext extends `${infer Parent} ${string}`
    ? Parent
    : TContext extends `${infer Parent} + ${string}`
      ? Parent
      : TContext extends `${infer Parent} ~ ${string}`
        ? Parent
        : never;

// Extract root selector recursively by removing all relationships
export type ExtractRootSelector<TContext extends string> = TContext extends `${infer Root} > ${string}`
  ? ExtractRootSelector<Root>
  : TContext extends `${infer Root} ${string}`
    ? ExtractRootSelector<Root>
    : TContext extends `${infer Root} + ${string}`
      ? ExtractRootSelector<Root>
      : TContext extends `${infer Root} ~ ${string}`
        ? ExtractRootSelector<Root>
        : TContext;

/**
 * Context for building CSS rules
 */
export interface BuilderContext {
  baseSelector: string;
  pseudoClasses: string[];
  pseudoElements: string[];
  mediaQuery?: string | undefined;
}

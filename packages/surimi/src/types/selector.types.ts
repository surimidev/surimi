/**
 * Types to manage what users can select.
 *
 * This has many types that narrow down what strings can be used to select elements.
 * For example, we don't want users to be able to add pseudo elements to 'select()' calls.
 */

import { SelectorBuilder } from '#lib/builders/selector.builder';

import { HtmlAttributesWithoutBrackets } from './css.types';

/**
 * Type for class selectors (.className)
 */
type ClassSelector = `.${string}`;

/**
 * Type for ID selectors (#idName)
 */
type IdSelector = `#${string}`;

/**
 * Type for HTML element selectors
 */
type TypeSelector = keyof HTMLElementTagNameMap;

/**
 * Type for universal selector
 */
type UniversalSelector = '*';

/**
 * Type for simple attribute selectors [attr]
 * Gives type hints for known HTML attributes, but also allows custom attributes.
 */
type SimpleAttributeSelector = `[${HtmlAttributesWithoutBrackets}]` | (`[${string}]` & {});

/**
 * Type for matching attribute selectors [attr=value], [attr~=value], etc.
 * Gives type hints for known HTML attributes, but also allows custom attributes.
 */
type MatchingAttributeSelector =
  | `[${HtmlAttributesWithoutBrackets | (`${string}` & {})}=${string}]`
  | `[${HtmlAttributesWithoutBrackets | (`${string}` & {})}~=${string}]`
  | `[${HtmlAttributesWithoutBrackets | (`${string}` & {})}|=${string}]`
  | `[${HtmlAttributesWithoutBrackets | (`${string}` & {})}^=${string}]`
  | `[${HtmlAttributesWithoutBrackets | (`${string}` & {})}$=${string}]`
  | `[${HtmlAttributesWithoutBrackets | (`${string}` & {})}*=${string}]`;

/**
 * @deprecated It works, but it seems to be VERY heavy on the CPU right now. Needs to be optimized and tested before using in production
 *
 * A string literal type that only allows valid CSS selectors according to surimi rules.
 *
 * Valid selectors must:
 * - Not contain spaces (no descendant selectors)
 * - Not be combinators (>, +, ~, or space)
 * - Be one of: class selector (.class), ID selector (#id), type selector (div),
 *   universal selector (*), or attribute selector ([attr] or [attr=value])
 * - For attribute selectors, use valid HTML attributes
 *
 * @example
 * ```typescript
 * // Valid selectors - TypeScript will accept these
 * const valid1: ValidSelector = '.my-class'; // ✓ class selector
 * const valid2: ValidSelector = '#my-id'; // ✓ ID selector
 * const valid3: ValidSelector = 'div'; // ✓ type selector
 * const valid4: ValidSelector = '*'; // ✓ universal selector
 * const valid5: ValidSelector = '[disabled]'; // ✓ simple attribute selector
 * const valid6: ValidSelector = '[data-test="value"]'; // ✓ matching attribute selector
 *
 * // Invalid selectors - TypeScript will show errors
 * const invalid1: ValidSelector = 'div p'; // ✗ contains space
 * const invalid2: ValidSelector = '>'; // ✗ combinator
 * const invalid3: ValidSelector = '[invalid-attr]'; // ✗ invalid HTML attribute
 * ```
 */
// TODO: Optimize this type to be less CPU intensive, so we can use it.
// TODO: We might want to limit usage of spaces in, for example, classes. But I didn't find a way to do that yet.
// (except to define a custom alphabet of allowed characters, which is not feasible)
export type ValidSelector =
  | ClassSelector
  | IdSelector
  | TypeSelector
  | UniversalSelector
  | SimpleAttributeSelector
  | MatchingAttributeSelector;

/**
 * Convert a list of selector strings into a list of selector items lik { selector: string}
 */
export type SelectorsAsGroup<TSelectors extends string[]> = {
  [K in keyof TSelectors]: TSelectors[K] extends string ? { selector: TSelectors[K] } : never;
};

export type JoinSelectors<T extends string[]> = T extends []
  ? ''
  : T extends [infer F extends string]
    ? F
    : T extends [infer F extends string, ...infer R extends string[]]
      ? // Filter out empty strings so that ['a', ''] becomes 'a' and not 'a, '
        JoinSelectors<R> extends ''
        ? F
        : F extends ''
          ? JoinSelectors<R>
          : `${F}, ${JoinSelectors<R>}`
      : string;

export type GetSelectorBuilder<T extends string[]> = T extends []
  ? never
  : T extends [infer F extends string]
    ? // Don't allow empty strings for single-item arrays
      F extends ''
      ? never
      : SelectorBuilder<F>
    : T extends [infer F extends string, ...infer R extends string[]]
      ? SelectorBuilder<`[${JoinSelectors<[F, ...R]>}]`>
      : never;

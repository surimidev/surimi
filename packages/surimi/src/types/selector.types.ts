/**
 * Types to manage what users can select.
 *
 * This has many types that narrow down what strings can be used to select elements.
 * For example, we don't want users to be able to add pseudo elements to 'select()' calls.
 */

import type { HtmlAttributesWithoutBrackets } from './css.types';

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
  | `[${HtmlAttributesWithoutBrackets | (string & {})}=${string}]`
  | `[${HtmlAttributesWithoutBrackets | (string & {})}~=${string}]`
  | `[${HtmlAttributesWithoutBrackets | (string & {})}|=${string}]`
  | `[${HtmlAttributesWithoutBrackets | (string & {})}^=${string}]`
  | `[${HtmlAttributesWithoutBrackets | (string & {})}$=${string}]`
  | `[${HtmlAttributesWithoutBrackets | (string & {})}*=${string}]`;

/**
 * A string literal type that gives type hints on CSS selectors.
 *
 * Type hint support includes:
 * - known HTML element names (div, span, etc.)
 * - known HTML attributes in attribute selectors ([href], [data-custom], etc.)
 */
// TODO: note, this is not currently used to restrict users to use only these selectors.
// it is also not checking if users are using nesting, combinators, etc.
export type ValidSelector =
  | ClassSelector
  | IdSelector
  | UniversalSelector
  | TypeSelector
  | SimpleAttributeSelector
  | MatchingAttributeSelector
  | (string & {});

/**
 * Convert a list of selector strings into a list of selector items lik { selector: string}
 */
export type SelectorsAsGroup<TSelectors extends string[]> = {
  [K in keyof TSelectors]: TSelectors[K] extends string ? { selector: TSelectors[K] } : never;
};

/**
 * Join multiple selector strings into a single selector string, separated by commas.
 */
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

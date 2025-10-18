/**
 * Types to manage what users can select.
 *
 * This has many types that narrow down what strings can be used to select elements.
 * For example, we don't want users to be able to add pseudo elements to 'select()' calls.
 */

import { HtmlAttributesWithoutBrackets } from './css.types';

/**
 * Checks if there is any space within the string
 */
export type HasSpaces<T extends string> = T extends `${string} ${string}` ? true : false;

/**
 * Checks if the string is a combinator, i.e., one of '>', '+', '~', or ' ' (space)
 */
export type HasCombinator<T extends string> = T extends `>` | `+` | `~` | ` ` ? true : false;

export type IsClassSelector<T extends string> = T extends `.${string}` ? true : false;
export type IsIdSelector<T extends string> = T extends `#${string}` ? true : false;

export type IsTypeSelector<T extends string> = T extends keyof HTMLElementTagNameMap ? true : false;

// TODO: Technically, there are more like the namespace selectors? But we have to figure out if/how to support them
export type IsUniversalSelector<T extends string> = T extends `*` ? true : false;

// TODO: This does not support sensitivity flags like [attr="value" i]. Or maybe it does?
export type IsValidAttributeName<T extends string> = T extends
  | `[${infer R}]`
  | `[${infer R}=${string}]`
  | `[${infer R}~=${string}]`
  | `[${infer R}|=${string}]`
  | `[${infer R}^=${string}]`
  | `[${infer R}$=${string}]`
  | `[${infer R}*=${string}]`
  ? R extends HtmlAttributesWithoutBrackets
    ? true
    : false
  : false;

export type IsSimpleAttributeSelector<T extends string> = T extends `[${infer R}]`
  ? R extends HtmlAttributesWithoutBrackets
    ? true
    : false
  : false;

export type IsMatchingAttributeSelector<T extends string> =
  T extends `[${string}${'=' | '~=' | '|=' | '^=' | '$=' | '*='}${string}]` ? true : false;

export type IsAttributeSelector<T extends string> =
  IsSimpleAttributeSelector<T> extends false
    ? IsMatchingAttributeSelector<T> extends false
      ? false
      : IsValidAttributeName<T>
    : IsValidAttributeName<T>;

export type IsValidSelector<T extends string> =
  HasSpaces<T> extends true
    ? false
    : HasCombinator<T> extends true
      ? false
      : IsClassSelector<T> extends true
        ? true
        : IsIdSelector<T> extends true
          ? true
          : IsTypeSelector<T> extends true
            ? true
            : IsUniversalSelector<T> extends true
              ? true
              : IsAttributeSelector<T> extends true
                ? true
                : false;

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
 */
type SimpleAttributeSelector = `[${HtmlAttributesWithoutBrackets}]`;

/**
 * Type for matching attribute selectors [attr=value], [attr~=value], etc.
 */
type MatchingAttributeSelector =
  | `[${HtmlAttributesWithoutBrackets}=${string}]`
  | `[${HtmlAttributesWithoutBrackets}~=${string}]`
  | `[${HtmlAttributesWithoutBrackets}|=${string}]`
  | `[${HtmlAttributesWithoutBrackets}^=${string}]`
  | `[${HtmlAttributesWithoutBrackets}$=${string}]`
  | `[${HtmlAttributesWithoutBrackets}*=${string}]`;

/**
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
export type ValidSelector =
  | ClassSelector
  | IdSelector
  | TypeSelector
  | UniversalSelector
  | SimpleAttributeSelector
  | MatchingAttributeSelector;

// Join multiple selectors with comma separation
export type JoinSelectors<T extends ValidSelector[]> = T extends [infer First extends ValidSelector]
  ? First
  : T extends [infer First extends ValidSelector, ...infer Rest extends ValidSelector[]]
    ? `${First}, ${JoinSelectors<Rest>}`
    : never;

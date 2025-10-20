import type csstype from 'csstype';

import type { CustomProperty } from '#lib/api/custom-property';

import type { ExcludeByPattern, IncludeByPattern } from './util.types';

/**
 * Not all at rules are the same. This type represents at rules that contain style rules.
 * These at rules can be nested as well, which is the same as combining them with a logical 'and'.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting/Nesting_at-rules
 */
export type NestableAtRule = Extract<
  csstype.AtRules,
  '@media' | '@supports' | '@layer' | '@scope' | '@container' | '@starting-style'
>;

export type WithoutAtPrefix<T extends string> = T extends `@${infer R}` ? R : T;

/**
 * Names of CSS selector relationships or 'combinators'.
 * Used as clear names within the codebase instead of using the actual symbols.
 * Note that `sibling` refers to the general sibling combinator (`~`), while `adjacent` refers to the next-sibling combinator (`+`).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Subsequent-sibling_combinator
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Next-sibling_combinator
 */
export type SelectorRelationship = 'child' | 'descendant' | 'sibling' | 'adjacent';

/**
 * The spec defines some media descriptors as discrete values, and some as ranged. See
 * See https://drafts.csswg.org/mediaqueries/#media-descriptor-table
 */
export type DiscreteMediaDescriptor =
  | 'any-hover'
  | 'any-pointer'
  | 'color-gamut'
  | 'display-mode'
  | 'dynamic-range'
  | 'environment-blending'
  | 'forced-colors'
  | 'grid'
  | 'hover'
  | 'inverted-colors'
  | 'nav-controls'
  | 'orientation'
  | 'overflow-block'
  | 'overflow-inline'
  | 'pointer'
  | 'prefers-color-scheme'
  | 'prefers-contrast'
  | 'prefers-reduced-data'
  | 'prefers-reduced-motion'
  | 'prefers-reduced-transparency'
  | 'scan'
  | 'scripting'
  | 'update'
  | 'video-color-gamut'
  | 'video-dynamic-range';

/**
 * The spec defines some media descriptors as discrete values, and some as ranged. See
 * See https://drafts.csswg.org/mediaqueries/#media-descriptor-table
 */
export type BaseRangedMediaDescriptor =
  | 'aspect-ratio'
  | 'color'
  | 'color-index'
  | 'device-aspect-ratio'
  | 'device-height'
  | 'device-width'
  | 'height'
  | 'horizontal-viewport-segments'
  | 'monochrome'
  | 'resolution'
  | 'vertical-viewport-segments'
  | 'width';

export type RangedMediaDescriptor =
  | BaseRangedMediaDescriptor
  | `min-${BaseRangedMediaDescriptor}`
  | `max-${BaseRangedMediaDescriptor}`;

export type MediaQueryRangeOperator = '<' | '<=' | '=' | '>=' | '>';
/**
 * All possible media descriptors, including prefixed min- and max- variants for ranged descriptors.
 */
export type MediaDescriptor = DiscreteMediaDescriptor | RangedMediaDescriptor;

export type MediaOperator = 'not' | 'and' | 'only' | 'or';

export type MediaType = 'all' | 'print' | 'screen';

/**
 * An object of CSS properties and their values.
 * Values can be either standard CSS values or custom properties,
 * where custom properties are type-hinted to match the expected type of the CSS property.
 * For example, a CSS property that expects a color will hint custom properties to provide color values.
 * This is not enforced and you can still pass any values or custom properties you want.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Properties
 */
export type CssProperties = {
  [K in keyof csstype.Properties]: csstype.Properties[K] | CustomProperty<csstype.Properties[K]>;
};

/**
 * All known pseudo-elements, including with browser-specific prefixes.
 */
export type AllPseudoElements = IncludeByPattern<csstype.Pseudos, `::${string}`>;

/**
 * All known pseudo-classes, excluding pseudo-elements.
 */
export type AllPseudoClasses = ExcludeByPattern<csstype.Pseudos, `::${string}`>;

export type VendorPrefixPattern =
  | `-webkit-${string}`
  | `-moz-${string}`
  | `-ms-${string}`
  | `-o-${string}`
  | `-khtml-${string}`
  | `-apple-${string}`
  | `-x-moz-${string}`;

/**
 * pseudo-elements without browser-specific prefixes.
 */
export type BasePseudoElements = ExcludeByPattern<
  AllPseudoElements,
  // TODO: Filtering out pseudo classes with parentheses is a potential limitation.
  // CSSType does not list, for example `:has` with parentheses though, so might be fine.
  `::${VendorPrefixPattern}` | `${string}()`
>;

/**
 * pseudo-classes without browser-specific prefixes.
 */
export type BasePseudoClasses = ExcludeByPattern<
  AllPseudoClasses,
  // TODO: Filtering out pseudo classes with parentheses is a potential limitation.
  // CSSType does not list, for example `:has` with parentheses though, so might be fine.
  // TODO: We exclude legacy pseudo elements that should not be targetted via single colon syntax. Is that good?
  `:${VendorPrefixPattern}` | `:${string}()` | `:${'after' | 'before' | 'first-letter' | 'first-line'}`
>;

export type ExcludeBrackets<T extends string> = T extends `[${infer R}]` ? R : T;

/**
 * HTML attributes without the surrounding brackets.
 * E.g., for `[disabled]`, this type would be `disabled`.
 */
export type HtmlAttributesWithoutBrackets = ExcludeBrackets<csstype.HtmlAttributes>;

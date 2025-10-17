import type csstype from 'csstype';

import type { CustomProperty } from '#lib/api/custom-property';

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

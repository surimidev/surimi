import type csstype from 'csstype';

import type { CustomProperty } from '#lib/api/custom-property';

import type { VendorPrefix } from './config.types';

/**
 * Global CSS keywords that are valid for ANY CSS property.
 * These are part of the CSS-wide keywords specification.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units#css-wide_values
 */
export type GlobalCssValue = 'inherit' | 'initial' | 'unset' | 'revert' | 'revert-layer';

/**
 * Strict CSS properties with enhanced type hints.
 * This type extends csstype properties with global CSS keywords for better autocomplete.
 *
 * Each property accepts:
 * - Valid CSS values from csstype (includes all string values, numbers, etc.)
 * - Global CSS keywords (inherit, initial, unset, revert, revert-layer)
 * - CustomProperty instances with type hints
 *
 * Note: This type provides improved autocomplete and documentation but does not
 * restrict invalid values at compile time due to TypeScript's structural typing.
 * It's primarily intended to provide better developer experience through IDE hints.
 *
 * @example
 * ```typescript
 * const styles: StrictCssProperties = {
 *   display: 'flex',     // ✅ Gets autocomplete
 *   color: 'red',        // ✅ Gets autocomplete
 *   margin: 'inherit',   // ✅ Global value
 * };
 * ```
 */
export type StrictCssProperties = {
  [K in keyof csstype.Properties]: csstype.Properties[K] | GlobalCssValue | CustomProperty<csstype.Properties[K]>;
};

/**
 * Type for CSS custom properties (--*).
 * Custom properties can have any name starting with `--` and accept string or number values.
 *
 * @example
 * ```typescript
 * const customProps: StrictCustomProperties = {
 *   '--primary-color': '#6366f1',
 *   '--spacing': '1rem',
 *   '--opacity': 0.8,
 * };
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/--*
 */
export type StrictCustomProperties = Record<`--${string}`, string | number>;

/**
 * Explicitly typed common vendor-prefixed CSS properties.
 * This interface includes the most common vendor prefixes for popular properties.
 */
interface KnownVendorPrefixedProperties {
  // Transform
  '-webkit-transform'?: csstype.Properties['transform'];
  '-moz-transform'?: csstype.Properties['transform'];
  '-ms-transform'?: csstype.Properties['transform'];
  '-o-transform'?: csstype.Properties['transform'];

  // Appearance
  '-webkit-appearance'?: csstype.Properties['appearance'];
  '-moz-appearance'?: csstype.Properties['appearance'];

  // User Select
  '-webkit-user-select'?: csstype.Properties['userSelect'];
  '-moz-user-select'?: csstype.Properties['userSelect'];
  '-ms-user-select'?: csstype.Properties['userSelect'];

  // Box Shadow
  '-webkit-box-shadow'?: csstype.Properties['boxShadow'];
  '-moz-box-shadow'?: csstype.Properties['boxShadow'];

  // Border Radius
  '-webkit-border-radius'?: csstype.Properties['borderRadius'];
  '-moz-border-radius'?: csstype.Properties['borderRadius'];

  // Transition
  '-webkit-transition'?: csstype.Properties['transition'];
  '-moz-transition'?: csstype.Properties['transition'];
  '-o-transition'?: csstype.Properties['transition'];

  // Animation
  '-webkit-animation'?: csstype.Properties['animation'];
  '-moz-animation'?: csstype.Properties['animation'];
  '-o-animation'?: csstype.Properties['animation'];

  // Box Sizing
  '-webkit-box-sizing'?: csstype.Properties['boxSizing'];
  '-moz-box-sizing'?: csstype.Properties['boxSizing'];

  // Flex
  '-webkit-flex'?: csstype.Properties['flex'];
  '-ms-flex'?: csstype.Properties['flex'];

  // Filter
  '-webkit-filter'?: csstype.Properties['filter'];

  // Backdrop Filter
  '-webkit-backdrop-filter'?: csstype.Properties['backdropFilter'];

  // Text Size Adjust
  '-webkit-text-size-adjust'?: string;
  '-moz-text-size-adjust'?: string;
  '-ms-text-size-adjust'?: string;

  // Tap Highlight Color
  '-webkit-tap-highlight-color'?: string;

  // Overflow Scrolling
  '-webkit-overflow-scrolling'?: 'auto' | 'touch';

  // Font Smoothing
  '-webkit-font-smoothing'?: 'auto' | 'none' | 'antialiased' | 'subpixel-antialiased';
  '-moz-osx-font-smoothing'?: 'auto' | 'grayscale';
}

/**
 * Fallback type for any other vendor-prefixed property.
 */
type VendorPrefixedFallback = Partial<Record<`${VendorPrefix}${string}`, string | number>>;

/**
 * Common vendor-prefixed CSS properties with proper typing.
 * This type includes the most common vendor prefixes for popular properties,
 * plus a fallback for any other vendor-prefixed property.
 *
 * @example
 * ```typescript
 * const vendorProps: VendorPrefixedProperties = {
 *   '-webkit-transform': 'rotate(45deg)',
 *   '-moz-appearance': 'none',
 *   '-ms-user-select': 'none',
 * };
 * ```
 */
export type VendorPrefixedProperties = KnownVendorPrefixedProperties & VendorPrefixedFallback;

/**
 * Complete strict CSS properties type combining standard properties,
 * custom properties, and vendor-prefixed properties.
 *
 * This is the main type to use when you want strict type checking for CSS properties.
 *
 * @example
 * ```typescript
 * import type { StrictCssPropertiesFull } from 'surimi';
 *
 * const styles: StrictCssPropertiesFull = {
 *   display: 'flex',
 *   '--primary-color': '#6366f1',
 *   '-webkit-transform': 'scale(1.2)',
 * };
 * ```
 */
export type StrictCssPropertiesFull = StrictCssProperties & StrictCustomProperties & VendorPrefixedProperties;

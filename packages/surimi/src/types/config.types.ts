/**
 * Configuration options for Surimi.
 */
export interface SurimiConfig {
  /**
   * Enable strict CSS property type checking.
   * When enabled, only valid CSS values are accepted (no arbitrary strings).
   * @default false
   */
  strictProperties?: boolean;

  /**
   * Allow custom CSS properties (--*).
   * @default true
   */
  allowCustomProperties?: boolean;

  /**
   * Allow vendor-prefixed CSS properties (-webkit-, -moz-, etc.).
   * @default true
   */
  allowVendorPrefixes?: boolean;
}

/**
 * Vendor prefixes for CSS properties.
 */
export type VendorPrefix = '-webkit-' | '-moz-' | '-ms-' | '-o-' | '-khtml-' | '-apple-' | '-x-moz-';

import type postcss from 'postcss';

import { SurimiBase, SurimiContext } from '#surimi';
import type { CssProperties } from '#types/css.types';
import type { StrictCssPropertiesFull } from '#types/css-strict.types';

/**
 * Builder class for defining reusable styles.
 * This is what's returned from the `style()` API function.
 *
 * Can be used with the `use` method on selector builders to apply the styles.
 *
 * You probably never need to use this class directly, instead use the `style()` API function.
 */
export class Style extends SurimiBase {
  protected _styles: CssProperties = {};

  constructor(root: postcss.Root, initialStyles: CssProperties = {}) {
    super(root);

    this._styles = { ...initialStyles };
  }

  /**
   * Extend the current styles with new styles.
   * Can accept either a plain object or another StyleBuilder instance.
   *
   * Styles will be merged, with new styles overwriting existing ones in case of conflicts.
   */
  public extend(styles: CssProperties | Style) {
    const newStyles = styles instanceof Style ? styles.build() : styles;

    return new Style(this._postcssRoot, { ...this.build(), ...newStyles });
  }

  public build() {
    return this._styles;
  }
}

/**
 * Create a reusable style object.
 *
 * @param styles - CSS properties to define as styles
 * @returns A Style instance that can be used with `.use()` or `.extend()`
 *
 * @example
 * ```typescript
 * const buttonBase = style({
 *   padding: '10px 20px',
 *   borderRadius: '4px',
 * });
 *
 * select('.button').use(buttonBase);
 * ```
 */
export function style(styles: CssProperties): Style;

/**
 * Create a reusable style object with strict type checking.
 *
 * @param styles - Strict CSS properties to define as styles
 * @returns A Style instance that can be used with `.use()` or `.extend()`
 *
 * @example
 * ```typescript
 * import type { StrictCssPropertiesFull } from 'surimi';
 *
 * const buttonBase: StrictCssPropertiesFull = {
 *   display: 'flex', // ✅ Type-safe
 *   padding: '10px',
 * };
 *
 * select('.button').use(style(buttonBase));
 * ```
 */
// eslint-disable-next-line @typescript-eslint/unified-signatures -- Separate overloads for better IDE documentation
export function style(styles: StrictCssPropertiesFull): Style;

export function style(styles: CssProperties | StrictCssPropertiesFull): Style {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime check for safety
  if (styles == null) {
    throw new Error('Styles object cannot be null or undefined.');
  }

  return new Style(SurimiContext.root, styles as CssProperties);
}

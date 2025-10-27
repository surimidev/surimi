import type { CssProperties } from '#types/css.types';

/**
 * Builder class for defining reusable styles.
 * This is what's returned from the `style()` API function.
 *
 * Can be used with the `use` method on selector builders to apply the styles.
 *
 * You probably never need to use this class directly, instead use the `style()` API function.
 */
export class StyleBuilder {
  protected _styles: CssProperties = {};

  constructor(initialStyles: CssProperties = {}) {
    this._styles = { ...initialStyles };
  }

  /**
   * Extend the current styles with new styles.
   * Can accept either a plain object or another StyleBuilder instance.
   *
   * Styles will be merged, with new styles overwriting existing ones in case of conflicts.
   */
  public extend(styles: CssProperties | StyleBuilder) {
    const newStyles = styles instanceof StyleBuilder ? styles.styles : styles;

    return new StyleBuilder({ ...this._styles, ...newStyles });
  }

  public get styles(): CssProperties {
    return this._styles;
  }
}

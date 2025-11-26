import type postcss from 'postcss';

import type { CssProperties } from '@surimi/common';
import { SurimiBase } from '@surimi/common';

/**
 * Builder class for defining reusable styles.
 * This is what's returned from the `style()` API function.
 *
 * Can be used with the `use` method on selector builders to apply the styles.
 *
 * You probably never need to use this class directly, instead use the `style()` API function.
 */
export class StyleBuilder extends SurimiBase<CssProperties> {
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
  public extend(styles: CssProperties | StyleBuilder) {
    const newStyles = styles instanceof StyleBuilder ? styles.build() : styles;

    return new StyleBuilder(this._postcssRoot, { ...this.build(), ...newStyles });
  }

  public build() {
    return this._styles;
  }
}

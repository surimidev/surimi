import type postcss from 'postcss';

import { SurimiBase, SurimiContext } from '#surimi';
import type { CssProperties } from '#types/css.types';

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

export function style(styles: CssProperties): Style {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime check for safety
  if (styles == null) {
    throw new Error('Styles object cannot be null or undefined.');
  }

  return new Style(SurimiContext.root, styles);
}

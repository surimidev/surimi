import type { CssRoot } from '@surimi/ast';
import { SurimiBase } from '@surimi/common';
import type { CssProperties } from '@surimi/common';

export class StyleBuilder extends SurimiBase<CssProperties> {
  protected _styles: CssProperties = {};

  constructor(root: CssRoot, initialStyles: CssProperties = {}) {
    super(root);

    this._styles = { ...initialStyles };
  }

  public extend(styles: CssProperties | StyleBuilder) {
    const newStyles = styles instanceof StyleBuilder ? styles.build() : styles;

    return new StyleBuilder(this._cssRoot, { ...this.build(), ...newStyles });
  }

  public build() {
    return this._styles;
  }
}

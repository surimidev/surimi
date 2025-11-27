import postcss from 'postcss';

import { tokenizeAtRule, type TokenizeAtRule } from '@surimi/parsers';

import { SurimiBase } from '@surimi/common';
import type { FontFaceProperties } from '@surimi/common';
import { createDeclarationsFromProperties } from '#utils/postcss.utils';

import { CoreBuilder } from './core.builder';

/**
 * Used for building @font-face at-rules.
 */
export class FontFaceBuilder extends CoreBuilder<TokenizeAtRule<`@font-face`>> {
  protected _properties: FontFaceProperties;

  constructor(properties: FontFaceProperties, container: postcss.Container, root: postcss.Root) {
    const context = tokenizeAtRule('@font-face');
    super(context, container, root);

    this._properties = properties;

    this.register();
  }

  public register() {
    const rule = postcss.atRule({
      name: 'font-face',
    });

    const declarations = createDeclarationsFromProperties(this._properties);

    rule.nodes = [];
    declarations.forEach(decl => rule.append(decl));

    this._postcssRoot.append(rule);
  }

  /**
   * Returns the font-family name declared in the \@font-face rule.
   * If no font-family is declared, returns an empty string.
   */
  public build(): string {
    const fontFamilyName = this._properties.fontFamily ?? this._properties['font-family'];

    if (fontFamilyName instanceof SurimiBase) {
      return fontFamilyName.build();
    } else if (typeof fontFamilyName === 'string') {
      return fontFamilyName;
    } else {
      return '';
    }
  }
}

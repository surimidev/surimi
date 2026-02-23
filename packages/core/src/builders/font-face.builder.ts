import { atRule, type CssContainer, type CssRoot } from '@surimi/ast';
import { SurimiBase } from '@surimi/common';
import type { FontFaceProperties } from '@surimi/common';
import { tokenizeAtRule, type TokenizeAtRule } from '@surimi/parsers';

import { createDeclarationsFromProperties } from '#utils/css.utils';

import { CoreBuilder } from './core.builder';

export class FontFaceBuilder extends CoreBuilder<TokenizeAtRule<`@font-face`>> {
  protected _properties: FontFaceProperties;

  constructor(properties: FontFaceProperties, container: CssContainer, root: CssRoot) {
    const context = tokenizeAtRule('@font-face');
    super(context, container, root);

    this._properties = properties;

    this.register();
  }

  public register() {
    const atRuleNode = atRule({ name: 'font-face' });
    const declarations = createDeclarationsFromProperties(this._properties);
    declarations.forEach(d => atRuleNode.append(d));
    this._cssRoot.append(atRuleNode);
  }

  public build(): string {
    const fontFamilyName = this._properties.fontFamily ?? this._properties['font-family'];
    if (fontFamilyName instanceof SurimiBase) {
      return fontFamilyName.build();
    }
    if (typeof fontFamilyName === 'string') {
      return fontFamilyName;
    }
    return '';
  }
}

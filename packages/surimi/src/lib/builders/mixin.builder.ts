import { mix } from 'ts-mixer';

import { CoreBuilder } from './core.builder';
import { WithNavigation, WithPseudoClasses, WithPseudoElements, WithSelecting, WithSelectorOperations } from './mixins';
import type { Tokenize } from '@surimi/parsers';
import type { CssProperties } from '#types/css.types';

export interface MixinBuilder<T extends string>
  extends WithNavigation<T>,
    WithPseudoClasses<T>,
    WithPseudoElements<T>,
    WithSelecting<T>,
    WithSelectorOperations<T> {}

/**
 * A builder to create re-usable mixins that can be applied to selectors.
 *
 * Mixins created with this builder can use navigation, pseudo-classes, pseudo-elements,
 * selecting and selector operations, but cannot apply styles directly.
 * Instead, they can be passed to the `use()` method of builders that support styling.
 */
@mix(WithNavigation, WithPseudoClasses, WithPseudoElements, WithSelecting, WithSelectorOperations)
export class MixinBuilder<T extends string> extends CoreBuilder<Tokenize<T>> {
  protected _styles: CssProperties | undefined;

  public style(properties: CssProperties) {
    this._styles = properties;
    return this;
  }

  /**
   * Get the styles defined in this mixin, if any.
   */
  public get styles() {
    return this._styles;
  }
}

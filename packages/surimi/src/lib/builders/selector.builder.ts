import { mix } from 'ts-mixer';

import { CoreBuilder } from './core.builder';
import {
  WithNavigation,
  WithPseudoClasses,
  WithPseudoElements,
  WithSelecting,
  WithStyling,
  WithSelectorOperations,
} from './mixins';
import type { Tokenize } from '@surimi/parsers';
import { StyleBuilder } from './style.builder';
import { MixinBuilder } from './mixin.builder';

export interface SelectorBuilder<T extends string>
  extends WithNavigation<T>,
    WithStyling<T>,
    WithPseudoClasses<T>,
    WithPseudoElements<T>,
    WithSelecting<T>,
    WithSelectorOperations<T> {}

/**
 * The primary way to select things in Surimi.
 * Provides ways to select elements, navigate the DOM, target pseudo-elements, pseudo classes and apply styles.
 *
 * You usually don't instantiate this class directly, but rather start from a helper function like `select()`.
 */
@mix(WithNavigation, WithStyling, WithPseudoClasses, WithPseudoElements, WithSelecting, WithSelectorOperations)
export class SelectorBuilder<T extends string> extends CoreBuilder<Tokenize<T>> {
  /**
   * Apply styles from a StyleBuilder to the current selector.
   *
   * A `styleBuilder` is the return type of the `style()` method from Surimi's API.
   *
   * @example
   * ```ts
   * const buttonStyle = style({
   *   backgroundColor: 'blue',
   *   color: 'white',
   * });
   *
   * select('.button').use(buttonStyle);
   * ```
   */
  public use(usable: StyleBuilder | MixinBuilder<string>) {
    if (usable instanceof StyleBuilder) {
      const styles = usable.styles;

      this.style(styles);
    } else if (usable instanceof MixinBuilder) {
      const styles = usable.styles;

      if (styles) {
        this.style(styles);
      }
    }
  }
}

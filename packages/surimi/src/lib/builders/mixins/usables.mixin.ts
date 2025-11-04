import { _selectByContext } from '#lib/api/select';
import { Style } from '#lib/api/style';

import { MixinBuilder } from '../mixin.builder';
import { WithStyling } from './styling.mixin';

/**
 * Mixin class for builders that support applying reusable styles and mixins.
 * Provides the `use()` method, which allows you to apply styles or mixins from a `StyleBuilder` or `MixinBuilder`
 * to the current selector/context. This enables composition and reuse of style logic across components.
 *
 * Example usage:
 * ```ts
 * const buttonStyle = style({ backgroundColor: 'blue', color: 'white' });
 * select('.button').use(buttonStyle);
 * ```
 */
export abstract class WithUsables<TContext extends string> extends WithStyling<TContext> {
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
  public use(...usables: Array<Style | MixinBuilder<string>>): this {
    for (const usable of usables) {
      if (usable instanceof Style) {
        const styles = usable.build();

        this.style(styles);
      } else if (usable instanceof MixinBuilder) {
        const styles = usable.styles;
        const context = usable.context;

        if (styles) {
          _selectByContext([...this._context, ...context], this._postcssContainer, this._postcssRoot).style(styles);
        }
      }
    }

    return this;
  }
}

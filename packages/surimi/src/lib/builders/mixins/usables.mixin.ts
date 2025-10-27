import { _selectByContext } from '#lib/api/select';

import { MixinBuilder } from '../mixin.builder';
import { StyleBuilder } from '../style.builder';
import { WithStyling } from './styling.mixin';

/**
 * Mixin class for builders that support styling with CSS properties.
 * Responsible for applying styles to the current selector context, including:
 * - Creating the CSS rule and declarations, applying it to the root PostCSS AST
 * - Creating the correct rule, potentially scoped under at rules etc.
 */
export class WithUsables<TContext extends string> extends WithStyling<TContext> {
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
      const context = usable.getMixinContext();

      if (styles) {
        _selectByContext([...this.context, ...context], this.postcssContainer, this.postcssRoot).style(styles);
      }
    }

    return this;
  }
}

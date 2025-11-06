import type { Tokenize } from '@surimi/parsers';

import { Style } from '#lib/api/style';
import type { CssProperties } from '#types/css.types';
import type { StrictCssPropertiesFull } from '#types/css-strict.types';
import { createDeclarations } from '#utils/postcss.utils';

import { CoreBuilder } from '../core.builder';

/**
 * Mixin class for builders that support styling with CSS properties.
 * Responsible for applying styles to the current selector context, including:
 * - Creating the CSS rule and declarations, applying it to the root PostCSS AST
 * - Creating the correct rule, potentially scoped under at rules etc.
 */
export abstract class WithStyling<TContext extends string> extends CoreBuilder<Tokenize<TContext>> {
  /**
   * Apply the given CSS properties to the current selector context.
   * Creates the necessary PostCSS rule and declarations, appending them to the root AST.
   *
   * @param styles - CSS properties or a Style instance
   * @returns The current builder instance for chaining
   *
   * @example
   * ```typescript
   * select('.button').style({
   *   padding: '10px 20px',
   *   backgroundColor: 'blue',
   * });
   * ```
   */
  public style(styles: CssProperties | Style): this;

  /**
   * Apply strict CSS properties to the current selector context.
   *
   * @param styles - Strict CSS properties or a Style instance
   * @returns The current builder instance for chaining
   *
   * @example
   * ```typescript
   * import type { StrictCssPropertiesFull } from 'surimi';
   *
   * const props: StrictCssPropertiesFull = {
   *   display: 'flex', // ✅ Type-safe
   * };
   *
   * select('.button').style(props);
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/unified-signatures -- Separate overloads for better IDE documentation
  public style(styles: StrictCssPropertiesFull | Style): this;

  public style(styles: CssProperties | StrictCssPropertiesFull | Style): this {
    if (styles instanceof Style) {
      this.style(styles.build());
    } else {
      const rule = this.getOrCreateRule();
      const declarations = createDeclarations(styles as CssProperties);
      declarations.forEach(decl => rule.append(decl));
    }

    return this;
  }
}

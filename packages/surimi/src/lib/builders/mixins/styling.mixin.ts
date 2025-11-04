import type { Tokenize } from '@surimi/parsers';

import { Style } from '#lib/api/style';
import type { CssProperties } from '#types/css.types';
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
   */
  public style(styles: CssProperties | Style) {
    if (styles instanceof Style) {
      this.style(styles.build());
    } else {
      const rule = this.getOrCreateRule();
      const declarations = createDeclarations(styles);
      declarations.forEach(decl => rule.append(decl));
    }

    return this;
  }
}

import type { CssProperties } from '@surimi/common';
import type { Tokenize } from '@surimi/parsers';

import { CoreBuilder, StyleBuilder } from '#builders';
import { createDeclarationsFromProperties } from '#utils/css.utils';

/**
 * Mixin class for builders that support styling with CSS properties.
 * Responsible for applying styles to the current selector context, including:
 * - Creating the CSS rule and declarations, applying them to the root CSS AST
 * - Creating the correct rule, potentially scoped under at-rules etc.
 */
export abstract class WithStyling<TContext extends string> extends CoreBuilder<Tokenize<TContext>> {
  /**
   * Apply the given CSS properties to the current selector context.
   * Creates the necessary CSS rule and declarations, appending them to the root AST.
   */
  public style(styles: CssProperties | StyleBuilder) {
    if (styles instanceof StyleBuilder) {
      this.style(styles.build());
    } else {
      const rule = this.getOrCreateRule();
      const declarations = createDeclarationsFromProperties(styles);
      declarations.forEach(decl => rule.append(decl));
    }

    return this;
  }
}

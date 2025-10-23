import type { Tokenize } from '@surimi/parsers';

import type { CssProperties } from '#types/css.types';
import { createDeclarations } from '#utils/postcss.utils';

import { CoreBuilder } from '../core.builder';

/**
 * Mixin class for builders that support styling with CSS properties.
 * Responsible for applying styles to the current selector context, including:
 * - Creating the CSS rule and declarations, applying it to the root PostCSS AST
 * - Creating the correct rule, potentially scoped under at rules etc.
 */
export class WithStyling<TContext extends string> extends CoreBuilder<Tokenize<TContext>> {
  /**
   * Apply the given CSS properties to the current selector context.
   * Creates the necessary PostCSS rule and declarations, appending them to the root AST.
   *
   * @param properties - The CSS properties to apply.
   * @returns The current builder instance for chaining.
   */
  public style(properties: CssProperties) {
    const rule = this.getOrCreateRule();
    const declarations = createDeclarations(properties);
    declarations.forEach(decl => rule.append(decl));

    return this;
  }
}

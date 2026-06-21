import type { CssProperties } from '@surimi/common';
import type { SurimiBase } from '@surimi/common';
import type { Tokenize } from '@surimi/parsers';

import { CoreBuilder } from '#builders/core.builder';
import { StyleBuilder } from '#builders/style.builder';
import { createDeclarationsFromProperties, normalizeVarName } from '#utils/css.utils';

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
      declarations.forEach(decl => {
        rule.append(decl);
      });
    }

    return this;
  }

  /**
   * Set custom property values on the current selector context.
   * Pass token refs as tuples for full typing: `.setVars([[myToken, '#123']])`.
   * Raw `--name` keys also work in the record form.
   */
  public setVars(pairs: readonly (readonly [SurimiBase, string | number])[]): this;
  public setVars(vars: Record<PropertyKey, string | number | SurimiBase>): this;
  public setVars(
    input: Record<PropertyKey, string | number | SurimiBase> | readonly (readonly [SurimiBase, string | number])[],
  ) {
    const styles = Array.isArray(input)
      ? Object.fromEntries(input.map(([key, value]) => [normalizeVarName(key), value]))
      : Object.fromEntries(Object.entries(input).map(([key, value]) => [normalizeVarName(key), value]));

    return this.style(styles as CssProperties);
  }
}

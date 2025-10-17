import postcss from 'postcss';

import type { BuilderContext, ExtractContextString } from '#types/builder.types';
import type { CssProperties } from '#types/css.types';
import { combineSelectors } from '#utils/builder.utils';
import { createDeclarations } from '#utils/postcss.utils';

import type { MixinConstructor } from '.';

/**
 * Mixin class for builders that support styling with CSS properties.
 * Responsible for applying styles to the current selector context, including:
 * - Creating the CSS rule and declarations, applying it to the root PostCSS AST
 * - Creating the correct rule, potentially scoped under at rules etc.
 */
export function StylableMixin<
  TPContextString extends ExtractContextString<TPContext>,
  TPContext extends BuilderContext,
  TBase extends MixinConstructor<TPContextString, TPContext>,
>(Base: TBase) {
  return class StyleableBuilder extends Base {
    /**
     * Get or create the PostCSS rule for the current selector context.
     * Used by the `style()` method to apply CSS properties to the root postcss AST.
     *
     * If no existing rule is found for the current selector context, a new one is created and appended either to the postcss root,
     * or to the newly created at-rule container.
     *
     * Selectors, pseudo classes etc. are combined into a complete selector string.
     * If any at-rule (e.g. media query) is present in the context, the rules are created/scoped automatically
     * using the `getOrCreateAtRules()` method.
     *
     * @returns The PostCSS rule for the current selector context.
     */
    public getOrCreateRule() {
      const completeSelector = combineSelectors(this.context);

      const ruleContainer = this.createAtRule() ?? this.postcssRoot;

      let existingRule = ruleContainer.nodes?.find(
        (node): node is postcss.Rule => node.type === 'rule' && node.selector === completeSelector,
      );

      if (!existingRule) {
        existingRule = postcss.rule({ selector: completeSelector });
        ruleContainer.append(existingRule);
      }

      return existingRule;
    }

    /**
     * Create a nested at-rule based on the current context.
     * If multiple at-rules are present in the context, they will be nested accordingly.
     * Each nestable at-rule can also appear with different parameters, resulting in multiple nested at-rules of the same type.
     *
     * Note: This method creates new at-rules every time it is called. It does not check for existing at-rules in the PostCSS AST.
     * Rules might be nested, and checking if ANY rule with the exact same nesting and parameters exists would be unnecessarily complex.
     * Instead, rules might be merged by PostCSS plugins later in the processing pipeline if needed.
     *
     * Note: Rules are nested in the order they are defined in the context. This might not be what users expect. Users should thus
     * ensure that at-rules are added in the correct order when using the builder.
     *
     * @returns The innermost at-rule created, or `undefined` if no at-rules are present in the context.
     */
    public createAtRule() {
      const contextAtRules = this.context.filter(item => 'atRule' in item);

      if (Object.keys(contextAtRules).length === 0) {
        throw new Error('`getOrCreateAtRules` was called without any at-rules in context. Unsure what to do.');
      }

      // The "innermost" at-rule to nest others into.
      // Starting with the root, all other at-rules will be nested inside this
      // in the order they are defined in the context.
      // TODO: Check if order of at-rules matters? Maybe, we need to reverse them? What do users expect?
      let baseRule: postcss.AtRule | postcss.Root = this.postcssRoot;

      for (const { atRule, params } of contextAtRules) {
        // Remove the `@`
        const pureRuleName = atRule.slice(1);

        const rule = postcss.atRule({ name: pureRuleName, params });
        baseRule.append(rule);
        baseRule = rule;
      }

      if (baseRule instanceof postcss.Root) {
        return undefined;
      }

      return baseRule;
    }

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
  };
}

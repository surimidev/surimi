import postcss from 'postcss';

import type {
  BuilderContext,
  CSSProperties,
  ExtractParentSelector,
  ExtractRootSelector,
  ExtractSelector,
  ResetToBase,
  WithAttribute,
  WithAttributeExistence,
  WithContextualSelector,
  WithPseudoClass,
} from '../types';
import { SelectorBuilder } from './selector.builder';
import { combineSelector, createDeclarations } from './utils';

/**
 * Attribute builder for creating CSS attribute selectors.
 *
 * @template TContext - The current selector context
 * @template TAttribute - The attribute name being targeted
 */
export class AttributeBuilder<TContext extends string, TAttribute extends string> {
  constructor(
    private context: BuilderContext,
    private postcssRoot: postcss.Root,
    private attribute: TAttribute,
  ) {}

  /**
   * Apply CSS properties to the attribute selector
   */
  style(properties: CSSProperties): AttributeBuilder<ResetToBase<ExtractSelector<TContext>>, TAttribute> {
    const rule = this.getOrCreateRule();
    const declarations = createDeclarations(properties);
    declarations.forEach(decl => rule.append(decl));

    return this.createResetInstance();
  }

  /**
   * Create attribute equals selector [attr="value"]
   */
  equals<TValue extends string>(
    value: TValue,
  ): AttributeBuilder<WithAttribute<TContext, TAttribute, 'equals', TValue>, TAttribute> {
    const newSelector = this.buildAttributeSelector('equals', value);
    const newContext = this.updateContextWithAttribute(newSelector);
    return new AttributeBuilder(newContext, this.postcssRoot, this.attribute);
  }

  /**
   * Create attribute starts-with selector [attr^="value"]
   */
  startsWith<TValue extends string>(
    value: TValue,
  ): AttributeBuilder<WithAttribute<TContext, TAttribute, 'starts-with', TValue>, TAttribute> {
    const newSelector = this.buildAttributeSelector('starts-with', value);
    const newContext = this.updateContextWithAttribute(newSelector);
    return new AttributeBuilder(newContext, this.postcssRoot, this.attribute);
  }

  /**
   * Create attribute ends-with selector [attr$="value"]
   */
  endsWith<TValue extends string>(
    value: TValue,
  ): AttributeBuilder<WithAttribute<TContext, TAttribute, 'ends-with', TValue>, TAttribute> {
    const newSelector = this.buildAttributeSelector('ends-with', value);
    const newContext = this.updateContextWithAttribute(newSelector);
    return new AttributeBuilder(newContext, this.postcssRoot, this.attribute);
  }

  /**
   * Create attribute contains selector [attr*="value"]
   */
  contains<TValue extends string>(
    value: TValue,
  ): AttributeBuilder<WithAttribute<TContext, TAttribute, 'contains', TValue>, TAttribute> {
    const newSelector = this.buildAttributeSelector('contains', value);
    const newContext = this.updateContextWithAttribute(newSelector);
    return new AttributeBuilder(newContext, this.postcssRoot, this.attribute);
  }

  /**
   * Add :hover to the attribute selector
   */
  hover(): AttributeBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'hover'>>,
    TAttribute
  > {
    const newContext = this.updateContextWithAttributeExistence();
    return new AttributeBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'hover'],
      },
      this.postcssRoot,
      this.attribute,
    );
  }

  /**
   * Add :focus to the attribute selector
   */
  focus(): AttributeBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'focus'>>,
    TAttribute
  > {
    const newContext = this.updateContextWithAttributeExistence();
    return new AttributeBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'focus'],
      },
      this.postcssRoot,
      this.attribute,
    );
  }

  /**
   * Add :active to the attribute selector
   */
  active(): AttributeBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'active'>>,
    TAttribute
  > {
    const newContext = this.updateContextWithAttributeExistence();
    return new AttributeBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'active'],
      },
      this.postcssRoot,
      this.attribute,
    );
  }

  /**
   * Add :disabled to the attribute selector
   */
  disabled(): AttributeBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'disabled'>>,
    TAttribute
  > {
    const newContext = this.updateContextWithAttributeExistence();
    return new AttributeBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'disabled'],
      },
      this.postcssRoot,
      this.attribute,
    );
  }

  /**
   * Chain another attribute selector
   */
  attr<TAttr extends string>(attribute: TAttr): AttributeBuilder<WithAttributeExistence<TContext, TAttribute>, TAttr> {
    // When chaining to a different attribute, add the new attribute selector directly
    const newContext = {
      ...this.context,
      baseSelector: this.context.baseSelector + `[${attribute}]`,
    };
    return new AttributeBuilder(newContext, this.postcssRoot, attribute);
  }

  /**
   * Add :nth-child() to the attribute selector
   */
  nthChild(
    value: number | string,
  ): AttributeBuilder<
    WithContextualSelector<
      TContext,
      WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, `nth-child(${string})`>
    >,
    TAttribute
  > {
    const newContext = this.updateContextWithAttributeExistence();
    return new AttributeBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, `nth-child(${String(value)})`],
      },
      this.postcssRoot,
      this.attribute,
    );
  }

  /**
   * Add :first-child to the attribute selector
   */
  firstChild(): AttributeBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'first-child'>>,
    TAttribute
  > {
    const newContext = this.updateContextWithAttributeExistence();
    return new AttributeBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'first-child'],
      },
      this.postcssRoot,
      this.attribute,
    );
  }

  /**
   * Add :last-child to the attribute selector
   */
  lastChild(): AttributeBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'last-child'>>,
    TAttribute
  > {
    const newContext = this.updateContextWithAttributeExistence();
    return new AttributeBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'last-child'],
      },
      this.postcssRoot,
      this.attribute,
    );
  }

  /**
   * Add :nth-of-type() to the attribute selector
   */
  nthOfType(
    value: number | string,
  ): AttributeBuilder<
    WithContextualSelector<
      TContext,
      WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, `nth-of-type(${string})`>
    >,
    TAttribute
  > {
    const newContext = this.updateContextWithAttributeExistence();
    return new AttributeBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, `nth-of-type(${String(value)})`],
      },
      this.postcssRoot,
      this.attribute,
    );
  }

  /**
   * Navigate to the parent selector
   */
  parent(): SelectorBuilder<ExtractParentSelector<TContext>> {
    const parentSelector = this.extractParentSelector(this.context.baseSelector);
    if (!parentSelector) {
      throw new Error('No parent selector found');
    }

    const newContext = {
      baseSelector: parentSelector,
      pseudoClasses: [],
      pseudoElements: [],
      mediaQuery: this.context.mediaQuery,
    };
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  /**
   * Navigate to the root selector
   */
  root(): SelectorBuilder<ExtractRootSelector<TContext>> {
    const rootSelector = this.extractRootSelector(this.context.baseSelector);

    // If we're already at root (no relationship combinators), return a new SelectorBuilder
    // with the current context but no pseudo-classes/elements
    if (
      rootSelector === this.context.baseSelector &&
      this.context.pseudoClasses.length === 0 &&
      this.context.pseudoElements.length === 0
    ) {
      const newContext = {
        baseSelector: this.context.baseSelector,
        pseudoClasses: [],
        pseudoElements: [],
        mediaQuery: this.context.mediaQuery,
      };
      return new SelectorBuilder(newContext, this.postcssRoot);
    }

    const newContext = {
      baseSelector: rootSelector,
      pseudoClasses: [],
      pseudoElements: [],
      mediaQuery: this.context.mediaQuery,
    };
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  private extractParentSelector(selector: string): string | null {
    // Handle child combinator: "a > b > c" -> "a > b"
    const childMatch = /^(.+) > [^>+~\s]+$/.exec(selector);
    if (childMatch?.[1]) return childMatch[1];

    // Handle descendant combinator (space): "a b c" -> "a b"
    const descendantMatch = /^(.+) [^>+~\s]+$/.exec(selector);
    if (descendantMatch?.[1]) return descendantMatch[1];

    // Handle adjacent sibling combinator: "a + b + c" -> "a + b"
    const adjacentMatch = /^(.+) \+ [^>+~\s]+$/.exec(selector);
    if (adjacentMatch?.[1]) return adjacentMatch[1];

    // Handle general sibling combinator: "a ~ b ~ c" -> "a ~ b"
    const siblingMatch = /^(.+) ~ [^>+~\s]+$/.exec(selector);
    if (siblingMatch?.[1]) return siblingMatch[1];

    return null;
  }

  private extractRootSelector(selector: string): string {
    // Keep extracting parent until no more parents
    let current = selector;
    let root = current;

    while (current) {
      const parent = this.extractParentSelector(current);
      if (parent) {
        root = parent;
        current = parent;
      } else {
        break;
      }
    }

    return root;
  }

  private buildAttributeSelector(operator: string, value: string): string {
    switch (operator) {
      case 'equals':
        return `[${this.attribute}="${value}"]`;
      case 'starts-with':
        return `[${this.attribute}^="${value}"]`;
      case 'ends-with':
        return `[${this.attribute}$="${value}"]`;
      case 'contains':
        return `[${this.attribute}*="${value}"]`;
      default:
        return `[${this.attribute}="${value}"]`;
    }
  }

  private updateContextWithAttribute(attributeSelector: string): BuilderContext {
    // When we have a specific attribute operator (equals, contains, etc.),
    // it should replace any existence selector for the same attribute
    let baseSelector = this.context.baseSelector;

    // Remove any existing attribute selector for this attribute
    const existencePattern = new RegExp(`\\[${this.attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g');
    baseSelector = baseSelector.replace(existencePattern, '');

    return {
      ...this.context,
      baseSelector: baseSelector + attributeSelector,
    };
  }

  private updateContextWithAttributeExistence(): BuilderContext {
    // Check if we already have any attribute selector for this attribute
    const hasAttributeSelector =
      this.context.baseSelector.includes(`[${this.attribute}]`) ||
      this.context.baseSelector.includes(`[${this.attribute}=`) ||
      this.context.baseSelector.includes(`[${this.attribute}^=`) ||
      this.context.baseSelector.includes(`[${this.attribute}$=`) ||
      this.context.baseSelector.includes(`[${this.attribute}*=`);

    if (hasAttributeSelector) {
      // If we already have an attribute selector, don't add another existence selector
      return this.context;
    }

    return {
      ...this.context,
      baseSelector: this.context.baseSelector + `[${this.attribute}]`,
    };
  }

  private getOrCreateRule(): postcss.Rule {
    // Use the base selector as-is, without adding [attribute] again
    // The attribute selector should already be included in baseSelector
    const completeSelector = combineSelector(
      this.context.baseSelector,
      this.context.pseudoClasses,
      this.context.pseudoElements,
    );

    if (this.context.mediaQuery) {
      return this.getOrCreateMediaRule(completeSelector);
    }

    let existingRule = this.postcssRoot.nodes.find(
      node => node.type === 'rule' && node.selector === completeSelector,
    ) as postcss.Rule | undefined;

    if (!existingRule) {
      existingRule = postcss.rule({ selector: completeSelector });
      this.postcssRoot.append(existingRule);
    }

    return existingRule;
  }

  private getOrCreateMediaRule(selector: string): postcss.Rule {
    if (!this.context.mediaQuery) {
      throw new Error('Media query context is required');
    }

    let mediaRule = this.postcssRoot.nodes.find(
      node => node.type === 'atrule' && node.name === 'media' && node.params === this.context.mediaQuery,
    ) as postcss.AtRule | undefined;

    if (!mediaRule) {
      mediaRule = postcss.atRule({
        name: 'media',
        params: this.context.mediaQuery,
      });
      this.postcssRoot.append(mediaRule);
    }

    let rule = mediaRule.nodes?.find(node => node.type === 'rule' && node.selector === selector) as
      | postcss.Rule
      | undefined;

    if (!rule) {
      rule = postcss.rule({ selector });
      mediaRule.append(rule);
    }

    return rule;
  }

  private createResetInstance(): AttributeBuilder<ResetToBase<ExtractSelector<TContext>>, TAttribute> {
    const newContext = {
      baseSelector: this.context.baseSelector,
      pseudoClasses: [],
      pseudoElements: [],
      mediaQuery: this.context.mediaQuery,
    };
    return new AttributeBuilder(newContext, this.postcssRoot, this.attribute);
  }
}

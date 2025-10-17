import postcss from 'postcss';

import type {
  BuilderContext,
  ExtractParentSelector,
  ExtractRootSelector,
  ExtractSelector,
  SelectorInput,
  WithAttributeExistence,
  WithContextualSelector,
  WithPseudoClass,
  WithPseudoElement,
  WithRelationship,
} from '../types';
import { AttributeBuilder } from './attribute.builder';
import { addPseudoClassToContext, addPseudoElementToContext, StyleMixin } from './mixins';
import { buildSelectorWithRelationship, combineSelector } from './utils';

/**
 * Unified selector builder that handles both regular selectors and media-scoped selectors.
 * The context determines whether we're in a media query or not.
 *
 * @template TContext - Tracks the complete selector context including media queries
 */
export class SelectorBuilder<TContext extends string = string> extends StyleMixin<
  TContext,
  SelectorBuilder<ExtractSelector<TContext>>
> {
  protected context: BuilderContext;
  protected postcssRoot: postcss.Root;

  constructor(context: BuilderContext, postcssRoot: postcss.Root) {
    super();
    this.context = context;
    this.postcssRoot = postcssRoot;
  }

  // Implement StyleMixin abstract methods
  protected createResetInstance(): SelectorBuilder<ExtractSelector<TContext>> {
    const newContext = {
      baseSelector: this.context.baseSelector,
      pseudoClasses: [],
      pseudoElements: [],
      mediaQuery: this.context.mediaQuery,
    };
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  protected getOrCreateRule(): postcss.Rule {
    const completeSelector = combineSelector(
      this.context.baseSelector,
      this.context.pseudoClasses,
      this.context.pseudoElements,
    );

    // Check if rule already exists in the root or media query
    if (this.context.mediaQuery) {
      return this.getOrCreateMediaRule(completeSelector);
    }

    // Look for existing rule with this selector
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

    // Find or create media query
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

    // Find or create rule inside media query
    let rule = mediaRule.nodes?.find(node => node.type === 'rule' && node.selector === selector) as
      | postcss.Rule
      | undefined;

    if (!rule) {
      rule = postcss.rule({ selector });
      mediaRule.append(rule);
    }

    return rule;
  }

  // Pseudo-class methods (using utility functions)
  hover(): SelectorBuilder<WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'hover'>>> {
    return this.addPseudoClass('hover');
  }

  focus(): SelectorBuilder<WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'focus'>>> {
    return this.addPseudoClass('focus');
  }

  active(): SelectorBuilder<WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'active'>>> {
    return this.addPseudoClass('active');
  }

  disabled(): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'disabled'>>
  > {
    return this.addPseudoClass('disabled');
  }

  is<TSelector extends string>(
    selector: TSelector,
  ): SelectorBuilder<WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `is(${TSelector})`>>> {
    return this.addPseudoClass(`is(${selector})`);
  }

  has<TSelector extends string>(
    selector: TSelector,
  ): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `has(${TSelector})`>>
  > {
    return this.addPseudoClass(`has(${selector})`);
  }

  where<TSelector extends string>(
    selector: TSelector,
  ): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `where(${TSelector})`>>
  > {
    return this.addPseudoClass(`where(${selector})`);
  }

  not<TSelector extends string>(
    selector: TSelector,
  ): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `not(${TSelector})`>>
  > {
    return this.addPseudoClass(`not(${selector})`);
  }

  nthChild<TValue extends number | string>(
    value: TValue,
  ): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `nth-child(${TValue})`>>
  > {
    return this.addPseudoClass(`nth-child(${String(value)})`);
  }

  firstChild(): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'first-child'>>
  > {
    return this.addPseudoClass('first-child');
  }

  lastChild(): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'last-child'>>
  > {
    return this.addPseudoClass('last-child');
  }

  nthOfType<TValue extends number | string>(
    value: TValue,
  ): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `nth-of-type(${TValue})`>>
  > {
    return this.addPseudoClass(`nth-of-type(${String(value)})`);
  }

  private addPseudoClass(pseudoClass: string) {
    const newContext = addPseudoClassToContext(this.context, pseudoClass);
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  // Pseudo-element methods (using utility functions)
  before(): SelectorBuilder<WithContextualSelector<TContext, WithPseudoElement<ExtractSelector<TContext>, 'before'>>> {
    return this.addPseudoElement('before');
  }

  after(): SelectorBuilder<WithContextualSelector<TContext, WithPseudoElement<ExtractSelector<TContext>, 'after'>>> {
    return this.addPseudoElement('after');
  }

  private addPseudoElement(pseudoElement: string) {
    const newContext = addPseudoElementToContext(this.context, pseudoElement);
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  // Relationship methods (from RelationshipMixin pattern)
  child<TChild extends SelectorInput>(
    selector: TChild,
  ): SelectorBuilder<WithContextualSelector<TContext, WithRelationship<ExtractSelector<TContext>, 'child', TChild>>> {
    const currentBaseSelector = combineSelector(
      this.context.baseSelector,
      this.context.pseudoClasses,
      this.context.pseudoElements,
    );

    const newSelector = buildSelectorWithRelationship(currentBaseSelector, 'child', selector);
    return this.createChildInstance(newSelector);
  }

  descendant<TDescendant extends SelectorInput>(
    selector: TDescendant,
  ): SelectorBuilder<
    WithContextualSelector<TContext, WithRelationship<ExtractSelector<TContext>, 'descendant', TDescendant>>
  > {
    const currentBaseSelector = combineSelector(
      this.context.baseSelector,
      this.context.pseudoClasses,
      this.context.pseudoElements,
    );

    const newSelector = buildSelectorWithRelationship(currentBaseSelector, 'descendant', selector);
    return this.createChildInstance(newSelector);
  }

  adjacent<TSelector extends string>(
    selector: TSelector,
  ): SelectorBuilder<
    WithContextualSelector<TContext, WithRelationship<ExtractSelector<TContext>, 'adjacent', TSelector>>
  > {
    const currentBaseSelector = combineSelector(
      this.context.baseSelector,
      this.context.pseudoClasses,
      this.context.pseudoElements,
    );

    const newSelector = buildSelectorWithRelationship(currentBaseSelector, 'adjacent', selector);
    return this.createChildInstance(newSelector);
  }

  sibling<TSelector extends string>(
    selector: TSelector,
  ): SelectorBuilder<
    WithContextualSelector<TContext, WithRelationship<ExtractSelector<TContext>, 'sibling', TSelector>>
  > {
    const currentBaseSelector = combineSelector(
      this.context.baseSelector,
      this.context.pseudoClasses,
      this.context.pseudoElements,
    );

    const newSelector = buildSelectorWithRelationship(currentBaseSelector, 'sibling', selector);
    return this.createChildInstance(newSelector);
  }

  and<TSelector extends string>(
    selector: TSelector,
  ): SelectorBuilder<WithContextualSelector<TContext, `${ExtractSelector<TContext>}${TSelector}`>> {
    const newContext = {
      ...this.context,
      baseSelector: this.context.baseSelector + selector,
    };
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  /**
   * Navigate to parent selector - FIXED to go up only one level
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

  root(): SelectorBuilder<ExtractRootSelector<TContext>> {
    const rootSelector = this.extractRootSelector(this.context.baseSelector);

    // If we're already at root (no relationship combinators), return this instance
    if (
      rootSelector === this.context.baseSelector &&
      this.context.pseudoClasses.length === 0 &&
      this.context.pseudoElements.length === 0
    ) {
      return this as SelectorBuilder<ExtractRootSelector<TContext>>;
    }

    const newContext = {
      baseSelector: rootSelector,
      pseudoClasses: [],
      pseudoElements: [],
      mediaQuery: this.context.mediaQuery,
    };
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  private createChildInstance(newSelector: string) {
    const newContext = {
      baseSelector: newSelector,
      pseudoClasses: [],
      pseudoElements: [],
      mediaQuery: this.context.mediaQuery,
    };
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  /**
   * Extract the immediate parent selector (go up only one level)
   */
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

  // Attribute builder
  attr<TAttr extends string>(attribute: TAttr): AttributeBuilder<WithAttributeExistence<TContext, TAttr>, TAttr> {
    // Create a new context with the attribute existence selector already added
    const attributeContext = {
      ...this.context,
      baseSelector: this.context.baseSelector + `[${attribute}]`,
    };
    return new AttributeBuilder(attributeContext, this.postcssRoot, attribute);
  }
}

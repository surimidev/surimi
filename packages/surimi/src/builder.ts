import postcss, { type Declaration } from 'postcss';

import type {
  BuilderContext,
  CSSProperties,
  ExtractParentSelector,
  ExtractRootSelector,
  ExtractSelector,
  JoinSelectors,
  ResetToBase,
  SelectorInput,
  WithAttribute,
  WithAttributeExistence,
  WithContextualSelector,
  WithMediaContext,
  WithPseudoClass,
  WithPseudoElement,
  WithRelationship,
} from './types';

/**
 * CSS generation utilities for PostCSS AST manipulation.
 */

/**
 * Formats a camelCase property name to kebab-case for CSS
 */
function formatPropertyName(property: string): string {
  return property.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Formats a property value to a string suitable for CSS
 */
function formatPropertyValue(value: unknown): string {
  if (typeof value === 'number') {
    return value.toString();
  }
  return String(value);
}

/**
 * Creates PostCSS declaration nodes from CSS properties object
 */
function createDeclarations(properties: CSSProperties): Declaration[] {
  const declarations: Declaration[] = [];

  for (const [property, value] of Object.entries(properties)) {
    if (value !== undefined && value !== null) {
      const formattedProperty = formatPropertyName(property);
      const formattedValue = formatPropertyValue(value);

      const declaration = postcss.decl({
        prop: formattedProperty,
        value: formattedValue,
      });

      declarations.push(declaration);
    }
  }

  return declarations;
}

/**
 * Combines a base selector with pseudo-classes and pseudo-elements
 */
function combineSelector(baseSelector: string, pseudoClasses: string[] = [], pseudoElements: string[] = []): string {
  let selector = baseSelector;

  for (const pseudoClass of pseudoClasses) {
    selector += `:${pseudoClass}`;
  }

  for (const pseudoElement of pseudoElements) {
    selector += `::${pseudoElement}`;
  }

  return selector;
}

/**
 * Builds a selector with a relationship combinator
 */
function buildSelectorWithRelationship(
  baseSelector: string,
  relationship: 'child' | 'descendant' | 'adjacent' | 'sibling',
  targetSelector: string,
): string {
  switch (relationship) {
    case 'child':
      return `${baseSelector} > ${targetSelector}`;
    case 'descendant':
      return `${baseSelector} ${targetSelector}`;
    case 'adjacent':
      return `${baseSelector} + ${targetSelector}`;
    case 'sibling':
      return `${baseSelector} ~ ${targetSelector}`;
    default:
      return `${baseSelector} ${targetSelector}`;
  }
}

/**
 * Unified selector builder that handles both regular selectors and media-scoped selectors.
 * The context determines whether we're in a media query or not.
 *
 * @template TContext - Tracks the complete selector context including media queries
 */
export class SelectorBuilder<TContext extends string = string> {
  constructor(
    private context: BuilderContext,
    private postcssRoot: postcss.Root,
  ) {}

  /**
   * Apply CSS properties to the current selector
   */
  style(properties: CSSProperties): SelectorBuilder<ResetToBase<ExtractSelector<TContext>>> {
    const rule = this.getOrCreateRule();
    const declarations = createDeclarations(properties);
    declarations.forEach(decl => rule.append(decl));

    // Return new instance with reset context (clearing pseudo-classes/elements)
    return this.createResetInstance();
  }

  /**
   * Add :hover pseudo-class to the selector
   */
  hover(): SelectorBuilder<WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'hover'>>> {
    return this.addPseudoClass('hover');
  }

  /**
   * Add :focus pseudo-class to the selector
   */
  focus(): SelectorBuilder<WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'focus'>>> {
    return this.addPseudoClass('focus');
  }

  /**
   * Add :active pseudo-class to the selector
   */
  active(): SelectorBuilder<WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'active'>>> {
    return this.addPseudoClass('active');
  }

  /**
   * Add :disabled pseudo-class to the selector
   */
  disabled(): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'disabled'>>
  > {
    return this.addPseudoClass('disabled');
  }

  /**
   * Add ::before pseudo-element to the selector
   */
  before(): SelectorBuilder<WithContextualSelector<TContext, WithPseudoElement<ExtractSelector<TContext>, 'before'>>> {
    return this.addPseudoElement('before');
  }

  /**
   * Add ::after pseudo-element to the selector
   */
  after(): SelectorBuilder<WithContextualSelector<TContext, WithPseudoElement<ExtractSelector<TContext>, 'after'>>> {
    return this.addPseudoElement('after');
  }

  /**
   * Select direct child elements
   */
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

  /**
   * Select descendant elements
   */
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

  /**
   * Combine with another selector (compound selector)
   */
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
   * Add :is() pseudo-class
   */
  is<TSelector extends string>(
    selector: TSelector,
  ): SelectorBuilder<WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `is(${TSelector})`>>> {
    return this.addPseudoClass(`is(${selector})`);
  }

  /**
   * Add :has() pseudo-class
   */
  has<TSelector extends string>(
    selector: TSelector,
  ): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `has(${TSelector})`>>
  > {
    return this.addPseudoClass(`has(${selector})`);
  }

  /**
   * Add :where() pseudo-class
   */
  where<TSelector extends string>(
    selector: TSelector,
  ): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `where(${TSelector})`>>
  > {
    return this.addPseudoClass(`where(${selector})`);
  }

  /**
   * Add :not() pseudo-class
   */
  not<TSelector extends string>(
    selector: TSelector,
  ): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `not(${TSelector})`>>
  > {
    return this.addPseudoClass(`not(${selector})`);
  }

  /**
   * Select adjacent sibling elements
   */
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

  /**
   * Select general sibling elements
   */
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

  /**
   * Add :nth-child() pseudo-class
   */
  nthChild<TValue extends number | string>(
    value: TValue,
  ): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `nth-child(${TValue})`>>
  > {
    return this.addPseudoClass(`nth-child(${String(value)})`);
  }

  /**
   * Add :first-child pseudo-class
   */
  firstChild(): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'first-child'>>
  > {
    return this.addPseudoClass('first-child');
  }

  /**
   * Add :last-child pseudo-class
   */
  lastChild(): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'last-child'>>
  > {
    return this.addPseudoClass('last-child');
  }

  /**
   * Add :nth-of-type() pseudo-class
   */
  nthOfType<TValue extends number | string>(
    value: TValue,
  ): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `nth-of-type(${TValue})`>>
  > {
    return this.addPseudoClass(`nth-of-type(${String(value)})`);
  }

  /**
   * Create attribute selector builder
   */
  attr<TAttr extends string>(attribute: TAttr): AttributeBuilder<WithAttributeExistence<TContext, TAttr>, TAttr> {
    return new AttributeBuilder(this.context, this.postcssRoot, attribute);
  }

  /**
   * Navigate to parent selector
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
   * Navigate to root selector
   */
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

  private extractParentSelector(selector: string): string | null {
    // Handle child combinator
    const childMatch = /^(.+) > [^>]+$/.exec(selector);
    if (childMatch?.[1]) return childMatch[1];

    // Handle descendant combinator (space)
    const descendantMatch = /^(.+) [^>+~]+$/.exec(selector);
    if (descendantMatch?.[1]) return descendantMatch[1];

    // Handle adjacent sibling combinator
    const adjacentMatch = /^(.+) \+ [^>+~]+$/.exec(selector);
    if (adjacentMatch?.[1]) return adjacentMatch[1];

    // Handle general sibling combinator
    const siblingMatch = /^(.+) ~ [^>+~]+$/.exec(selector);
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

  private addPseudoClass(pseudoClass: string) {
    const newContext = {
      ...this.context,
      pseudoClasses: [...this.context.pseudoClasses, pseudoClass],
    };
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  private addPseudoElement(pseudoElement: string) {
    const newContext = {
      ...this.context,
      pseudoElements: [...this.context.pseudoElements, pseudoElement],
    };
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  private createResetInstance() {
    const newContext = {
      baseSelector: this.context.baseSelector,
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

  private getOrCreateRule(): postcss.Rule {
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
}

/**
 * Fluent media query builder for constructing responsive CSS.
 *
 * @template TQuery - Tracks the current media query conditions for type safety
 */
export class MediaQueryBuilder<TQuery extends string = ''> {
  private conditions: string[] = [];
  private postcssRoot: postcss.Root;

  constructor(root: postcss.Root, initialConditions?: string[]) {
    this.postcssRoot = root;
    this.conditions = initialConditions ?? [];
  }

  /**
   * Add max-width media query condition
   */
  maxWidth(value: string): MediaQueryBuilder {
    const newConditions = [...this.conditions, `(max-width: ${value})`];
    return new MediaQueryBuilder(this.postcssRoot, newConditions);
  }

  /**
   * Add min-width media query condition
   */
  minWidth(value: string): MediaQueryBuilder {
    const newConditions = [...this.conditions, `(min-width: ${value})`];
    return new MediaQueryBuilder(this.postcssRoot, newConditions);
  }

  /**
   * Add max-height media query condition
   */
  maxHeight(value: string): MediaQueryBuilder {
    const newConditions = [...this.conditions, `(max-height: ${value})`];
    return new MediaQueryBuilder(this.postcssRoot, newConditions);
  }

  /**
   * Add min-height media query condition
   */
  minHeight(value: string): MediaQueryBuilder {
    const newConditions = [...this.conditions, `(min-height: ${value})`];
    return new MediaQueryBuilder(this.postcssRoot, newConditions);
  }

  /**
   * Add orientation media query condition
   */
  orientation(value: 'landscape' | 'portrait'): MediaQueryBuilder {
    const newConditions = [...this.conditions, `(orientation: ${value})`];
    return new MediaQueryBuilder(this.postcssRoot, newConditions);
  }

  /**
   * Logical AND operator (implicit in condition chaining)
   */
  and(): this {
    // 'and' is implicit in our conditions array
    return this;
  }

  /**
   * Logical OR operator (for future implementation)
   */
  or(): this {
    // TODO: For now, return this - full OR logic can be implemented later
    return this;
  }

  /**
   * Add a raw media query string
   */
  raw(query: string): MediaQueryBuilder {
    return new MediaQueryBuilder(this.postcssRoot, [query]);
  }

  /**
   * Select elements within this media query context
   */
  select<TSelectors extends readonly SelectorInput[]>(
    ...selectors: TSelectors
  ): SelectorBuilder<WithMediaContext<JoinSelectors<TSelectors>, TQuery>> {
    const mediaQuery = this.buildQuery();
    const joinedSelector = selectors.join(', ');
    const context = {
      baseSelector: joinedSelector,
      pseudoClasses: [],
      pseudoElements: [],
      mediaQuery: mediaQuery,
    };
    return new SelectorBuilder(context, this.postcssRoot);
  }

  private buildQuery(): string {
    return this.conditions.join(' and ');
  }
}

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
  style(properties: CSSProperties): SelectorBuilder<ResetToBase<ExtractSelector<TContext>>> {
    const rule = this.getOrCreateRule();
    const declarations = createDeclarations(properties);
    declarations.forEach(decl => rule.append(decl));

    return this.createResetInstance();
  }

  /**
   * Create attribute equals selector [attr="value"]
   */
  equals<TValue extends string>(value: TValue): SelectorBuilder<WithAttribute<TContext, TAttribute, 'equals', TValue>> {
    const newSelector = this.buildAttributeSelector('equals', value);
    const newContext = this.updateContextWithAttribute(newSelector);
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  /**
   * Create attribute starts-with selector [attr^="value"]
   */
  startsWith<TValue extends string>(
    value: TValue,
  ): SelectorBuilder<WithAttribute<TContext, TAttribute, 'starts-with', TValue>> {
    const newSelector = this.buildAttributeSelector('starts-with', value);
    const newContext = this.updateContextWithAttribute(newSelector);
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  /**
   * Create attribute ends-with selector [attr$="value"]
   */
  endsWith<TValue extends string>(
    value: TValue,
  ): SelectorBuilder<WithAttribute<TContext, TAttribute, 'ends-with', TValue>> {
    const newSelector = this.buildAttributeSelector('ends-with', value);
    const newContext = this.updateContextWithAttribute(newSelector);
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  /**
   * Create attribute contains selector [attr*="value"]
   */
  contains<TValue extends string>(
    value: TValue,
  ): SelectorBuilder<WithAttribute<TContext, TAttribute, 'contains', TValue>> {
    const newSelector = this.buildAttributeSelector('contains', value);
    const newContext = this.updateContextWithAttribute(newSelector);
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  /**
   * Add :hover to the attribute selector
   */
  hover(): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'hover'>>
  > {
    const newContext = this.updateContextWithAttributeExistence();
    return new SelectorBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'hover'],
      },
      this.postcssRoot,
    );
  }

  /**
   * Add :focus to the attribute selector
   */
  focus(): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'focus'>>
  > {
    const newContext = this.updateContextWithAttributeExistence();
    return new SelectorBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'focus'],
      },
      this.postcssRoot,
    );
  }

  /**
   * Add :active to the attribute selector
   */
  active(): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'active'>>
  > {
    const newContext = this.updateContextWithAttributeExistence();
    return new SelectorBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'active'],
      },
      this.postcssRoot,
    );
  }

  /**
   * Add :disabled to the attribute selector
   */
  disabled(): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'disabled'>>
  > {
    const newContext = this.updateContextWithAttributeExistence();
    return new SelectorBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'disabled'],
      },
      this.postcssRoot,
    );
  }

  /**
   * Chain another attribute selector
   */
  attr<TAttr extends string>(attribute: TAttr): AttributeBuilder<WithAttributeExistence<TContext, TAttribute>, TAttr> {
    const newContext = this.updateContextWithAttributeExistence();
    return new AttributeBuilder(newContext, this.postcssRoot, attribute);
  }

  /**
   * Add :nth-child() to the attribute selector
   */
  nthChild(
    value: number | string,
  ): SelectorBuilder<
    WithContextualSelector<
      TContext,
      WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, `nth-child(${string})`>
    >
  > {
    const newContext = this.updateContextWithAttributeExistence();
    return new SelectorBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, `nth-child(${String(value)})`],
      },
      this.postcssRoot,
    );
  }

  /**
   * Add :first-child to the attribute selector
   */
  firstChild(): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'first-child'>>
  > {
    const newContext = this.updateContextWithAttributeExistence();
    return new SelectorBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'first-child'],
      },
      this.postcssRoot,
    );
  }

  /**
   * Add :last-child to the attribute selector
   */
  lastChild(): SelectorBuilder<
    WithContextualSelector<TContext, WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, 'last-child'>>
  > {
    const newContext = this.updateContextWithAttributeExistence();
    return new SelectorBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'last-child'],
      },
      this.postcssRoot,
    );
  }

  /**
   * Add :nth-of-type() to the attribute selector
   */
  nthOfType(
    value: number | string,
  ): SelectorBuilder<
    WithContextualSelector<
      TContext,
      WithPseudoClass<WithAttributeExistence<TContext, TAttribute>, `nth-of-type(${string})`>
    >
  > {
    const newContext = this.updateContextWithAttributeExistence();
    return new SelectorBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, `nth-of-type(${String(value)})`],
      },
      this.postcssRoot,
    );
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
    return {
      ...this.context,
      baseSelector: this.context.baseSelector + attributeSelector,
    };
  }

  private updateContextWithAttributeExistence(): BuilderContext {
    return {
      ...this.context,
      baseSelector: this.context.baseSelector + `[${this.attribute}]`,
    };
  }

  private getOrCreateRule(): postcss.Rule {
    const completeSelector = combineSelector(
      this.context.baseSelector + `[${this.attribute}]`,
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

  private createResetInstance(): SelectorBuilder<ResetToBase<ExtractSelector<TContext>>> {
    const newContext = {
      baseSelector: this.context.baseSelector,
      pseudoClasses: [],
      pseudoElements: [],
      mediaQuery: this.context.mediaQuery,
    };
    return new SelectorBuilder(newContext, this.postcssRoot);
  }
}

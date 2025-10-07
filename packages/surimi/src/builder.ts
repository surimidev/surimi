import postcss from 'postcss';

import { buildSelectorWithRelationship, combineSelector, createDeclarations } from './css-generator';
import type {
  BuilderContext,
  CSSProperties,
  IAttributeBuilder,
  IMediaQueryBuilder,
  ISelectorBuilder,
  JoinSelectors,
  NormalizeSelectorArray,
  SelectorInput,
  WithMediaContext,
} from './types';

/**
 * Utility function to normalize selector inputs to strings
 */
function normalizeSelector(selector: SelectorInput): string {
  return typeof selector === 'string' ? selector : selector.toSelector();
}

/**
 * Unified selector builder that handles both regular selectors and media-scoped selectors
 * The context determines whether we're in a media query or not
 */
export class SelectorBuilder<TContext extends string = string> implements ISelectorBuilder<TContext> {
  constructor(
    private context: BuilderContext,
    private postcssRoot: postcss.Root,
  ) {}

  style(properties: CSSProperties): ISelectorBuilder<TContext> {
    const rule = this.getOrCreateRule();
    const declarations = createDeclarations(properties);
    declarations.forEach(decl => rule.append(decl));

    // Return new instance with reset context (clearing pseudo-classes/elements)
    return this.createResetInstance();
  }

  hover(): ISelectorBuilder<`${TContext}:hover`> {
    return this.addPseudoClass('hover');
  }

  focus(): ISelectorBuilder<`${TContext}:focus`> {
    return this.addPseudoClass('focus');
  }

  active(): ISelectorBuilder<`${TContext}:active`> {
    return this.addPseudoClass('active');
  }

  disabled(): ISelectorBuilder<`${TContext}:disabled`> {
    return this.addPseudoClass('disabled');
  }

  before(): ISelectorBuilder<`${TContext}::before`> {
    return this.addPseudoElement('before');
  }

  after(): ISelectorBuilder<`${TContext}::after`> {
    return this.addPseudoElement('after');
  }

  child(selector: SelectorInput): ISelectorBuilder<`${TContext} > ${string}`> {
    const currentBaseSelector = combineSelector(
      this.context.baseSelector,
      this.context.pseudoClasses,
      this.context.pseudoElements,
    );

    const normalizedSelector = normalizeSelector(selector);
    const newSelector = buildSelectorWithRelationship(currentBaseSelector, 'child', normalizedSelector);
    return this.createChildInstance(newSelector);
  }

  descendant(selector: SelectorInput): ISelectorBuilder<`${TContext} ${string}`> {
    const currentBaseSelector = combineSelector(
      this.context.baseSelector,
      this.context.pseudoClasses,
      this.context.pseudoElements,
    );

    const normalizedSelector = normalizeSelector(selector);
    const newSelector = buildSelectorWithRelationship(currentBaseSelector, 'descendant', normalizedSelector);
    return this.createChildInstance(newSelector);
  }

  // Complex selector combinations
  and(selector: string): ISelectorBuilder<`${TContext}${string}`> {
    const newContext = {
      ...this.context,
      baseSelector: this.context.baseSelector + selector,
    };
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  is(selector: string): ISelectorBuilder<`${TContext}:is(${string})`> {
    return this.addPseudoClass(`is(${selector})`);
  }

  where(selector: string): ISelectorBuilder<`${TContext}:where(${string})`> {
    return this.addPseudoClass(`where(${selector})`);
  }

  not(selector: string): ISelectorBuilder<`${TContext}:not(${string})`> {
    return this.addPseudoClass(`not(${selector})`);
  }

  // Combinator selectors
  adjacent(selector: SelectorInput): ISelectorBuilder<`${TContext} + ${string}`> {
    const currentBaseSelector = combineSelector(
      this.context.baseSelector,
      this.context.pseudoClasses,
      this.context.pseudoElements,
    );

    const normalizedSelector = normalizeSelector(selector);
    const newSelector = buildSelectorWithRelationship(currentBaseSelector, 'adjacent', normalizedSelector);
    return this.createChildInstance(newSelector);
  }

  sibling(selector: SelectorInput): ISelectorBuilder<`${TContext} ~ ${string}`> {
    const currentBaseSelector = combineSelector(
      this.context.baseSelector,
      this.context.pseudoClasses,
      this.context.pseudoElements,
    );

    const normalizedSelector = normalizeSelector(selector);
    const newSelector = buildSelectorWithRelationship(currentBaseSelector, 'sibling', normalizedSelector);
    return this.createChildInstance(newSelector);
  }

  // Advanced pseudo-selectors
  nthChild(value: number | string): ISelectorBuilder<`${TContext}:nth-child(${string})`> {
    return this.addPseudoClass(`nth-child(${String(value)})`);
  }

  firstChild(): ISelectorBuilder<`${TContext}:first-child`> {
    return this.addPseudoClass('first-child');
  }

  lastChild(): ISelectorBuilder<`${TContext}:last-child`> {
    return this.addPseudoClass('last-child');
  }

  nthOfType(value: number | string): ISelectorBuilder<`${TContext}:nth-of-type(${string})`> {
    return this.addPseudoClass(`nth-of-type(${String(value)})`);
  }

  // Attribute selectors
  attr(attribute: string) {
    return new AttributeBuilder(this.context, this.postcssRoot, attribute);
  }

  // Enhanced navigation
  parent(): ISelectorBuilder {
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

  root(): ISelectorBuilder {
    const rootSelector = this.extractRootSelector(this.context.baseSelector);

    // If we're already at root (no relationship combinators), return this instance
    if (
      rootSelector === this.context.baseSelector &&
      this.context.pseudoClasses.length === 0 &&
      this.context.pseudoElements.length === 0
    ) {
      return this;
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
 * Fluent media query builder for constructing media queries
 */
export class MediaQueryBuilder<TQuery extends string = ''> implements IMediaQueryBuilder<TQuery> {
  private conditions: string[] = [];
  private postcssRoot: postcss.Root;

  constructor(root: postcss.Root, initialConditions?: string[]) {
    this.postcssRoot = root;
    this.conditions = initialConditions ?? [];
  }

  maxWidth(value: string): IMediaQueryBuilder {
    const newConditions = [...this.conditions, `(max-width: ${value})`];
    return new MediaQueryBuilder(this.postcssRoot, newConditions);
  }

  minWidth(value: string): IMediaQueryBuilder {
    const newConditions = [...this.conditions, `(min-width: ${value})`];
    return new MediaQueryBuilder(this.postcssRoot, newConditions);
  }

  maxHeight(value: string): IMediaQueryBuilder {
    const newConditions = [...this.conditions, `(max-height: ${value})`];
    return new MediaQueryBuilder(this.postcssRoot, newConditions);
  }

  minHeight(value: string): IMediaQueryBuilder {
    const newConditions = [...this.conditions, `(min-height: ${value})`];
    return new MediaQueryBuilder(this.postcssRoot, newConditions);
  }

  orientation(value: 'landscape' | 'portrait'): IMediaQueryBuilder {
    const newConditions = [...this.conditions, `(orientation: ${value})`];
    return new MediaQueryBuilder(this.postcssRoot, newConditions);
  }

  and(): IMediaQueryBuilder<TQuery> {
    // 'and' is implicit in our conditions array
    return this;
  }

  or(): IMediaQueryBuilder<TQuery> {
    // TODO: For now, return this - full OR logic can be implemented later
    return this;
  }

  raw(query: string): IMediaQueryBuilder {
    return new MediaQueryBuilder(this.postcssRoot, [query]);
  }

  select<TSelectors extends readonly SelectorInput[]>(
    ...selectors: TSelectors
  ): ISelectorBuilder<WithMediaContext<JoinSelectors<NormalizeSelectorArray<TSelectors>>, TQuery>> {
    const mediaQuery = this.buildQuery();
    // Normalize selector inputs to strings
    const normalizedSelectors = selectors.map(selector => normalizeSelector(selector));
    const joinedSelector = normalizedSelectors.join(', ');
    const context = {
      baseSelector: joinedSelector,
      pseudoClasses: [],
      pseudoElements: [],
      mediaQuery: mediaQuery,
    };
    return new SelectorBuilder(context, this.postcssRoot) as ISelectorBuilder<
      WithMediaContext<JoinSelectors<NormalizeSelectorArray<TSelectors>>, TQuery>
    >;
  }

  private buildQuery(): string {
    return this.conditions.join(' and ');
  }
}

/**
 * Attribute builder for creating attribute selectors
 */
export class AttributeBuilder<TContext extends string, TAttribute extends string>
  implements IAttributeBuilder<TContext, TAttribute>
{
  constructor(
    private context: BuilderContext,
    private postcssRoot: postcss.Root,
    private attribute: TAttribute,
  ) {}

  style(properties: CSSProperties): ISelectorBuilder {
    const rule = this.getOrCreateRule();
    const declarations = createDeclarations(properties);
    declarations.forEach(decl => rule.append(decl));

    return this.createResetInstance();
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- needed for proper type hints
  equals<TValue extends string>(value: TValue): ISelectorBuilder {
    const newSelector = this.buildAttributeSelector('equals', value);
    const newContext = this.updateContextWithAttribute(newSelector);
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- needed for proper type hints
  startsWith<TValue extends string>(value: TValue): ISelectorBuilder {
    const newSelector = this.buildAttributeSelector('starts-with', value);
    const newContext = this.updateContextWithAttribute(newSelector);
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- needed for proper type hints
  endsWith<TValue extends string>(value: TValue): ISelectorBuilder {
    const newSelector = this.buildAttributeSelector('ends-with', value);
    const newContext = this.updateContextWithAttribute(newSelector);
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- needed for proper type hints
  contains<TValue extends string>(value: TValue): ISelectorBuilder {
    const newSelector = this.buildAttributeSelector('contains', value);
    const newContext = this.updateContextWithAttribute(newSelector);
    return new SelectorBuilder(newContext, this.postcssRoot);
  }

  // Continue building with attribute existence
  hover(): ISelectorBuilder {
    const newContext = this.updateContextWithAttributeExistence();
    return new SelectorBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'hover'],
      },
      this.postcssRoot,
    );
  }

  focus(): ISelectorBuilder {
    const newContext = this.updateContextWithAttributeExistence();
    return new SelectorBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'focus'],
      },
      this.postcssRoot,
    );
  }

  active(): ISelectorBuilder {
    const newContext = this.updateContextWithAttributeExistence();
    return new SelectorBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'active'],
      },
      this.postcssRoot,
    );
  }

  disabled(): ISelectorBuilder {
    const newContext = this.updateContextWithAttributeExistence();
    return new SelectorBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'disabled'],
      },
      this.postcssRoot,
    );
  }

  attr<TAttr extends string>(attribute: TAttr) {
    const newContext = this.updateContextWithAttributeExistence();
    return new AttributeBuilder(newContext, this.postcssRoot, attribute);
  }

  // Advanced pseudo-selectors
  nthChild(value: number | string): ISelectorBuilder {
    const newContext = this.updateContextWithAttributeExistence();
    return new SelectorBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, `nth-child(${String(value)})`],
      },
      this.postcssRoot,
    );
  }

  firstChild(): ISelectorBuilder {
    const newContext = this.updateContextWithAttributeExistence();
    return new SelectorBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'first-child'],
      },
      this.postcssRoot,
    );
  }

  lastChild(): ISelectorBuilder {
    const newContext = this.updateContextWithAttributeExistence();
    return new SelectorBuilder(
      {
        ...newContext,
        pseudoClasses: [...newContext.pseudoClasses, 'last-child'],
      },
      this.postcssRoot,
    );
  }

  nthOfType(value: number | string): ISelectorBuilder {
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

  private createResetInstance(): ISelectorBuilder {
    const newContext = {
      baseSelector: this.context.baseSelector,
      pseudoClasses: [],
      pseudoElements: [],
      mediaQuery: this.context.mediaQuery,
    };
    return new SelectorBuilder(newContext, this.postcssRoot);
  }
}

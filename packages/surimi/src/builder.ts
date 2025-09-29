import postcss from 'postcss';

import { buildSelectorWithRelationship, combineSelector, createDeclarations } from './css-generator';
import type { BuilderContext, CSSProperties, IMediaQueryBuilder, ISelectorBuilder, JoinSelectors, WithMediaContext } from './types';

/**
 * Unified selector builder that handles both regular selectors and media-scoped selectors
 * The context determines whether we're in a media query or not
 */
export class SelectorBuilder<TContext extends string = string> implements ISelectorBuilder<TContext> {
  constructor(
    private context: BuilderContext,
    private root: postcss.Root,
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

  child(selector: string): ISelectorBuilder<`${TContext} > ${string}`> {
    const currentBaseSelector = combineSelector(
      this.context.baseSelector,
      this.context.pseudoClasses,
      this.context.pseudoElements,
    );

    const newSelector = buildSelectorWithRelationship(currentBaseSelector, 'child', selector);
    return this.createChildInstance(newSelector);
  }

  descendant(selector: string): ISelectorBuilder<`${TContext} ${string}`> {
    const currentBaseSelector = combineSelector(
      this.context.baseSelector,
      this.context.pseudoClasses,
      this.context.pseudoElements,
    );

    const newSelector = buildSelectorWithRelationship(currentBaseSelector, 'descendant', selector);
    return this.createChildInstance(newSelector);
  }

  private addPseudoClass(pseudoClass: string) {
    const newContext = {
      ...this.context,
      pseudoClasses: [...this.context.pseudoClasses, pseudoClass],
    };
    return new SelectorBuilder(newContext, this.root);
  }

  private addPseudoElement(pseudoElement: string) {
    const newContext = {
      ...this.context,
      pseudoElements: [...this.context.pseudoElements, pseudoElement],
    };
    return new SelectorBuilder(newContext, this.root);
  }

  private createResetInstance() {
    const newContext = {
      baseSelector: this.context.baseSelector,
      pseudoClasses: [],
      pseudoElements: [],
      mediaQuery: this.context.mediaQuery,
    };
    return new SelectorBuilder(newContext, this.root);
  }

  private createChildInstance(newSelector: string) {
    const newContext = {
      baseSelector: newSelector,
      pseudoClasses: [],
      pseudoElements: [],
      mediaQuery: this.context.mediaQuery,
    };
    return new SelectorBuilder(newContext, this.root);
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
    let existingRule = this.root.nodes.find(node => node.type === 'rule' && node.selector === completeSelector) as
      | postcss.Rule
      | undefined;

    if (!existingRule) {
      existingRule = postcss.rule({ selector: completeSelector });
      this.root.append(existingRule);
    }

    return existingRule;
  }

  private getOrCreateMediaRule(selector: string): postcss.Rule {
    if (!this.context.mediaQuery) {
      throw new Error('Media query context is required');
    }

    // Find or create media query
    let mediaRule = this.root.nodes.find(
      node => node.type === 'atrule' && node.name === 'media' && node.params === this.context.mediaQuery,
    ) as postcss.AtRule | undefined;

    if (!mediaRule) {
      mediaRule = postcss.atRule({
        name: 'media',
        params: this.context.mediaQuery,
      });
      this.root.append(mediaRule);
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
  private root: postcss.Root;

  constructor(root: postcss.Root, initialConditions?: string[]) {
    this.root = root;
    this.conditions = initialConditions ?? [];
  }

  maxWidth(value: string): IMediaQueryBuilder {
    const newConditions = [...this.conditions, `(max-width: ${value})`];
    return new MediaQueryBuilder(this.root, newConditions);
  }

  minWidth(value: string): IMediaQueryBuilder {
    const newConditions = [...this.conditions, `(min-width: ${value})`];
    return new MediaQueryBuilder(this.root, newConditions);
  }

  maxHeight(value: string): IMediaQueryBuilder {
    const newConditions = [...this.conditions, `(max-height: ${value})`];
    return new MediaQueryBuilder(this.root, newConditions);
  }

  minHeight(value: string): IMediaQueryBuilder {
    const newConditions = [...this.conditions, `(min-height: ${value})`];
    return new MediaQueryBuilder(this.root, newConditions);
  }

  orientation(value: 'landscape' | 'portrait'): IMediaQueryBuilder {
    const newConditions = [...this.conditions, `(orientation: ${value})`];
    return new MediaQueryBuilder(this.root, newConditions);
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
    return new MediaQueryBuilder(this.root, [query]);
  }

  select<TSelectors extends readonly string[]>(...selectors: TSelectors): ISelectorBuilder<WithMediaContext<JoinSelectors<TSelectors>, TQuery>> {
    const mediaQuery = this.buildQuery();
    const joinedSelector = selectors.join(', ');
    const context = {
      baseSelector: joinedSelector,
      pseudoClasses: [],
      pseudoElements: [],
      mediaQuery: mediaQuery,
    };
    return new SelectorBuilder(context, this.root) as ISelectorBuilder<WithMediaContext<JoinSelectors<TSelectors>, TQuery>>;
  }

  private buildQuery(): string {
    return this.conditions.join(' and ');
  }
}

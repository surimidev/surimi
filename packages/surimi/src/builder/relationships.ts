import type postcss from 'postcss';

import type {
  BuilderContext,
  ExtractParentSelector,
  ExtractRootSelector,
  ExtractSelector,
  SelectorInput,
  WithContextualSelector,
  WithRelationship,
} from '../types';
import { buildSelectorWithRelationship, combineSelector } from './utils';

/**
 * Base mixin for relationship and navigation functionality
 */
export abstract class RelationshipMixin<TContext extends string = string> {
  protected abstract context: BuilderContext;
  protected abstract postcssRoot: postcss.Root;
  protected abstract createNewInstance<TNewContext extends string>(
    newContext: BuilderContext,
  ): RelationshipMixin<TNewContext>;
  protected abstract createChildInstance<TNewContext extends string>(
    newSelector: string,
  ): RelationshipMixin<TNewContext>;

  /**
   * Select direct child elements
   */
  child<TChild extends SelectorInput>(
    selector: TChild,
  ): RelationshipMixin<WithContextualSelector<TContext, WithRelationship<ExtractSelector<TContext>, 'child', TChild>>> {
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
  ): RelationshipMixin<
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
   * Select adjacent sibling elements
   */
  adjacent<TSelector extends string>(
    selector: TSelector,
  ): RelationshipMixin<
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
  ): RelationshipMixin<
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
   * Combine with another selector (compound selector)
   */
  and<TSelector extends string>(
    selector: TSelector,
  ): RelationshipMixin<WithContextualSelector<TContext, `${ExtractSelector<TContext>}${TSelector}`>> {
    const newContext = {
      ...this.context,
      baseSelector: this.context.baseSelector + selector,
    };
    return this.createNewInstance(newContext);
  }

  /**
   * Navigate to parent selector - FIXED to go up only one level
   */
  parent(): RelationshipMixin<ExtractParentSelector<TContext>> {
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
    return this.createNewInstance(newContext);
  }

  /**
   * Navigate to root selector
   */
  root(): RelationshipMixin<ExtractRootSelector<TContext>> {
    const rootSelector = this.extractRootSelector(this.context.baseSelector);

    // If we're already at root (no relationship combinators), return this instance
    if (
      rootSelector === this.context.baseSelector &&
      this.context.pseudoClasses.length === 0 &&
      this.context.pseudoElements.length === 0
    ) {
      return this as RelationshipMixin<ExtractRootSelector<TContext>>;
    }

    const newContext = {
      baseSelector: rootSelector,
      pseudoClasses: [],
      pseudoElements: [],
      mediaQuery: this.context.mediaQuery,
    };
    return this.createNewInstance(newContext);
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
}

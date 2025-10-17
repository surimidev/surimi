import type postcss from 'postcss';

import type { JoinSelectors, SelectorInput } from '../types';
import { SelectorBuilder } from './selector.builder';

/**
 * Fluent media query builder for constructing responsive CSS.
 */
export class MediaQueryBuilder<TQuery extends string = string> {
  private conditions: string[] = [];
  private postcssRoot: postcss.Root;

  constructor(root: postcss.Root, initialConditions?: string[]) {
    this.postcssRoot = root;
    this.conditions = initialConditions ?? [];
  }

  /**
   * Add max-width media query condition
   */
  maxWidth<TValue extends string>(
    value: TValue,
  ): MediaQueryBuilder<TQuery extends '' ? `(max-width: ${TValue})` : `${TQuery} and (max-width: ${TValue})`> {
    const newConditions = [...this.conditions, `(max-width: ${value})`];
    return new MediaQueryBuilder(this.postcssRoot, newConditions);
  }

  /**
   * Add min-width media query condition
   */
  minWidth<TValue extends string>(
    value: TValue,
  ): MediaQueryBuilder<TQuery extends '' ? `(min-width: ${TValue})` : `${TQuery} and (min-width: ${TValue})`> {
    const newConditions = [...this.conditions, `(min-width: ${value})`];
    return new MediaQueryBuilder(this.postcssRoot, newConditions);
  }

  /**
   * Add max-height media query condition
   */
  maxHeight<TValue extends string>(
    value: TValue,
  ): MediaQueryBuilder<TQuery extends '' ? `(max-height: ${TValue})` : `${TQuery} and (max-height: ${TValue})`> {
    const newConditions = [...this.conditions, `(max-height: ${value})`];
    return new MediaQueryBuilder(this.postcssRoot, newConditions);
  }

  /**
   * Add min-height media query condition
   */
  minHeight<TValue extends string>(
    value: TValue,
  ): MediaQueryBuilder<TQuery extends '' ? `(min-height: ${TValue})` : `${TQuery} and (min-height: ${TValue})`> {
    const newConditions = [...this.conditions, `(min-height: ${value})`];
    return new MediaQueryBuilder(this.postcssRoot, newConditions);
  }

  /**
   * Add orientation media query condition
   */
  orientation<TValue extends 'landscape' | 'portrait'>(
    value: TValue,
  ): MediaQueryBuilder<TQuery extends '' ? `(orientation: ${TValue})` : `${TQuery} and (orientation: ${TValue})`> {
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
  raw<T extends string>(query: T): MediaQueryBuilder<T> {
    return new MediaQueryBuilder(this.postcssRoot, [query]);
  }

  /**
   * Select elements within this media query context
   */
  select<T extends readonly SelectorInput[]>(
    ...selectors: T
  ): SelectorBuilder<TQuery extends string ? `@media ${TQuery} ${JoinSelectors<T>}` : JoinSelectors<T>> {
    const mediaQuery = this.buildQuery();
    const joinedSelector = selectors.join(', ');

    // Create a media-aware context for the selector builder
    const context = {
      baseSelector: joinedSelector,
      pseudoClasses: [],
      pseudoElements: [],
      mediaQuery,
    };

    return new SelectorBuilder(context, this.postcssRoot);
  }

  /**
   * Get the built media query string and root for SelectorBuilder to use
   * This allows SelectorBuilder to handle the select() logic
   */
  getConfig(): { query: string; root: postcss.Root } {
    return {
      query: this.buildQuery(),
      root: this.postcssRoot,
    };
  }

  private buildQuery(): string {
    return this.conditions.join(' and ');
  }
}

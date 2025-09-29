import postcss from 'postcss';

import { MediaQueryBuilder, SelectorBuilder } from '#builder';
import { joinSelectors } from '#css-generator';
import type { IMediaQueryBuilder, ISelectorBuilder, JoinSelectors } from '#types';

/**
 * Surimi CSS builder with global stylesheet management
 *
 * Provides a singleton pattern for managing CSS generation across multiple files.
 * Uses PostCSS internally for efficient CSS AST manipulation and generation.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class Surimi {
  private static root: postcss.Root = postcss.root();
  private static selectors = new Map<string, ISelectorBuilder>();

  /**
   * Create a selector builder for the given selectors
   */
  static select<T extends readonly string[]>(...selectors: T): ISelectorBuilder<JoinSelectors<T>> {
    const normalizedSelector = joinSelectors(...selectors);

    // Create builder context
    const context = {
      baseSelector: normalizedSelector,
      pseudoClasses: [],
      pseudoElements: [],
      mediaQuery: undefined,
    };

    const builder = new SelectorBuilder(context, this.root);
    this.selectors.set(normalizedSelector, builder);
    return builder as ISelectorBuilder<JoinSelectors<T>>;
  }

  /**
   * Create a media query builder for responsive design
   */
  static media(): IMediaQueryBuilder;
  static media<TQuery extends string>(query: TQuery): IMediaQueryBuilder<TQuery>;
  static media<TQuery extends string>(query?: TQuery): IMediaQueryBuilder<TQuery> | IMediaQueryBuilder {
    if (query !== undefined) {
      return new MediaQueryBuilder(this.root, [query]);
    }
    return new MediaQueryBuilder(this.root, []);
  }

  /**
   * Generate final CSS for all selectors
   */
  static build(): string {
    return this.root.toString();
  }

  /**
   * Clear all rules and selectors (useful for testing and file-based builds)
   */
  static clear(): void {
    this.root = postcss.root();
    this.selectors.clear();
  }

  /**
   * Get the PostCSS root for advanced usage
   */
  static getRoot(): postcss.Root {
    return this.root;
  }
}

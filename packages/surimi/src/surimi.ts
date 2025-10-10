import postcss from 'postcss';

import { MediaQueryBuilder, SelectorBuilder } from './builder';
import type { JoinSelectors, SelectorInput } from './types';

/**
 * Join multiple selectors with comma separation
 */
function joinSelectors(...selectors: string[]): string {
  return selectors.join(', ');
}

/**
 * Surimi CSS builder with global stylesheet management
 *
 * Provides a singleton pattern for managing CSS generation across multiple files.
 * Uses PostCSS internally for efficient CSS AST manipulation and generation.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class Surimi {
  private static root: postcss.Root = postcss.root();
  private static selectors = new Map<string, SelectorBuilder>();

  /**
   * Create a selector builder for the given selectors.
   * Accepts both strings and selector classes (ClassSelector, IdSelector).
   */
  static select<T extends readonly SelectorInput[]>(...selectors: T): SelectorBuilder<JoinSelectors<T>> {
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
    return builder;
  }

  /**
   * Create a media query builder for responsive design.
   */
  static media(): MediaQueryBuilder;
  static media<TQuery extends string>(query: TQuery): MediaQueryBuilder<TQuery>;
  static media<TQuery extends string>(query?: TQuery): MediaQueryBuilder<TQuery> | MediaQueryBuilder {
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

// Top-level convenience exports for easier usage
/**
 * Create a selector builder for the given selectors.
 * Convenience function that delegates to Surimi.select().
 */
export const select = Surimi.select.bind(Surimi);

/**
 * Create a media query builder for responsive design.
 * Convenience function that delegates to Surimi.media().
 */
export const media = Surimi.media.bind(Surimi);

export default Surimi;

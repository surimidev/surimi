import postcss from 'postcss';

import type { CustomProperty } from '#lib/api/custom-property';
import { _select } from '#lib/api/index';
import { MediaQueryBuilder } from '#lib/builders/index';
import type { ValidSelector } from '#types/selector.types';
import type { ArrayWithAtLeastOneItem } from '#types/util.types';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class Surimi {
  public static root: postcss.Root = postcss.root();

  public static registerCustomProperty<TValue>(customProperty: CustomProperty<TValue>): void {
    const rule = postcss.atRule({
      name: 'property',
      params: customProperty.name,
    });

    const declarations = [
      postcss.decl({ prop: 'syntax', value: customProperty.syntax }),
      postcss.decl({ prop: 'inherits', value: String(customProperty.inherits) }),
      postcss.decl({ prop: 'initial-value', value: String(customProperty.initialValue) }),
    ];

    rule.append(declarations);
    Surimi.root.append(rule);
  }

  public static clear() {
    Surimi.root = postcss.root();
  }

  public static build() {
    return Surimi.root.toString();
  }
}

/**
 * The main way to select things in Surimi.
 *
 * Pass this anything you would like to select, like class names, IDs, element names, attributes, etc.
 * Will return a tagged SelectorBuilder that allows you to
 * - navigate the DOM
 * - target pseudo-classes and pseudo-elements
 * - apply styles
 * - and more.
 *
 * **IMPORTANT:**
 * Make sure to select each item in a new argument, so that surimi can properly figure out lists of selectors.
 * For example, use `select('.class1', '.class2')` instead of `select('.class1, .class2')`.
 * When typing in selectors, you will get autocompletion for valid CSS selectors in most editors.
 *
 * @example
 * ```ts
 * const button = select('.button');
 *
 * button.style({
 *   backgroundColor: 'blue',
 *   color: 'white',
 * });
 * ```
 */
export function select<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(...selectors: TSelectors) {
  return _select(selectors, Surimi.root, Surimi.root);
}

/**
 * Create a media query builder to apply selections and styles within a media query.
 *
 * Use the returned MediaQueryBuilder to define the media query parameters using the provided methods,
 * and then select elements within the media query using the `select()` method.
 *
 * @example
 * ```ts
 * const mobileContainer = media()
 *   .minWidth('768px')
 *   .maxWidth('1024px')
 *   .select('.container');
 *
 * // The resulting builder will be `SelectorBuilder<"@media (min-width: 768px) (max-width: 1024px) ⤷ .container">`
 *
 * mobileContainer.style({
 *    padding: '20px',
 * });
 *
 * ```
 */
export function media() {
  return new MediaQueryBuilder<'@media'>(
    [{ type: 'at-rule-name', name: 'media', content: '@media' }],
    Surimi.root,
    Surimi.root,
  );
}

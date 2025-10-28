import { Surimi } from '#surimi';

import { ContainerQueryBuilder } from '../builders';

/**
 * Create a container query builder to apply selections and styles within a container query.
 *
 * Use the returned ContainerQueryBuilder to define the container query parameters using the provided methods,
 * and then select elements within the container query using the `select()` method.
 *
 * @example
 * ```ts
 * const mobileContainer = container().name('my-container').minWidth('768px').maxWidth('1024px').select('.container');
 *
 * // The resulting builder will be `SelectorBuilder<"@container my-container (min-width: 768px) (max-width: 1024px) ⤷ .container">`
 *
 * mobileContainer.style({
 *    padding: '20px',
 * });
 * ```
 */
export function container() {
  return new ContainerQueryBuilder<'@container'>(
    [{ type: 'at-rule-name', name: 'container', content: '@container' }],
    Surimi.root,
    Surimi.root,
  );
}

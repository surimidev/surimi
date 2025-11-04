import { SurimiContext } from '#surimi';

import { MediaQueryBuilder } from '../builders';

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
    SurimiContext.root,
    SurimiContext.root,
  );
}

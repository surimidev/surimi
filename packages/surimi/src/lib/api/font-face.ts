import { SurimiContext } from '#surimi';
import type { FontFaceProperties } from '#types/css.types';

import { FontFaceBuilder } from '../builders';

/**
 * Declare a \@font-face rule with the given properties.
 *
 * The returned FontFaceBuilder can be used as a CSS value representing the font-family name.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face
 *
 * @example
 * ```ts
 * import { fontFace } from 'surimi';
 *
 * const mainFont = fontFace({
 *   "font-family": "MyFont",
 *   "src": "url(/fonts/myfont.woff2)",
 *   "font-weight": "normal",
 *   "font-style": "normal",
 *   "unicode-range": "U+000-5FF",
 * });
 *
 * select('body').style({
 *  fontFamily: mainFont,
 * });
 *
 * ```
 */
export function fontFace(properties: FontFaceProperties) {
  return new FontFaceBuilder(properties, SurimiContext.root, SurimiContext.root);
}

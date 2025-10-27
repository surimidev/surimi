import type { CssProperties } from '#types/css.types';

import { StyleBuilder } from '../builders';

export function style(styles: CssProperties): StyleBuilder {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime check for safety
  if (styles == null) {
    throw new Error('Styles object cannot be null or undefined.');
  }

  return new StyleBuilder(styles);
}

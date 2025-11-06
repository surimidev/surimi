export { media, container, select, mixin, style } from '#lib/api/index';
export {
  property,
  angle,
  color,
  image,
  integer,
  length,
  number,
  percentage,
  resolution,
  string,
  time,
  url,
} from '#lib/api/custom-property';
export { SurimiContext as Surimi } from './surimi';

export type { CssProperties } from '#types/css.types';
export type {
  GlobalCssValue,
  StrictCssProperties,
  StrictCssPropertiesFull,
  StrictCustomProperties,
  VendorPrefixedProperties,
} from '#types/css-strict.types';
export type { SurimiConfig, VendorPrefix } from '#types/config.types';

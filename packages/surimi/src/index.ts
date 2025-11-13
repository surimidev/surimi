export { media, container, select, mixin, style, keyframes, fontFace } from '#lib/api/index';
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
export { createSurimi, CoreBuilder, WithStyling } from '#lib/plugin';
export type { SurimiPlugin, SurimiPluginInput, BuilderPluginMixin } from '#lib/plugin';

export type { CssProperties } from '#types/css.types';

/**
 * This file contains types that should only be used to define/restrict how users can interact with CSS.
 * For example, what properties they can pass to styles, what properties are avaible in certain contexts etc.
 */

import type * as CSS from 'csstype';

import type { CustomProperty } from './api.types';

export type CssProperties = {
  [K in keyof CSS.Properties]: CSS.Properties[K] | CustomProperty;
};

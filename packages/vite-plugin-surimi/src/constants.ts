import escapeStringRegexp from 'escape-string-regexp';

/** Virtual CSS module suffix; sourceId + this is the virtual module id we resolve/load. */
export const VIRTUAL_CSS_SUFFIX = '.surimi.css';

/** Matches request ids for our virtual CSS (with optional query string). */
export const VIRTUAL_CSS_REGEX = new RegExp(`${escapeStringRegexp(VIRTUAL_CSS_SUFFIX)}(?:\\?.*)?$`);

/** Matches bare virtual paths used as cache keys (e.g. App.vue.__surimi_0.css.ts). */
export const VIRTUAL_SURIMI_PATH_REGEX = /\.__surimi_\d+\.css\.ts(?:\?.*)?$/;

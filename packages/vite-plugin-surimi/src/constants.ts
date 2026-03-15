/** Virtual CSS module suffix; sourceId + this is the virtual module id we resolve/load. */
export const VIRTUAL_CSS_SUFFIX = '.surimi.css';

/** Matches request ids for our virtual CSS (with optional query string). */
export const VIRTUAL_CSS_REGEX = new RegExp(
  `${VIRTUAL_CSS_SUFFIX.replace(/\./g, '\\.')}(?:\\?.*)?$`,
);

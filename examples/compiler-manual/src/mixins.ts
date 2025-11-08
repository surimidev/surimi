import { mixin } from 'surimi';

export const focusable = mixin(':focus-visible').style({
  outline: '2px solid blue',
  outlineOffset: '2px',
});

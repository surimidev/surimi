import { mixin } from 'surimi';

export const focusable = mixin(':focus-visible').style({
  outline: '2px solid blue',
  outlineOffset: '2px',
});

export const hoverable = mixin(':hover').style({
  opacity: '0.8',
  transition: 'opacity 0.2s ease',
});

export const disabled = mixin(':disabled').style({
  opacity: '0.5',
  cursor: 'not-allowed',
});

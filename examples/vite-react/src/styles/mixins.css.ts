import { mixin, style } from 'surimi';

import { theme } from './theme.css';

export const primaryBackground = style({
  backgroundColor: theme.colors.primary,
});

export const surimiIconAfter = mixin(':after').style({
  content: "'🍣'",
  position: 'absolute',
  top: '-10px',
  right: '-10px',
  backgroundColor: theme.colors.primary,
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  border: `1px solid ${theme.colors.primaryDark}`,
  borderRadius: '50%',
  padding: '2px',
});

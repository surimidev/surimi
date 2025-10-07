import s from 'surimi';

import { theme } from '#styles/theme';

export const button = s.class('button');
export const input = s.class('input');

const buttonElem = s.select(button).style({
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: theme.colors.primary,
  color: 'white',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'background-color 0.3s ease',
});

buttonElem.hover().style({
  backgroundColor: theme.colors.primaryDark,
});

buttonElem.disabled().style({
  backgroundColor: theme.colors.background,
  cursor: 'not-allowed',
});

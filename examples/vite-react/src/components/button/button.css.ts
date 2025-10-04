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

const inputElem = s.select(input).style({
  padding: '0.5rem',
  border: `1px solid ${theme.colors.primary}`,
  borderRadius: '4px',
  fontSize: '1rem',
  width: '100%',
  boxSizing: 'border-box',
});

inputElem.focus().style({
  borderColor: theme.colors.primary,
  outline: 'none',
  boxShadow: `0 0 0 2px ${theme.colors.primary}33`, // 20% opacity
});

inputElem.attr('type').equals('checkbox').style({
  width: 'auto',
  marginRight: '0.5rem',
});

inputElem.attr('type').style({
  width: 'auto',
  marginRight: '0.5rem',
  borderRadius: '50%',
});

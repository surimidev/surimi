import s from 'surimi';

import { theme } from '#styles/theme';

const button = s.select('.button').style({
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: theme.colors.primary,
  color: 'white',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'background-color 0.3s ease',
});

button.hover().style({
  backgroundColor: theme.colors.primaryDark,
});

button.disabled().style({
  backgroundColor: theme.colors.background,
  cursor: 'not-allowed',
});

const input = s.select('.input').style({
  padding: '0.5rem',
  border: `1px solid ${theme.colors.primary}`,
  borderRadius: '4px',
  fontSize: '1rem',
  width: '100%',
  boxSizing: 'border-box',
});

input.focus().style({
  borderColor: theme.colors.primary,
  outline: 'none',
  boxShadow: `0 0 0 2px ${theme.colors.primary}33`, // 20% opacity
});

input.attr('type').equals('checkbox').style({
  width: 'auto',
  marginRight: '0.5rem',
});

input.attr('type').style({
  width: 'auto',
  marginRight: '0.5rem',
  borderRadius: '50%',
});

import s from 'surimi';

import { theme } from '#styles/theme';

export const app = s.id('app');

const _app = s.select(app).style({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
});

_app
  .descendant('a')
  .style({
    color: theme.colors.primaryDark,
    textDecoration: 'none',
    fontWeight: 'bold',
    margin: '0 0.5rem',
  })
  .hover()
  .style({
    textDecoration: 'underline',
  });

s.media('(max-width: 600px)').select(app).style({
  gap: 0,
});

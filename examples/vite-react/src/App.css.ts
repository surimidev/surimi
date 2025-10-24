import { media, select } from 'surimi';

import { theme } from '#styles/theme';

const _app = select('#app').style({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
  color: theme.colors.text,
  backgroundColor: theme.colors.background,
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
    textDecorationLine: 'underline',
  });

media().maxWidth('600px').select('#app').style({
  gap: 0,
});

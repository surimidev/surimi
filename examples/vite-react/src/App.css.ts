import s from 'surimi';

import { theme } from '#styles/theme.css';

const app = s.select('#app').style({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

app
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

s.media('(max-width: 600px)').select('#app').style({
  flexDirection: 'column',
});

import { select } from 'surimi';

import { theme } from '#styles/theme.css';

select('*').style({
  boxSizing: 'border-box',
});

select('html', 'body').style({
  margin: 0,
  padding: 0,
  backgroundColor: theme.colors.background,
});

select(':root').style({
  colorScheme: 'light dark',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  margin: 0,
  padding: 0,
});

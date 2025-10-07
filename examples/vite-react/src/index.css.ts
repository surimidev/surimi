import s from 'surimi';

s.select('*').style({
  boxSizing: 'border-box',
});

s.select('html', 'body').style({
  margin: 0,
  padding: 0,
});

s.select(':root').style({
  colorScheme: 'light dark',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  margin: 0,
  padding: 0,
});

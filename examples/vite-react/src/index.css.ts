import s from 'surimi';

s.select(':root').style({
  colorScheme: 'light dark',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
});

s.select('body').style({
  margin: 0,
  padding: '2rem',
});

s.select('#app').style({
  maxWidth: '800px',
  margin: '0 auto',
  borderRadius: '8px',
  padding: '2rem',
});

s.select('h1, h2, h3').style({
  fontWeight: 'bold',
  margin: '1rem 0',
});

s.select('a')
  .style({
    color: '#0078d4',
    textDecoration: 'none',
  })
  .hover()
  .style({
    textDecoration: 'underline',
  });

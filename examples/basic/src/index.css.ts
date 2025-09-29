import s from 'surimi';

s.select('body').style({
  margin: 0,
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  backgroundColor: '#f9f9f9',
});

s.select('.container').style({
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px',
});

s.select('.btn').style({
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease, transform 0.1s ease',
});

// Hover state
s.select('.btn').hover().style({
  backgroundColor: '#2563eb',
});

// Active state
s.select('.btn').active().style({
  transform: 'translateY(1px)',
});

console.log(s.build());

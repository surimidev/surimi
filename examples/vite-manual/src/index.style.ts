import s from 'surimi';

// Base layout styles
s.select('body').style({
  margin: '0',
  padding: '2rem',
  fontFamily: 'system-ui, sans-serif',
  backgroundColor: '#f5f5f5',
  lineHeight: '1.6',
});

s.select('#app').style({
  maxWidth: '800px',
  margin: '0 auto',
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '2rem',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
});

// Typography
s.select('h1').style({
  color: '#2c3e50',
  marginBottom: '2rem',
  textAlign: 'center',
});

s.select('h2').style({
  color: '#34495e',
  marginBottom: '1rem',
});

// Card component
s.select('.card').style({
  border: '1px solid #e1e8ed',
  borderRadius: '8px',
  padding: '1.5rem',
  marginBottom: '1rem',
});

s.select('.card').hover().style({
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transform: 'translateY(-2px)',
  transition: 'all 0.2s ease',
});

// Button styles
s.select('.btn').style({
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  fontWeight: '500',
  cursor: 'pointer',
  margin: '0.5rem',
  transition: 'all 0.2s ease',
});

s.select('.btn').hover().style({
  transform: 'translateY(-1px)',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
});

s.select('.btn.primary').style({
  backgroundColor: '#3498db',
  color: 'white',
});

s.select('.btn.primary').hover().style({
  backgroundColor: '#2980b9',
});

s.select('.btn.secondary').style({
  backgroundColor: '#95a5a6',
  color: 'white',
});

s.select('.btn.secondary').hover().style({
  backgroundColor: '#7f8c8d',
});

// Responsive design
s.media('(max-width: 600px)').select('.card').style({
  padding: '1rem',
  margin: '0.5rem 0',
});

s.media('(max-width: 600px)').select('.btn').style({
  display: 'block',
  width: '100%',
  margin: '0.5rem 0',
});

import { media, select } from 'surimi';

// Base layout styles
select('body').style({
  margin: '0',
  padding: '2rem',
  fontFamily: 'system-ui, sans-serif',
  backgroundColor: '#f5f5f5',
  lineHeight: '1.6',
});

select('#app').style({
  maxWidth: '800px',
  margin: '0 auto',
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '2rem',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
});

// Typography
select('h1').style({
  color: '#2c3e50',
  marginBottom: '2rem',
  textAlign: 'center',
});

select('h2').style({
  color: '#34495e',
  marginBottom: '1rem',
});

// Card component
select('.card').style({
  border: '1px solid #e1e8ed',
  borderRadius: '8px',
  padding: '1.5rem',
  marginBottom: '1rem',
});

select('.card').hover().style({
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transform: 'translateY(-2px)',
  transition: 'all 0.2s ease',
});

// Button styles
select('.btn').style({
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  fontWeight: '500',
  cursor: 'pointer',
  margin: '0.5rem',
  transition: 'all 0.2s ease',
});

select('.btn').hover().style({
  transform: 'translateY(-1px)',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
});

select('.btn.primary').style({
  backgroundColor: '#3498db',
  color: 'white',
});

select('.btn.primary').hover().style({
  backgroundColor: '#2980b9',
});

select('.btn.secondary').style({
  backgroundColor: '#95a5a6',
  color: 'white',
});

select('.btn.secondary').hover().style({
  backgroundColor: '#7f8c8d',
});

// Responsive design
const mobile = media().maxWidth('600px');

mobile.select('.card').style({
  padding: '1rem',
  margin: '0.5rem 0',
});

mobile.select('.btn').style({
  display: 'block',
  width: '100%',
  margin: '0.5rem 0',
});

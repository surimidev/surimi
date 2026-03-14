import { select } from 'surimi';
import { when } from 'surimi/conditional';

select('body').style({
  margin: '0',
  padding: '2rem',
  fontFamily: 'system-ui, sans-serif',
  backgroundColor: '#f5f5f5',
});

select('#app').style({
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '2rem',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
});

select('#app h1').style({
  marginTop: 0,
  marginBottom: '1.5rem',
  color: '#333',
});

select('.card').style({
  display: 'flex',
  gap: '1rem',
  flexWrap: 'wrap',
});

select('.counter button').style({
  padding: '0.5rem 1rem',
  fontSize: '1rem',
  borderRadius: '4px',
  border: '1px solid #ddd',
  backgroundColor: 'white',
  cursor: 'pointer',
});

select('.counter button').hover().style({
  backgroundColor: '#f0f0f0',
});

const counterA = select('.counter-a');
const counterB = select('.counter-b');

when(counterA.child('button')).hovered().select(counterB).style({
  filter: 'blur(4px)',
});

when(counterB.child('button')).hovered().select(counterA).style({
  filter: 'blur(4px)',
});

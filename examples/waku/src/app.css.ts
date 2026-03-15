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
  justifyContent: 'center',
});

const counterA = select('.counter-a');
const counterB = select('.counter-b');

when(counterA.child('button')).hovered().select(counterB).style({
  filter: 'grayscale(100%)',
  transition: 'all 0.3s ease-in-out',
});

when(counterB.child('button')).hovered().select(counterA).style({
  filter: 'grayscale(100%)',
  transition: 'all 0.3s ease-in-out',
});

import { select } from 'surimi';
import { when } from 'surimi/conditional';

// Base layout styles
select('body').style({
  margin: '0',
  padding: '2rem',
  backgroundColor: '#f5f5f5',
  display: 'flex',
});

select('body > div').style({
  width: '50%',
  padding: '1rem',
  boxSizing: 'border-box',
});

const left = select('.left').style({
  backgroundColor: '#dfe6e9',
});

const right = select('.right').style({
  backgroundColor: '#b2bec3',
});

when(left.child('button')).hovered().select(right).style({
  backgroundColor: '#74b9ff',
});

when(right.child('button')).hovered().select(left).style({
  backgroundColor: '#55efc4',
});

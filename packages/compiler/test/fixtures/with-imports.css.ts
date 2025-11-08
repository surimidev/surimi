// Test fixture that imports from another file
import { select } from 'surimi';
import { buttonClass } from './simple.css';

select(`.${buttonClass}`).style({
  backgroundColor: 'blue',
  color: 'white',
  padding: '10px 20px',
});

export { buttonClass };

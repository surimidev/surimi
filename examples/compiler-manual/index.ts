import { select } from 'surimi';

const html = select('html').style({ backgroundColor: 'red' });

html
  .descendant('button')
  .style({
    color: 'white',
    backgroundColor: 'blue',
  })
  .hover()
  .style({
    backgroundColor: 'darkblue',
  });

export const test = 'test';

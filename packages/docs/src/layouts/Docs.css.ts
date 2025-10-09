import { select } from 'surimi';

const docsContainer = select('.docs').style({
  display: 'grid',
  gridTemplateColumns: '400px auto',
});

docsContainer.child('.docs__content').style({
  padding: '1rem 2rem',
  overflowY: 'auto',
});

import { media, select } from 'surimi';

select('.responsive').style({
  width: '100%',
  padding: '1rem',
});

media('(min-width: 768px)').nest(() => {
  select('.responsive').style({
    width: '50%',
    padding: '2rem',
  });
});

media('(min-width: 1024px)').nest(() => {
  select('.responsive').style({
    width: '33.333%',
    padding: '3rem',
  });
});

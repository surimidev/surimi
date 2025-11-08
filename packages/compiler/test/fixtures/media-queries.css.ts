// Test fixture with media queries
import { select, media } from 'surimi';

select('.responsive-grid').style({
  display: 'grid',
  gridTemplateColumns: 'repeat(1, 1fr)',
});

media().minWidth('768px').select('.responsive-grid').style({
  gridTemplateColumns: 'repeat(2, 1fr)',
});

media().minWidth('1024px').select('.responsive-grid').style({
  gridTemplateColumns: 'repeat(3, 1fr)',
});

export const breakpoints = {
  mobile: '768px',
  desktop: '1024px',
};

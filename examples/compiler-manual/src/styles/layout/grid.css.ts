import { select, media } from 'surimi';

export const grid = select('.grid').style({
  display: 'grid',
  gap: '1rem',
});

export const gridCols2 = select('.grid-cols-2').style({
  gridTemplateColumns: 'repeat(2, 1fr)',
});

export const gridCols3 = select('.grid-cols-3').style({
  gridTemplateColumns: 'repeat(3, 1fr)',
});

export const gridCols4 = select('.grid-cols-4').style({
  gridTemplateColumns: 'repeat(4, 1fr)',
});

// Responsive grid - 1 column on mobile, original columns on desktop
media().maxWidth('768px').select(gridCols2).style({
  gridTemplateColumns: '1fr',
});

media().maxWidth('768px').select(gridCols3).style({
  gridTemplateColumns: '1fr',
});

media().maxWidth('768px').select(gridCols4).style({
  gridTemplateColumns: 'repeat(2, 1fr)',
});

export const flex = select('.flex').style({
  display: 'flex',
  gap: '1rem',
});

export const flexCol = select('.flex-col').style({
  flexDirection: 'column',
});

export const flexCenter = select('.flex-center').style({
  justifyContent: 'center',
  alignItems: 'center',
});

export const flexBetween = select('.flex-between').style({
  justifyContent: 'space-between',
  alignItems: 'center',
});

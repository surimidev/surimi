import { select, media } from 'surimi';

export const container = select('.container').style({
  maxWidth: '1200px',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: '1rem',
  paddingRight: '1rem',
});

export const containerFluid = select('.container-fluid').style({
  width: '100%',
  paddingLeft: '1rem',
  paddingRight: '1rem',
});

export const containerNarrow = select('.container-narrow').style({
  maxWidth: '800px',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: '1rem',
  paddingRight: '1rem',
});

// Responsive padding
media().minWidth('768px').select(container).style({
  paddingLeft: '2rem',
  paddingRight: '2rem',
});

media().minWidth('768px').select(containerFluid).style({
  paddingLeft: '2rem',
  paddingRight: '2rem',
});

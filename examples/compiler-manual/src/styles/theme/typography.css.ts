import { select, style } from 'surimi';

export const heading1 = select('h1').style({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  marginBottom: '1rem',
});

export const heading2 = select('h2').style({
  fontSize: '3rem',
  fontWeight: 'bold',
  marginBottom: '0.875rem',
});

export const heading3 = select('h3').style({
  fontSize: '2rem',
  fontWeight: '400',
  marginBottom: '0.75rem',
});

export const paragraph = select('p').style({
  fontSize: '1rem',
  lineHeight: '1.5',
  marginBottom: '1rem',
});

export const small = style({
  fontSize: '0.875rem',
  lineHeight: '1.25',
});

import { select } from 'surimi';

import { theme } from './theme';

select('@font-face').style({
  fontFamily: 'IBM Plex Mono',
  fontStyle: 'normal',
  fontWeight: '400',
});

select('*', '*::before', '*::after').style({
  boxSizing: 'border-box',
});

select('html, body').style({
  margin: 0,
  padding: 0,
  fontFamily: 'IBM Plex Mono, sans-serif',
  backgroundColor: theme.bg.subtle,
});

select('html').style({
  colorScheme: 'light dark',
  // Chris Coyier's reset
  fontSize: 'clamp(1rem, 1rem + 0.5vw, 2rem) / 1.4',
  tabSize: 2,
  hangingPunctuation: 'first allow-end last',
  wordBreak: 'break-word',
});

select('h1, h2, h3, h4, h5, h6').style({
  textWrap: 'balance',
  marginBlockStart: 0,
});

select('p, li, dd').style({
  maxInlineSize: '80ch',
  textWrap: 'pretty',
});

const link = select('a').style({
  color: 'inherit',
  textUnderlineOffset: '2px',
});

link.has('svg, h1, h2, h3, h4, h5, h6').style({
  textDecoration: 'none',
});

select('ul, ol, dl')
  .style({
    margin: 0,
    padding: 0,
    listStylePosition: 'inside',
  })
  .descendant('ul, ol, dl')
  .style({
    paddingInlineStart: '2ch',
  });

select('[hidden]').style({
  display: 'none',
});

select('svg').style({
  width: '1em',
  height: '1em',
  verticalAlign: 'sub',
});

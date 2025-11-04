import { media, mixin, select, style } from 'surimi';

const focusable = mixin(':focus-visible').style({
  outline: '2px solid blue',
  outlineOffset: '2px',
});

const interactive = style({
  cursor: 'pointer',
});

const withoutBorder = style({
  border: 'none',
});

const button = select('.button').use(interactive, focusable).style(withoutBorder).style({
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  fontSize: '1rem',
  transition: 'background-color 0.3s ease',
});

button.select('.button-primary').style({
  backgroundColor: 'blue',
  color: 'white',
});

media().maxWidth('600px').select(button).style({
  width: '100%',
});

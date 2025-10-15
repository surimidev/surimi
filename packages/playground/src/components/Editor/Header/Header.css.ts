import { select } from 'surimi';

const header = select('.surimi-editor__header').style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

header.child('.surimi-editor__header-right').style({
  display: 'flex',
  gap: '0.5rem',
});

const button = header.descendant('button').style({
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '1rem',
});

button.not('.button-secondary').hover().style({
  backgroundColor: '#0056b3',
});

button.disabled().style({
  backgroundColor: '#ccc',
  cursor: 'not-allowed',
});

select('.button-secondary')
  .not(':disabled')
  .style({
    backgroundColor: '#8d8d8d',
  })
  .hover()
  .style({
    backgroundColor: '#838383',
  });

import { select } from 'surimi';

select('.playground').style({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
  height: '80vh',
  padding: '1rem',
  boxSizing: 'border-box',
});

select('.playground__input').style({
  flex: 1,
  fontFamily: 'monospace',
  fontSize: '1rem',
  padding: '1rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  resize: 'none',
});

select('.playground__output').style({
  flex: 1,
  backgroundColor: '#f5f5f5',
  border: '1px solid #ccc',
  borderRadius: '4px',
  padding: '1rem',
  overflowY: 'auto',
});

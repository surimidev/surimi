import s from 'surimi';

s.select('button')
  .style({
    fontSize: '1.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#61dafb',
    color: '#000',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  })
  .hover()
  .style({
    backgroundColor: '#21a1f1',
  });

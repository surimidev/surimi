import { select } from 'surimi';

select('.surimi-editor__input').style({});

select('.surimi-editor__input-overlay').style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexFlow: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  // Move up slightly
  zIndex: 30,
});

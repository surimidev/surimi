import { select } from 'surimi';

select('.surimi-editor__panel').style({
  padding: '1rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#ffffff',
});

select('.surimi-editor__panel-overlay').style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#ffffff81',
  zIndex: 20,
});

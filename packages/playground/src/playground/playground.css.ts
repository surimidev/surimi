import { select } from 'surimi';

const container = select('.surimi-editor').style({
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
});

container.descendant('.surimi-editor__right').style({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  flexGrow: 1,
});

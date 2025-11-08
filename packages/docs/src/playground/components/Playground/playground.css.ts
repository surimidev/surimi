import { select } from 'surimi';

import { config } from '#styles/config';

const _ = select('.surimi-playground').style({
  height: `calc(100vh - ${config.header.height} - 100px)`,
  padding: '1rem',
  position: 'relative',
});

const editor = select('.surimi-editor').style({
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  gap: '1rem',
});

editor.descendant('.surimi-editor__right').style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  gap: '1rem',
  // override panel style to make "invisible" panel
  border: 'none',
  padding: 0,
});

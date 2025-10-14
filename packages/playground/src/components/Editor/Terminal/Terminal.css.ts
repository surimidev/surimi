import { select } from 'surimi';

const container = select('.surimi-editor__terminal').style({
  borderTop: '1px solid #333',
  flexGrow: 1,
  backgroundColor: '#1e1e1e',
});

container.child('.surimi-editor__terminal__instance').style({
  height: '100%',
  width: '100%',
});

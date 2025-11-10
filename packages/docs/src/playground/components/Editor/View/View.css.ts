import { select } from 'surimi';

const view = select('.surimi-editor__view').style({
  width: '100%',
  height: '100%',
  padding: 0,
});

view.child('.surimi-editor__view__iframe').style({
  border: 'none',
  width: '100%',
  height: '100%',
});

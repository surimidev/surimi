import { select } from 'surimi';

const container = select('.surimi-editor__terminal').style({
  flexShrink: '1 !important',
  flexGrow: '1 !important',
});

container.child('.surimi-editor__terminal__instance').style({
  height: '100%',
  width: '100%',
  overscrollBehavior: 'contain',
});

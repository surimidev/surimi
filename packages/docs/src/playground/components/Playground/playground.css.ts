import { select, style } from 'surimi';

import { config } from '#styles/config';

const _ = select('.surimi-playground').style({
  height: `calc(100vh - ${config.header.height} - 100px)`,
  padding: '1rem 3rem',
  position: 'relative',
});

const editor = select('.surimi-editor').style({
  height: 'calc(100% - 4rem)',
  display: 'flex',
  flexDirection: 'row',
  gap: '1rem',
});

const editorSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  // override panel style to make "invisible" panel
  border: 'none',
  padding: 0,
});

editor.descendant('.surimi-editor__left').use(editorSection).style({});

editor.descendant('.surimi-editor__right').use(editorSection).style({
  flexGrow: '1 !important',
});

const handleWidth = 3;
const handleMargin = handleWidth * 20;

select('.resizable-handle-right')
  .style({
    height: `calc(100% - ${handleMargin * 2}px) !important`,
    width: '100%',
    backgroundColor: '#cecece',
    transform: `translateX(${handleWidth * 2}px)`,
    top: `${handleMargin}px !important`,
  })
  .hover()
  .style({
    backgroundColor: '#bbb',
  });

select('.resizable-handle-bottom')
  .style({
    height: '100%',
    width: `calc(100% - ${handleMargin * 2}px) !important`,
    backgroundColor: '#cecece',
    transform: `translateY(${handleWidth * 2}px)`,
    left: `${handleMargin}px !important`,
  })
  .hover()
  .style({
    backgroundColor: '#bbb',
  });

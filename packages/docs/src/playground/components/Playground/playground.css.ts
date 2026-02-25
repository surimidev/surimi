import { select } from 'surimi';

import { config, theme } from '#styles';

const playground = select('.surimi-playground').style({
  height: `calc(100vh - ${config.header.height})`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.bg.canvas,
});

playground.descendant('.surimi-playground__container').style({
  flex: '1',
  overflow: 'hidden',
  padding: theme.spacing[3],
  minHeight: '0',
});

playground.descendant('.surimi-playground__editor-section').style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  gap: theme.spacing[2],
});

playground.descendant('.surimi-playground__editor-container').style({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '0',
  minWidth: '0',
});

playground.descendant('.surimi-playground__editor-tabs').style({
  display: 'flex',
  gap: '0',
  borderBottom: `1px solid ${theme.border.default}`,
  backgroundColor: theme.bg.subtle,
  paddingLeft: theme.spacing[2],
});

const editorTab = select('.surimi-playground__editor-tab').style({
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.medium,
  border: 'none',
  borderBottom: `2px solid transparent`,
  backgroundColor: 'transparent',
  color: theme.text.subtle,
  cursor: 'pointer',
  transition: 'color 0.15s, border-color 0.15s',
});

editorTab.hover().style({
  color: theme.text.default,
});

select('.surimi-playground__editor-tab--active').style({
  color: theme.text.primary,
  borderBottomColor: theme.border.focus,
  backgroundColor: theme.bg.app,
});

playground.descendant('.surimi-playground__editor').style({
  flex: '1',
  position: 'relative',
  border: `1px solid ${theme.border.default}`,
  borderTop: 'none',
  borderRadius: '0 0 4px 4px',
  minHeight: '200px',
});

// Resize handles
select('.surimi-playground__resize-handle').style({
  backgroundColor: theme.border.default,
  transition: 'background-color 0.15s',
});

select('.surimi-playground__resize-handle').hover().style({
  backgroundColor: theme.border.hover,
});

select('.surimi-playground__resize-handle[data-panel-group-direction="vertical"]').style({
  height: '1px',
  cursor: 'row-resize',
});

select('.surimi-playground__resize-handle[data-panel-group-direction="horizontal"]').style({
  width: '1px',
  cursor: 'col-resize',
});

// Right panel: output (compiled CSS) on top, preview view below
playground.descendant('.surimi-playground__output-section').style({
  display: 'grid',
  gridTemplateRows: '1fr 1fr',
  height: '100%',
  overflow: 'hidden',
  minHeight: '0',
});

playground.descendant('.surimi-playground__output-section .surimi-playground__output').style({
  flex: '0 0 40%',
  minHeight: '120px',
  overflow: 'hidden',
});

playground.descendant('.surimi-playground__output-section .surimi-playground__view').style({
  flex: '1',
  minHeight: '0',
});

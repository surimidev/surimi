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

// Editor section styles - vertical layout with row for file explorer + editor, terminal below
playground.descendant('.surimi-playground__editor-section').style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  gap: theme.spacing[2],
});

// Row containing file explorer sidebar and editor
playground.descendant('.surimi-playground__editor-row').style({
  display: 'flex',
  flexDirection: 'row',
  flex: '1',
  gap: theme.spacing[2],
  minHeight: '0',
});

playground.descendant('.surimi-playground__editor-container').style({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '0',
  minWidth: '0',
});

playground.descendant('.surimi-playground__editor').style({
  flex: '1',
  position: 'relative',
  border: `1px solid ${theme.border.default}`,
  borderRadius: '4px',
  overflow: 'hidden',
  minHeight: '200px',
});

// Overlay for loading states
playground.descendant('.surimi-playground__overlay').style({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: '100',
});

playground.descendant('.surimi-playground__status').style({
  fontSize: theme.font.size.sm,
  color: theme.text.subtle,
  padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
  backgroundColor: theme.bg.app,
  border: `1px solid ${theme.border.default}`,
  borderRadius: '6px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
});

// Terminal toggle button at bottom of editor
playground.descendant('.surimi-playground__terminal-toggle').style({
  marginTop: theme.spacing[2],
  display: 'flex',
  justifyContent: 'flex-start',
});

const terminalTab = select('.surimi-playground__tab').style({
  padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
  fontSize: theme.font.size.xs,
  fontWeight: theme.font.weight.medium,
  border: `1px solid ${theme.border.default}`,
  borderRadius: '4px',
  backgroundColor: theme.bg.app,
  color: theme.text.default,
  cursor: 'pointer',
  transition: 'all 0.15s',
});

terminalTab.hover().style({
  backgroundColor: theme.bg.hover,
  borderColor: theme.border.hover,
});

select('.surimi-playground__tab--active').style({
  backgroundColor: theme.bg.primary,
  color: theme.text.inverse,
  borderColor: theme.border.focus,
});

// Terminal container - full width at bottom
playground.descendant('.surimi-playground__terminal').style({
  height: '180px',
  border: `1px solid ${theme.border.default}`,
  borderRadius: '4px',
  overflow: 'hidden',
  flexShrink: '0',
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

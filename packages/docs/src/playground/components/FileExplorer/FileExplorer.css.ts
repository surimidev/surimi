import { select } from 'surimi';

import { theme } from '#styles';

const fileExplorer = select('.file-explorer').style({
  display: 'flex',
  flexDirection: 'column',
  width: '180px',
  height: '100%',
  backgroundColor: theme.bg.subtle,
  border: `1px solid ${theme.border.default}`,
  borderRadius: '4px',
  overflow: 'hidden',
  flexShrink: '0',
});

fileExplorer.descendant('.file-explorer__header').style({
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  backgroundColor: theme.bg.app,
  borderBottom: `1px solid ${theme.border.default}`,
});

fileExplorer.descendant('.file-explorer__header h3').style({
  margin: '0',
  fontSize: theme.font.size.xs,
  fontWeight: theme.font.weight.semibold,
  color: theme.text.default,
});

fileExplorer.descendant('.file-explorer__tree').style({
  flex: '1',
  overflow: 'auto',
  padding: theme.spacing[2],
});

const fileExplorerItem = select('.file-explorer__folder, .file-explorer__file').style({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing[1],
  padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
  borderRadius: '3px',
  cursor: 'pointer',
  fontSize: theme.font.size.xs,
  transition: 'background-color 0.15s',
});

fileExplorerItem.hover().style({
  backgroundColor: theme.bg.hover,
});

select('.file-explorer__file--selected').style({
  backgroundColor: theme.bg.active,
  color: theme.text.accent,
  fontWeight: theme.font.weight.medium,
});

select('.file-explorer__icon').style({
  fontSize: '12px',
  flexShrink: '0',
});

select('.file-explorer__name').style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

select('.file-explorer__folder').style({
  fontWeight: theme.font.weight.medium,
});

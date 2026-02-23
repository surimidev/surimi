import { select } from 'surimi';

import { theme } from '#styles';

const view = select('.surimi-playground__view').style({
  display: 'flex',
  flexDirection: 'column',
  flex: '1',
  minHeight: '0',
  backgroundColor: theme.bg.app,
  borderTop: `1px solid ${theme.border.default}`,
});

view.descendant('.surimi-playground__view-header').style({
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  backgroundColor: theme.bg.subtle,
  borderBottom: `1px solid ${theme.border.default}`,
});

view.descendant('.surimi-playground__view-header h3').style({
  margin: '0',
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.semibold,
  color: theme.text.default,
});

view.descendant('.surimi-playground__view-content').style({
  flex: '1',
  overflow: 'hidden',
  position: 'relative',
  minHeight: '200px',
});

view.descendant('.surimi-playground__view-iframe').style({
  width: '100%',
  height: '100%',
  border: 'none',
  backgroundColor: theme.bg.app,
});

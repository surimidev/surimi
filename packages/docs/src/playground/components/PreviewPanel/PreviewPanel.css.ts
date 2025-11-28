import { select } from 'surimi';

import { theme } from '#styles';

const preview = select('.surimi-playground__preview').style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.bg.app,
});

preview.descendant('.surimi-playground__preview-header').style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  backgroundColor: theme.bg.subtle,
  borderBottom: `1px solid ${theme.border.default}`,
});

preview.descendant('.surimi-playground__preview-header h3').style({
  margin: '0',
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.semibold,
  color: theme.text.default,
});

preview.descendant('.surimi-playground__preview-url').style({
  fontSize: theme.font.size.xs,
  color: theme.text.subtle,
  fontFamily: 'monospace',
});

preview.descendant('.surimi-playground__preview-content').style({
  flex: '1',
  overflow: 'hidden',
  position: 'relative',
});

preview.descendant('.surimi-playground__preview-iframe').style({
  width: '100%',
  height: '100%',
  border: 'none',
  backgroundColor: theme.bg.app,
});

preview.descendant('.surimi-playground__preview-empty').style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: theme.text.subtle,
  fontSize: theme.font.size.sm,
});

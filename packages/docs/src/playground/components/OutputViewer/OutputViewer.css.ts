import { select } from 'surimi';

import { theme } from '#styles';

const output = select('.surimi-playground__output').style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.bg.app,
});

output.descendant('.surimi-playground__output-header').style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: theme.bg.subtle,
  borderBottom: `1px solid ${theme.border.default}`,
  height: theme.spacing[7],
  paddingInline: theme.spacing[4],
});

output.descendant('.surimi-playground__output-path').style({
  fontSize: theme.font.size.xs,
  color: theme.text.subtle,
  fontFamily: 'monospace',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

output.descendant('.surimi-playground__output-content').style({
  flex: '1',
  overflow: 'hidden',
});

output.descendant('.surimi-playground__output-error').style({
  margin: 0,
  padding: theme.spacing[4],
  fontFamily: 'monospace',
  fontSize: theme.font.size.xs,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflow: 'auto',
  maxHeight: '100%',
  color: theme.text.default,
});

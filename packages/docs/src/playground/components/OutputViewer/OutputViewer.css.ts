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
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  backgroundColor: theme.bg.subtle,
  borderBottom: `1px solid ${theme.border.default}`,
});

output.descendant('.surimi-playground__output-header h3').style({
  margin: '0',
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.semibold,
  color: theme.text.default,
});

output.descendant('.surimi-playground__output-path').style({
  fontSize: theme.font.size.xs,
  color: theme.text.subtle,
  fontFamily: 'monospace',
});

output.descendant('.surimi-playground__output-content').style({
  flex: '1',
  overflow: 'hidden',
});

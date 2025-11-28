import { select } from 'surimi';

import { theme } from '#styles';

const header = select('.surimi-playground__header').style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
  backgroundColor: theme.bg.app,
  borderBottom: `1px solid ${theme.border.default}`,
});

header.descendant('h1').style({
  margin: '0',
  fontSize: theme.font.size.xl,
  fontWeight: theme.font.weight.semibold,
  color: theme.text.default,
});

header.descendant('.surimi-playground__header-actions').style({
  display: 'flex',
  gap: theme.spacing[3],
});

const button = header.descendant('button').style({
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.medium,
  border: `1px solid ${theme.border.default}`,
  borderRadius: '4px',
  backgroundColor: theme.bg.app,
  color: theme.text.default,
  cursor: 'pointer',
  transition: 'all 0.15s',
});

button.hover().select(':not(:disabled)').style({
  backgroundColor: theme.bg.hover,
  borderColor: theme.border.hover,
});

button.disabled().style({
  opacity: '0.5',
  cursor: 'not-allowed',
});

header.descendant('button.button-secondary').style({
  backgroundColor: theme.bg.subtle,
  borderColor: theme.border.default,
});

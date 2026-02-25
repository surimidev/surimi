import { select } from 'surimi';

import { theme } from '#styles';

const tabPanel = select('.tab-panel').style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.bg.app,
  border: `1px solid ${theme.border.default}`,
  borderRadius: '4px',
  overflow: 'hidden',
});

tabPanel.descendant('.tab-panel__header').style({
  display: 'flex',
  gap: '0',
  backgroundColor: theme.bg.subtle,
  borderBottom: `1px solid ${theme.border.default}`,
  padding: theme.spacing[2],
});

const tab = select('.tab-panel__tab').style({
  flex: '1',
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.medium,
  border: 'none',
  borderRadius: '4px',
  backgroundColor: 'transparent',
  color: theme.text.subtle,
  cursor: 'pointer',
  transition: 'all 0.15s',
});

tab.hover().style({
  backgroundColor: theme.bg.hover,
  color: theme.text.default,
});

select('.tab-panel__tab--active').style({
  backgroundColor: theme.bg.app,
  color: theme.text.primary,
  fontWeight: theme.font.weight.semibold,
  boxShadow: `0 2px 4px rgba(0, 0, 0, 0.05)`,
});

tabPanel.descendant('.tab-panel__content').style({
  flex: '1',
  overflow: 'hidden',
  position: 'relative',
});

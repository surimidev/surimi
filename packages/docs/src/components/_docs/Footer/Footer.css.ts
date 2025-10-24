import { media, select } from 'surimi';

import { theme } from '#styles/theme.ts';

select('.docs__footer').style({
  bottom: theme.spacing[6],
  right: theme.spacing[9],
  left: theme.spacing[9],
  position: 'absolute',
  padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
  border: `1px solid ${theme.border.default}`,
  borderRadius: theme.radius.md,
  backgroundColor: theme.bg.canvas,
});

media().maxWidth(theme.screen.lg).select('.docs__footer').style({
  left: theme.spacing[6],
  right: theme.spacing[6],
});

media().maxWidth(theme.screen.md).select('.docs__footer').style({
  left: theme.spacing[4],
  right: theme.spacing[4],
});

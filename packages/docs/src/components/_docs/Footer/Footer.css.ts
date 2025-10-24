import { media, select } from 'surimi';

import { config } from '#styles/config.ts';
import { theme } from '#styles/theme.ts';

select('.docs__footer').style({
  bottom: theme.spacing[6],
  right: theme.spacing[6],
  position: 'absolute',
  padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
  border: `1px solid ${theme.border.default}`,
  borderRadius: theme.radius.md,
  backgroundColor: theme.bg.canvas,
});

media().maxWidth(config.breakpoints.mobile).select('.docs__footer').style({
  right: 'auto',
  marginRight: theme.spacing[4],
});

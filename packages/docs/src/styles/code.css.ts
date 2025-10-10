import { select } from 'surimi';

import { theme } from './theme';

select('.astro-code').style({
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  borderRadius: theme.radius.base,
});

import { select } from 'surimi';

import { config, theme } from '#styles';

const docsContainer = select('.docs').style({
  display: 'grid',
  gridTemplateColumns: `1fr 2fr`,
});

docsContainer.is('.container').style({
  backgroundColor: theme.bg.app,
});

docsContainer.child('.docs__content').style({
  padding: `${theme.spacing[6]} ${theme.spacing[9]}`,
  overflowY: 'auto',
  backgroundColor: theme.bg.app,
  maxWidth: config.global.maxInlineWidth,
});

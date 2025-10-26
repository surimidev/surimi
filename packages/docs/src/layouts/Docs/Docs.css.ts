import { media, select } from 'surimi';

import { config, theme } from '#styles';

const docsContainer = select('.docs').style({
  display: 'grid',
  gridTemplateColumns: `1fr 2fr`,
});

docsContainer.is('#container').style({
  backgroundColor: theme.bg.app,
  position: 'relative',
});

docsContainer.child('.docs__content').style({
  padding: `${theme.spacing[6]} ${theme.spacing[9]} ${theme.spacing[10]} ${theme.spacing[9]}`,
  backgroundColor: theme.bg.app,
  maxWidth: config.global.maxInlineWidth,
  position: 'relative',
  // Needed for sticky elements inside content
  overflowY: 'auto',
});

media().maxWidth(theme.screen.md).select('.docs').style({
  display: 'block',
});

media()
  .maxWidth(theme.screen.lg)
  .select('.docs .docs__content')
  .style({
    padding: `${theme.spacing[6]} ${theme.spacing[6]} ${theme.spacing[10]} ${theme.spacing[6]}`,
  });

media()
  .maxWidth(theme.screen.md)
  .select('.docs .docs__content')
  .style({
    padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
  });

select('.markdown-alert-title').style({
  margin: 0,
});

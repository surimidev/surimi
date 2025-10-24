import { media, select } from 'surimi';

import { config, theme } from '#styles';

const docsContainer = select('.docs').style({
  display: 'grid',
  gridTemplateColumns: `1fr 2fr`,
});

docsContainer.is('.container').style({
  backgroundColor: theme.bg.app,
  position: 'relative',
});

docsContainer.child('.docs__content').style({
  padding: `${theme.spacing[6]} ${theme.spacing[9]} ${theme.spacing[10]} ${theme.spacing[9]}`,
  overflowY: 'auto',
  backgroundColor: theme.bg.app,
  maxWidth: config.global.maxInlineWidth,
});

media()
  .maxWidth(config.breakpoints.tablet)
  .select('.docs .docs__content')
  .style({
    padding: `${theme.spacing[6]} ${theme.spacing[6]} ${theme.spacing[10]} ${theme.spacing[6]}`,
  });

media().maxWidth(config.breakpoints.mobile).select('.docs').style({
  gridTemplateColumns: '1fr',
});

media()
  .maxWidth(config.breakpoints.mobile)
  .select('.docs .docs__content')
  .style({
    padding: `${theme.spacing[4]} ${theme.spacing[4]} ${theme.spacing[10]} ${theme.spacing[4]}`,
  });

select('.markdown-alert-title').style({
  margin: 0,
});

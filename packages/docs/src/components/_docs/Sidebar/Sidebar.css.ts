import { media, select } from 'surimi';

import { config, theme } from '#styles';

const sidebar = select('.sidebar').style({
  padding: theme.spacing[6],
  borderRight: `1px solid ${theme.border.default}`,
  backgroundColor: theme.bg.canvas,
  position: 'sticky',
  top: config.header.height,
  right: 0,
  height: `calc(100vh - ${config.header.height})`,
  overflowY: 'auto',
  display: 'grid',
  gridTemplateColumns: `auto ${config.docs.sidebar.listWidth}`,
});

sidebar
  .descendant('ul')
  .style({
    listStyle: 'none',
  })
  .descendant('ul')
  .style({
    paddingLeft: 0,
  });

const list = sidebar.child('.sidebar__list').style({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing[3],
  padding: 0,
  margin: 0,
  gridColumn: '2 / 3',
  listStyle: 'none',
});

const category = list.child('.sidebar__category').style({});

category.child('.sidebar__category-title').style({
  fontWeight: theme.font.weight.semibold,
  color: theme.text.muted,
  textTransform: 'uppercase',
  fontSize: theme.font.size.xs,
  marginBottom: theme.spacing[2],
});

const item = list.descendant('.sidebar__doc-item').style({
  padding: `${theme.spacing[2]} 0`,
});

item.join('.sidebar__doc-item--active').style({}).child('.sidebar__doc-link').style({
  color: theme.text.primary,
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
});

item.is('.sidebar__doc-item--empty').style({
  color: theme.text.muted,
});

const docLink = list.descendant('.sidebar__doc-link').style({
  color: theme.text.default,
  textDecoration: 'none',
});

docLink.hover().style({
  color: theme.text.primary,
});

media().maxWidth(config.breakpoints.mobile).select('.sidebar').style({
  display: 'none',
});

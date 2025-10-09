import { select } from 'surimi';

import { theme } from '#styles/theme';

const sidebar = select('.sidebar').style({
  padding: theme.spacing[6],
  borderRight: `1px solid ${theme.border.default}`,
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

sidebar.descendant('h3').style({
  margin: 0,
});

const sidebarList = sidebar.child('.sidebar__list').style({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing[3],
  padding: 0,
  margin: 0,
});

sidebarList.child('.sidebar__category').style({});

sidebarList.descendant('.sidebar__doc-item').style({
  padding: `${theme.spacing[2]} 0`,
});

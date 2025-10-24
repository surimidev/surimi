import { media, select } from 'surimi';

import { theme } from '#styles/theme.ts';

select('.sidebar__mobile').style({
  display: 'none',
  position: 'sticky',
  bottom: 0,
  left: 0,
  width: '100%',
  backgroundColor: theme.bg.canvas,
  padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
  borderTop: `1px solid ${theme.border.default}`,
  zIndex: 1000,
  margin: 0,
});

const buttons = select('.sidebar__mobile__button').style({
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  color: theme.text.subtle,
  transition: 'color 0.2s ease-in-out',
});

buttons.hover().style({
  color: theme.text.default,
});

media().maxWidth(theme.screen.md).select('.sidebar__mobile').style({
  display: 'flex !important',
  justifyContent: 'space-between',
});

select('.sidebar__backdrop').style({
  visibility: 'hidden',
  opacity: 0,
});

media().maxWidth(theme.screen.md).select('html').has('.sidebar--open').descendant('.sidebar__backdrop').style({
  display: 'block',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 2000,
  visibility: 'visible',
  opacity: 1,
  transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
});

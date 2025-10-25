import { media, select } from 'surimi';

import { config, theme } from '#styles';

const header = select('.header').style({
  display: 'flex',
  height: config.header.height,
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing[6],
  padding: `0 ${theme.spacing[8]}`,
  backgroundColor: theme.bg.app,
  color: theme.text.default,
  borderBottom: `1px solid ${theme.border.default}`,
  backdropFilter: 'blur(12px)',
  position: 'sticky',
  top: '0',
  zIndex: 2000,
});

header
  .child('.header__title')
  .style({
    fontWeight: theme.font.weight.bold,
    alignSelf: 'center',
    cursor: 'pointer',
    margin: 0,
  })
  .child('h1')
  .style({
    margin: 0,
    fontSize: theme.font.size.xl,
  });

select('.header__toggle', '.header__backdrop').style({
  display: 'none',
});

media().maxWidth(theme.screen.sm).select('.header__toggle').style({
  display: 'block',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  color: theme.text.subtle,
});

media().maxWidth(theme.screen.md).select('html').has('.header--open').select('.header__backdrop').style({
  display: 'block',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 2000,
});

const right = header.child('.header__right').style({
  display: 'flex',
  gap: theme.spacing[6],
  alignItems: 'center',
  marginLeft: 'auto',
});

const mobileRight = media()
  .maxWidth(theme.screen.sm)
  .select('.header__right')
  .style({
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    width: '75vw',
    maxWidth: '300px',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 2001,
    boxShadow: theme.shadow.md,
    backgroundColor: theme.bg.app,
    display: 'flex',
    flexFlow: 'column',
    padding: `${theme.spacing[6]} 0`,
  });

const mobileNav = mobileRight.child('.header__nav').style({
  flexDirection: 'column',
  width: '100%',
  gap: theme.spacing[3],
});

mobileNav.child('.header__nav-link').style({
  padding: `${theme.spacing[3]} ${theme.spacing[6]} !important`,
  width: '100%',
  borderBottom: `1px solid ${theme.border.default}`,
});

media().maxWidth(theme.screen.sm).select('.header--open .header__right').style({
  transform: 'translateX(0)',
});

const nav = right.child('.header__nav').style({
  display: 'flex',
  gap: theme.spacing[1],
  alignSelf: 'center',
});

nav
  .child('.header__nav-link')
  .style({
    color: theme.text.default,
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.medium,
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    textDecoration: 'none',
    transition: `all ${theme.duration.normal} ${theme.ease.out}`,
    borderRadius: theme.radius.md,
    position: 'relative',
  })
  .hover()
  .style({
    color: theme.text.primary,
  });

const social = right.child('.header__social').style({
  display: 'flex',
  gap: theme.spacing[3],
  alignSelf: 'center',
});

social
  .child('.header__social-link')
  .style({
    color: theme.text.subtle,
    fontSize: theme.font.size.lg,
    transition: `all ${theme.duration.normal} ${theme.ease.out}`,
    textDecoration: 'none',
    borderRadius: theme.radius.base,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  })
  .hover()
  .style({
    color: theme.text.primary,
  });

nav.descendant('svg').style({
  color: theme.text.subtle,
});

social.descendant('svg').style({
  width: '20px',
  height: '20px',
});

const onMobile = media().maxWidth(theme.screen.sm);

const headerMobile = onMobile.select('.header').style({
  padding: `0 ${theme.spacing[6]}`,
  gap: theme.spacing[4],
});

headerMobile.child('.header__title').style({
  fontSize: theme.font.size.lg,
});

headerMobile.descendant('.header__nav').style({
  gap: '0 !important',
});

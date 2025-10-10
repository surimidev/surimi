import { select } from 'surimi';

import { config, theme } from '#styles';

const header = select('.header').style({
  display: 'flex',
  height: config.header.height,
  alignItems: 'center',
  gap: theme.spacing[6],
  padding: `0 ${theme.spacing[8]}`,
  backgroundColor: theme.bg.app,
  color: theme.text.default,
  borderBottom: `1px solid ${theme.border.default}`,
  backdropFilter: 'blur(12px)',
  position: 'sticky',
  top: '0',
  zIndex: '50',
});

header
  .child('.header__title')
  .style({
    flex: '1',
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

const nav = header.child('.header__nav').style({
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

const social = header.child('.header__social').style({
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

social.descendant('svg').style({
  width: '20px',
  height: '20px',
});

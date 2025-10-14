import { media, select } from 'surimi';

import { theme } from '#styles/theme';

const hero = select('.hero').style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing[11],
  background: theme.gradients.subtle,
  color: theme.text.default,
  gap: theme.spacing[6],
  borderBottom: `1px solid ${theme.border.default}`,
  justifyContent: 'center',
});

const title = hero.child('.hero__title').style({
  fontSize: theme.font.size['6xl'],
  fontWeight: theme.font.weight.bold,
  margin: 0,
  lineHeight: theme.font.lineHeight.tight,
  marginBottom: theme.spacing[6],
});

title.child('.hero__title__gradient').style({
  background: theme.gradients.brand,
  backgroundClip: 'text',
  color: 'transparent',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: theme.font.weight.extrabold,
  margin: 0,
  lineHeight: theme.font.lineHeight.tight,
  display: 'block',
});

hero.child('.hero__subtitle').style({
  fontSize: theme.font.size.xl,
  color: theme.text.subtle,
  margin: 0,
  maxWidth: '650px',
  lineHeight: theme.font.lineHeight.relaxed,
  marginBottom: theme.spacing[6],
});

// Button container
hero.child('.hero__buttons').style({
  display: 'flex',
  gap: theme.spacing[4],
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
});

// Base button styles
hero.descendant('.hero__button').style({
  padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
  fontSize: theme.font.size.base,
  fontWeight: theme.font.weight.medium,
  border: 'none',
  borderRadius: theme.radius.md,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing[2],
  transition: `all ${theme.duration.normal} ${theme.ease.out}`,
  boxShadow: theme.shadow.sm,
});

// Primary button (Get Started)
const primaryButton = hero.descendant('.hero__button--primary').style({
  background: theme.gradients.brand,
  color: theme.interactive.primary.text,
});

primaryButton.hover().style({
  backgroundColor: theme.interactive.primary.hover,
  transform: 'translateY(-1px)',
  boxShadow: theme.shadow.md,
});

primaryButton.active().style({
  backgroundColor: theme.interactive.primary.active,
  transform: 'translateY(0)',
});

// Secondary button (View Documentation)
const secondaryButton = hero.descendant('.hero__button--secondary').style({
  backgroundColor: theme.interactive.secondary.default,
  color: theme.interactive.secondary.text,
  border: `1px solid ${theme.border.default}`,
  boxShadow: 'none',
});

secondaryButton.hover().style({
  backgroundColor: theme.interactive.secondary.hover,
  borderColor: theme.border.hover,
  transform: 'translateY(-1px)',
  boxShadow: theme.shadow.sm,
});

secondaryButton.active().style({
  backgroundColor: theme.interactive.secondary.active,
  transform: 'translateY(0)',
});

// Mobile responsive styles
const mobile = media().maxWidth(theme.screen.md);

// Mobile hero container - reduce padding significantly
mobile.select('.hero').style({
  padding: `${theme.spacing[8]} ${theme.spacing[4]}`,
  gap: theme.spacing[4],
});

// Mobile title - smaller font size and better spacing
mobile.select('.hero__title').style({
  fontSize: theme.font.size['4xl'],
  marginBottom: theme.spacing[4],
  lineHeight: theme.font.lineHeight.tight,
});

// Mobile subtitle - smaller text and reduced margin
mobile.select('.hero__subtitle').style({
  fontSize: theme.font.size.lg,
  marginBottom: theme.spacing[4],
  maxWidth: '100%',
  padding: `0 ${theme.spacing[2]}`,
});

// Mobile buttons - stack vertically and adjust sizing
mobile.select('.hero__buttons').style({
  flexDirection: 'column',
  gap: theme.spacing[3],
  width: '100%',
  maxWidth: '320px',
});

// Mobile button styles - full width and better touch targets
mobile.select('.hero__button').style({
  width: '100%',
  padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
  fontSize: theme.font.size.base,
  justifyContent: 'center',
});

// Small mobile adjustments (phones in portrait)
const smallMobile = media().maxWidth(theme.screen.sm);

smallMobile.select('.hero').style({
  padding: `${theme.spacing[6]} ${theme.spacing[3]}`,
});

smallMobile.select('.hero__title').style({
  fontSize: theme.font.size['3xl'],
});

smallMobile.select('.hero__subtitle').style({
  fontSize: theme.font.size.base,
  padding: `0 ${theme.spacing[1]}`,
});

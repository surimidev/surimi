import { select } from 'surimi';

import { theme } from '#styles/theme';

// Footer container
const footer = select('.footer').style({
  backgroundColor: theme.bg.app,
  borderTop: `1px solid ${theme.border.default}`,
  marginTop: 'auto',
});

const footerContainer = footer.child('.footer__container').style({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: `clamp(3rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)`,
});

// Main content area
const footerContent = footerContainer.child('.footer__content').style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 'clamp(2rem, 5vw, 4rem)',
  marginBottom: theme.spacing[7],
});

// Brand section
const footerBrand = footerContent.child('.footer__brand').style({
  maxWidth: '320px',
  width: '100%',
});

const footerLogo = footerBrand.child('.footer__logo').style({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing[3],
  marginBottom: theme.spacing[6],
});

footerLogo.child('.footer__logo-icon').style({
  fontSize: theme.font.size['2xl'],
});

footerLogo.child('.footer__logo-text').style({
  fontSize: theme.font.size.xl,
  fontWeight: theme.font.weight.bold,
  color: theme.text.default,
});

footerBrand.child('.footer__description').style({
  fontSize: theme.font.size.sm,
  color: theme.text.subtle,
  lineHeight: theme.font.lineHeight.relaxed,
  marginBottom: theme.spacing[6],
  margin: `0 0 ${theme.spacing[6]} 0`,
});

// Social links
const footerSocial = footerBrand.child('.footer__social').style({
  display: 'flex',
  gap: theme.spacing[3],
});

const footerSocialLink = footerSocial.child('.footer__social-link').style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  backgroundColor: theme.bg.default,
  color: theme.text.muted,
  borderRadius: theme.radius.md,
  textDecoration: 'none',
  transition: `all ${theme.duration.normal} ${theme.ease.out}`,
  border: `1px solid ${theme.border.default}`,
});

footerSocialLink.hover().style({
  backgroundColor: theme.interactive.primary.default,
  color: theme.interactive.primary.text,
  borderColor: theme.interactive.primary.default,
  transform: 'translateY(-1px)',
});

// Links sections
const footerLinks = footerContent.child('.footer__links').style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: 'clamp(1.5rem, 4vw, 2rem)',
});

const footerSection = footerLinks.child('.footer__section').style({
  display: 'flex',
  flexDirection: 'column',
});

footerSection.child('.footer__section-title').style({
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.semibold,
  color: theme.text.default,
  marginBottom: theme.spacing[4],
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
});

const footerSectionList = footerSection.child('.footer__section-list').style({
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing[2],
});

footerSectionList.child('.footer__section-item').style({
  margin: 0,
});

const footerSectionLink = footerSectionList.descendant('.footer__section-link').style({
  color: theme.text.subtle,
  textDecoration: 'none',
  fontSize: theme.font.size.sm,
  lineHeight: theme.font.lineHeight.relaxed,
  transition: `color ${theme.duration.normal} ${theme.ease.out}`,
});

footerSectionLink.hover().style({
  color: theme.text.primary,
});

// Bottom section
const footerBottom = footerContainer.child('.footer__bottom').style({
  borderTop: `1px solid ${theme.border.default}`,
  paddingTop: theme.spacing[6],
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing[4],
});

footerBottom.child('.footer__copyright').style({
  fontSize: theme.font.size.sm,
  color: theme.text.muted,
  margin: 0,
});

footerBottom.child('.footer__made-with').style({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing[2],
  fontSize: theme.font.size.sm,
  color: theme.text.muted,
  fontWeight: theme.font.weight.medium,
});

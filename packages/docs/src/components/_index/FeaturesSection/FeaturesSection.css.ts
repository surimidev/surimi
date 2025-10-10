import { select } from 'surimi';

import { theme } from '#styles/theme';

// Why Choose Surimi section
const featuresSection = select('.features-section').style({
  padding: `${theme.spacing[8]} ${theme.spacing[6]}`,
  backgroundColor: theme.bg.app,
  borderBottom: `1px solid ${theme.border.default}`,
});

const featuresSectionContainer = featuresSection.child('.features-section__container').style({
  maxWidth: '1200px',
  margin: '0 auto',
});

featuresSectionContainer.child('.features-section__title').style({
  fontSize: theme.font.size['4xl'],
  fontWeight: theme.font.weight.bold,
  textAlign: 'center',
  color: theme.text.default,
  marginBottom: theme.spacing[6],
});

featuresSectionContainer.child('.features-section__subtitle').style({
  fontSize: theme.font.size.lg,
  color: theme.text.subtle,
  textAlign: 'center',
  maxWidth: '700px',
  margin: `0 auto ${theme.spacing[9]}`,
  lineHeight: theme.font.lineHeight.relaxed,
});

const featuresSectionGrid = featuresSectionContainer.child('.features-section__grid').style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: theme.spacing[6],
  marginTop: theme.spacing[8],
});

// Why Choose feature card
const featuresSectionCard = featuresSectionGrid.child('.features-section-card').style({
  backgroundColor: theme.bg.subtle,
  border: `1px solid ${theme.border.default}`,
  borderRadius: theme.radius.lg,
  padding: theme.spacing[8],
  textAlign: 'left',
  transition: `all ${theme.duration.normal} ${theme.ease.out}`,
  boxShadow: theme.shadow.xs,
  position: 'relative',
  overflow: 'hidden',
});

featuresSectionCard.hover().style({
  borderColor: theme.border.primary,
  boxShadow: theme.shadow.md,
  transform: 'translateY(-2px)',
});

featuresSectionCard.child('.features-section-card__icon').style({
  width: '48px',
  height: '48px',
  marginBottom: theme.spacing[4],
  backgroundColor: theme.bg['primary-subtle'],
  borderRadius: theme.radius.lg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.text.primary,
  fontSize: theme.font.size.xl,
});

featuresSectionCard.child('.features-section-card__title').style({
  fontSize: theme.font.size.lg,
  fontWeight: theme.font.weight.semibold,
  color: theme.text.default,
  marginBottom: theme.spacing[3],
  lineHeight: theme.font.lineHeight.tight,
});

featuresSectionCard.child('.features-section-card__description').style({
  fontSize: theme.font.size.sm,
  color: theme.text.subtle,
  lineHeight: theme.font.lineHeight.relaxed,
  margin: 0,
});

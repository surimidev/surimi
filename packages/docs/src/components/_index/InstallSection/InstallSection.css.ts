import { select } from 'surimi';

import { theme } from '#styles/theme';

// Main section
const installSection = select('.install-section').style({
  padding: `clamp(3rem, 8vw, 5rem) clamp(1rem, 4vw, 2rem)`,
  background: theme.gradients.subtleReverse,
});

const installSectionContainer = installSection.child('.install-section__container').style({
  maxWidth: '900px',
  margin: '0 auto',
  width: '100%',
});

// Header
const installSectionHeader = installSectionContainer.child('.install-section__header').style({
  textAlign: 'center',
  marginBottom: theme.spacing[8],
});

installSectionHeader.child('.install-section__badge').style({
  display: 'inline-block',
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  backgroundColor: theme.bg['primary-subtle'],
  color: theme.text.primary,
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.medium,
  borderRadius: theme.radius.full,
  marginBottom: theme.spacing[4],
});

installSectionHeader.child('.install-section__title').style({
  fontSize: 'clamp(1.875rem, 5vw, 2.25rem)',
  fontWeight: theme.font.weight.bold,
  color: theme.text.default,
  marginBottom: theme.spacing[4],
  lineHeight: theme.font.lineHeight.tight,
});

installSectionHeader.child('.install-section__subtitle').style({
  fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
  color: theme.text.subtle,
  lineHeight: theme.font.lineHeight.relaxed,
  maxWidth: '500px',
  margin: '0 auto',
});

// Install commands
const installSectionCommands = installSectionContainer.child('.install-section__commands').style({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing[4],
  marginBottom: theme.spacing[8],
});

const installCommand = installSectionCommands.child('.install-command').style({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.bg.subtle,
  border: `1px solid ${theme.border.default}`,
  borderRadius: theme.radius.lg,
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  gap: theme.spacing[3],
  transition: `all ${theme.duration.normal} ${theme.ease.out}`,
  minHeight: '60px',
  flexWrap: 'wrap',
});

installCommand.hover().style({
  borderColor: theme.border.primary,
  boxShadow: theme.shadow.sm,
});

const installCommandContent = installCommand.child('.install-command__content').style({
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  gap: theme.spacing[2],
  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
  minWidth: '200px',
  fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
});

installCommandContent.child('.install-command__prompt').style({
  color: theme.text.primary,
  fontWeight: theme.font.weight.bold,
  flexShrink: 0,
});

installCommandContent.child('.install-command__text').style({
  color: theme.text.default,
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  wordBreak: 'break-all',
});

// Copy button
const installCommandCopy = installCommand.child('.install-command__copy').style({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing[1],
  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
  backgroundColor: theme.interactive.secondary.default,
  color: theme.interactive.secondary.text,
  border: 'none',
  borderRadius: theme.radius.md,
  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
  fontWeight: theme.font.weight.medium,
  cursor: 'pointer',
  transition: `all ${theme.duration.normal} ${theme.ease.out}`,
  flexShrink: 0,
  whiteSpace: 'nowrap',
});

installCommandCopy.hover().style({
  backgroundColor: theme.interactive.secondary.hover,
});

installCommandCopy.descendant('svg').style({
  width: '14px',
  height: '14px',
});

// Quick Start section
const installSectionQuickstart = installSectionContainer.child('.install-section__quickstart').style({
  backgroundColor: theme.bg.subtle,
  border: `1px solid ${theme.border.default}`,
  borderRadius: theme.radius.xl,
  padding: 'clamp(1.5rem, 4vw, 2rem)',
});

installSectionQuickstart.child('.install-section__quickstart-title').style({
  fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
  fontWeight: theme.font.weight.semibold,
  color: theme.text.default,
  marginBottom: theme.spacing[6],
  textAlign: 'left',
});

// Steps list
const installSectionSteps = installSectionQuickstart.child('.install-section__steps').style({
  listStyle: 'none',
  padding: 0,
  margin: `0 0 ${theme.spacing[8]} 0`,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing[4],
});

const installSectionStep = installSectionSteps.child('.install-section__step').style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing[4],
});

installSectionStep.child('.install-section__step-number').style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  backgroundColor: theme.interactive.primary.default,
  color: theme.interactive.primary.text,
  borderRadius: theme.radius.full,
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.bold,
  flexShrink: 0,
});

installSectionStep.child('.install-section__step-text').style({
  color: theme.text.default,
  fontSize: theme.font.size.base,
  lineHeight: theme.font.lineHeight.relaxed,
  paddingTop: '2px',
});

// Documentation link
const installSectionDocsLink = installSectionQuickstart.child('.install-section__docs-link').style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing[2],
  color: theme.text.primary,
  fontSize: theme.font.size.base,
  fontWeight: theme.font.weight.medium,
  textDecoration: 'none',
  transition: `all ${theme.duration.normal} ${theme.ease.out}`,
});

installSectionDocsLink.hover().style({
  color: theme.interactive.primary.hover,
});

installSectionDocsLink.descendant('svg').style({
  width: '16px',
  height: '16px',
});

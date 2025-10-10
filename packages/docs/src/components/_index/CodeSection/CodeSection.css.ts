import { select } from 'surimi';

import { theme } from '#styles/theme';

// Main section
const codeSection = select('.code-section').style({
  padding: '80px 24px',
  backgroundColor: theme.bg.subtle,
  textAlign: 'center',
  borderBottom: `1px solid ${theme.border.default}`,
});

codeSection.child('h2').style({
  fontSize: '2.5rem',
  fontWeight: 700,
  color: theme.text.default,
  marginBottom: '16px',
  lineHeight: 1.2,
});

codeSection.child('.section-subtitle').style({
  fontSize: '1.125rem',
  color: theme.text.subtle,
  marginBottom: '48px',
  margin: '0 auto 48px',
});

// Code comparison grid
const codeComparison = codeSection.child('.code-comparison').style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '24px',
  maxWidth: '70%',
  margin: '0 auto 40px',
});

// Code blocks
const codeBlock = codeComparison.child('.code-block').style({
  backgroundColor: theme.bg.canvas,
  borderRadius: '12px',
  border: `1px solid ${theme.border.default}`,
  overflow: 'hidden',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
});

codeBlock.hover().style({
  transform: 'translateY(-2px)',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
});

// Surimi code block special styling
const surimiCodeBlock = codeComparison.child('.code-block.code-block--surimi').style({
  border: `1px solid ${theme.interactive.primary.default}`,
});

// Code header
const codeHeader = codeBlock.child('.code-header').style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  backgroundColor: theme.bg.default,
  borderBottom: `1px solid ${theme.border.default}`,
});

// Surimi header gradient
select('.code-block--surimi .code-header').style({
  background: `linear-gradient(135deg, ${theme.interactive.primary.default}, ${theme.interactive.primary.hover})`,
});

codeHeader.child('.code-label').style({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: theme.text.subtle,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

surimiCodeBlock.descendant('.code-header .code-label').style({
  color: theme.text.inverse,
});

// Code content
codeBlock.child('pre').style({
  margin: 0,
  padding: '20px',
  backgroundColor: theme.bg.subtle,
  overflow: 'auto',
  textAlign: 'left',
});

codeBlock.descendant('code').style({
  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
  fontSize: '0.875rem',
  lineHeight: 1.6,
  color: theme.text.default,
  whiteSpace: 'pre-wrap',
});

// Pro tip
const proTip = codeSection.child('.pro-tip').style({
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px 24px',
  backgroundColor: theme.bg['primary-subtle'],
  border: `1px solid ${theme.interactive.primary.default}`,
  borderRadius: '12px',
  fontSize: '1rem',
  lineHeight: 1.6,
  color: theme.text.default,
  textAlign: 'left',
});

proTip.child('strong').style({
  color: theme.interactive.primary.default,
  fontWeight: 600,
});

import { select } from 'surimi';

import { theme } from '#styles';

const lectureContent = select('.lecture-content').style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.bg.app,
  overflow: 'hidden',
});

lectureContent.descendant('.lecture-content__header').style({
  padding: theme.spacing[6],
  borderBottom: `1px solid ${theme.border.default}`,
  backgroundColor: theme.bg.subtle,
});

lectureContent.descendant('.lecture-content__header h2').style({
  margin: '0 0 0.5rem 0',
  fontSize: theme.font.size['2xl'],
  fontWeight: theme.font.weight.bold,
  color: theme.text.default,
});

lectureContent.descendant('.lecture-content__progress').style({
  fontSize: theme.font.size.sm,
  color: theme.text.subtle,
  fontWeight: theme.font.weight.medium,
});

lectureContent.descendant('.lecture-content__body').style({
  flex: '1',
  overflow: 'auto',
  padding: theme.spacing[6],
});

const markdown = lectureContent.descendant('.lecture-content__markdown');

markdown.style({
  fontSize: theme.font.size.base,
  lineHeight: '1.7',
  color: theme.text.default,
});

markdown.child('h1, h2, h3, h4, h5, h6').style({
  marginTop: '1.5em',
  marginBottom: '0.5em',
  fontWeight: theme.font.weight.bold,
  lineHeight: '1.3',
  color: theme.text.default,
});

markdown.child('h1').style({
  fontSize: theme.font.size['2xl'],
  borderBottom: `2px solid ${theme.border.default}`,
  paddingBottom: '0.3em',
});

markdown.child('h2').style({
  fontSize: theme.font.size.xl,
});

markdown.child('h3').style({
  fontSize: theme.font.size.lg,
});

markdown.child('p').style({
  marginTop: '0',
  marginBottom: '1em',
});

markdown.child('code').style({
  padding: '0.2em 0.4em',
  backgroundColor: theme.bg.subtle,
  borderRadius: '3px',
  fontSize: '0.9em',
  fontFamily: 'monospace',
});

markdown.child('pre').style({
  padding: theme.spacing[4],
  backgroundColor: theme.bg.subtle,
  borderRadius: '6px',
  overflow: 'auto',
  marginBottom: '1em',
});

markdown.child('pre code').style({
  padding: '0',
  backgroundColor: 'transparent',
});

markdown.child('ul, ol').style({
  paddingLeft: '1.5em',
  marginBottom: '1em',
});

markdown.child('li').style({
  marginBottom: '0.5em',
});

lectureContent.descendant('.lecture-content__navigation').style({
  display: 'flex',
  gap: theme.spacing[3],
  padding: theme.spacing[6],
  borderTop: `1px solid ${theme.border.default}`,
  backgroundColor: theme.bg.subtle,
});

const navButton = select('.lecture-content__nav-button').style({
  flex: '1',
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.medium,
  border: `1px solid ${theme.border.default}`,
  borderRadius: '6px',
  backgroundColor: theme.bg.app,
  color: theme.text.default,
  cursor: 'pointer',
  transition: 'all 0.15s',
});

navButton.hover().select(':not(:disabled)').style({
  backgroundColor: theme.bg.hover,
  borderColor: theme.border.strong,
});

navButton.disabled().style({
  opacity: '0.5',
  cursor: 'not-allowed',
});

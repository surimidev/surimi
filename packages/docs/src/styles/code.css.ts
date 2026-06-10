import { select } from 'surimi';

import { theme } from './theme';

// Shiki dual-theme code blocks (Astro markdown). Match the editor surface and follow
// dark mode via the --shiki-light / --shiki-dark vars from `defaultColor: false`.
select('.astro-code', '.shiki').style({
  color: 'var(--shiki-light)',
  backgroundColor: theme.bg.canvas,
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  borderRadius: theme.radius.base,
  border: `1px solid ${theme.border.default}`,
  fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: theme.font.size.sm,
});

select('.astro-code span', '.shiki span').style({
  color: 'var(--shiki-light)',
});

select('[data-theme="dark"] .astro-code', '[data-theme="dark"] .shiki').style({
  color: 'var(--shiki-dark)',
});

select('[data-theme="dark"] .astro-code span', '[data-theme="dark"] .shiki span').style({
  color: 'var(--shiki-dark)',
});

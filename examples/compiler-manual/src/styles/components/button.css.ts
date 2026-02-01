import { select, style } from 'surimi';
import { focusable, hoverable, disabled } from '../utils/mixins.css';
import { primary, secondary, success, danger } from '../theme/colors.css';

const baseButton = style({
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  border: 'none',
  fontSize: '1rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

export const button = select('.button')
  .use(focusable, hoverable, disabled)
  .style(baseButton);

export const buttonPrimary = select('.button-primary')
  .use(primary)
  .style(baseButton);

export const buttonSecondary = select('.button-secondary')
  .use(secondary)
  .style(baseButton);

export const buttonSuccess = select('.button-success')
  .use(success)
  .style(baseButton);

export const buttonDanger = select('.button-danger')
  .use(danger)
  .style(baseButton);

export const buttonLarge = select('.button-large').style({
  padding: '0.75rem 1.5rem',
  fontSize: '1.125rem',
});

export const buttonSmall = select('.button-small').style({
  padding: '0.25rem 0.5rem',
  fontSize: '0.875rem',
});

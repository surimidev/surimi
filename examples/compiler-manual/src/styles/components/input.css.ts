import { select } from 'surimi';
import { focusable, disabled } from '../utils/mixins.css';

export const input = select('input[type="text"], input[type="email"], input[type="password"]')
  .use(focusable, disabled)
  .style({
    padding: '0.5rem 0.75rem',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    width: '100%',
    transition: 'border-color 0.2s ease',
  });

export const inputError = select('input.error').style({
  borderColor: '#ef4444',
});

export const inputSuccess = select('input.success').style({
  borderColor: '#10b981',
});

export const label = select('label').style({
  display: 'block',
  marginBottom: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: '500',
  color: '#374151',
});

export const helpText = select('.help-text').style({
  fontSize: '0.75rem',
  color: '#6b7280',
  marginTop: '0.25rem',
});

export const errorText = select('.error-text').style({
  fontSize: '0.75rem',
  color: '#ef4444',
  marginTop: '0.25rem',
});

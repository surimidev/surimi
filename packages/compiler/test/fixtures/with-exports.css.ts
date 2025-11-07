import { select } from 'surimi';

// Theme object to be exported
export const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
  },
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '2rem',
  },
};

// String export
export const className = 'my-component';

// Number export
export const zIndex = 1000;

select('.themed').style({
  backgroundColor: theme.colors.primary,
  padding: theme.spacing.medium,
});

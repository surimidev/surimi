import { color, length } from 'surimi';

export const theme = {
  colors: {
    primary: color('color-primary', '#6366f1'),
    primaryDark: color('color-primary-dark', '#4338ca'),
    primaryLight: color('color-primary-light', '#818cf8'),
    secondary: color('color-secondary', '#ec4899'),
    secondaryDark: color('color-secondary-dark', '#db2777'),
    secondaryLight: color('color-secondary-light', '#f0abfc'),
    background: color('color-background', '#f3f4f6'),
    text: color('color-text', '#111827'),
  },
  spacing: {
    small: length('space-small', '8px'),
    medium: length('space-medium', '16px'),
    large: length('space-large', '24px'),
  },
} as const;

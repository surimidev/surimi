import { property } from 'surimi';

export const theme = {
  colors: {
    primary: property('color-primary', '#6366f1', '<color>'),
    primaryDark: property('color-primary-dark', '#4338ca', '<color>'),
    primaryLight: property('color-primary-light', '#818cf8', '<color>'),
    secondary: property('color-secondary', '#ec4899', '<color>'),
    secondaryDark: property('color-secondary-dark', '#db2777', '<color>'),
    secondaryLight: property('color-secondary-light', '#f0abfc', '<color>'),
    background: property('color-background', '#f3f4f6', '<color>'),
    text: property('color-text', '#111827', '<color>'),
  },
  spacing: {
    small: property('space-small', '8px', '<length>'),
    medium: property('space-medium', '16px', '<length>'),
    large: property('space-large', '24px', '<length>'),
  },
} as const;

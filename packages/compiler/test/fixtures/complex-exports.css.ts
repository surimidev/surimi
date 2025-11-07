import { select } from 'surimi';

// Array export
export const breakpoints = ['640px', '768px', '1024px', '1280px'];

// Boolean export
export const isDarkMode = false;

// Nested object export
export const config = {
  theme: {
    colors: {
      primary: '#3b82f6',
      text: {
        dark: '#1f2937',
        light: '#f9fafb',
      },
    },
  },
  features: {
    animations: true,
    darkMode: false,
  },
};

select('.complex').style({
  color: config.theme.colors.text.dark,
});

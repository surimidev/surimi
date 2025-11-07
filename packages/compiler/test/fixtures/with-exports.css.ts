// Test fixture with various exports
import { select } from 'surimi';

select('.card').style({
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
});

// Export various types
export const className = 'card-component';
export const spacing = 16;
export const isEnabled = true;
export const config = {
  theme: 'dark',
  animation: true,
};
export const tags = ['react', 'typescript'];

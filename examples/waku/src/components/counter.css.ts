import { select } from 'surimi';
import { theme } from '../styles/theme.css';

select('.counter button').style({
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'background-color 0.3s ease',
  position: 'relative',
  backgroundColor: theme.colors.primary,
});

select('.counter button').hover().style({
  backgroundColor: theme.colors.primaryDark,
});
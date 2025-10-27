import { select } from 'surimi';

import { primaryBackground, surimiIconAfter } from '#styles/mixins.css';
import { theme } from '#styles/theme';

const buttonElem = select('.button').use(primaryBackground).style({
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'background-color 0.3s ease',
  position: 'relative',
});

buttonElem.use(surimiIconAfter);

buttonElem.hover().style({
  backgroundColor: theme.colors.primaryDark,
});

buttonElem.disabled().style({
  backgroundColor: theme.colors.background,
  cursor: 'not-allowed',
});

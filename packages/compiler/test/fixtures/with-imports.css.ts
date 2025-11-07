import { select } from 'surimi';
import { theme } from './with-exports';

select('.imported').style({
  backgroundColor: theme.colors.primary,
  color: 'white',
  padding: theme.spacing.large,
});

select('.secondary').style({
  backgroundColor: theme.colors.secondary,
});

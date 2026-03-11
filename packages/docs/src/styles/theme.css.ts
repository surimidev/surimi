import { select } from 'surimi';

import { getThemeVars } from './theme';

const { light: lightVars, dark: darkVars } = getThemeVars();

select(':root').style(lightVars);
select('[data-theme="dark"]').style(darkVars);

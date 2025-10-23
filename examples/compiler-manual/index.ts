import { media } from 'surimi';

media()
  .maxWidth('600px')
  .and()
  .minHeight('200px')
  .select('html')
  .descendant('.button')
  .hover()
  .child('.icon')
  .where('.svg')
  .style({
    display: 'none',
  });

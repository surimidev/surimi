import { describe, expectTypeOf, it } from 'vitest';

import { tokenize } from '#tokenize';

describe('complex selectors', () => {
  it('tokenizes a complex selector', () => {
    const input = 'div.class#id[attr="value"]:hover > span::before';

    type Expected = [
      { type: 'type'; content: 'div'; name: 'div' },
      { type: 'class'; content: '.class'; name: 'class' },
      { type: 'id'; content: '#id'; name: 'id' },
      { type: 'attribute'; content: '[attr="value"]'; name: 'attr'; operator: '='; value: '"value"' },
      { type: 'pseudo-class'; content: ':hover'; name: 'hover' },
      { type: 'combinator'; content: '>' },
      { type: 'type'; content: 'span'; name: 'span' },
      { type: 'pseudo-element'; content: '::before'; name: 'before' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });
});

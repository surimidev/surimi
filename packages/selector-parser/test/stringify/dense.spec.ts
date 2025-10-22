import { describe, expect, it } from 'vitest';

import type { Token } from '#index';
import { stringifyDense } from '#index';

describe('stringifies selectors densely', () => {
  it('should stringify commas densely', () => {
    const input = [
      { type: 'type', content: 'div', name: 'div' },
      { type: 'comma', content: ',' },
      { type: 'class', content: '.active', name: 'active' },
    ] as const satisfies Token[];

    const expected = 'div,.active';

    const result = stringifyDense(input);
    expect(result).toEqual(expected);
  });

  it('should stringify combinators densely', () => {
    const input = [
      { type: 'type', content: 'ul', name: 'ul' },
      { type: 'combinator', content: '>' },
      { type: 'type', content: 'li', name: 'li' },
    ] as const satisfies Token[];

    const expected = 'ul>li';

    const result = stringifyDense(input);
    expect(result).toEqual(expected);
  });

  it('should stringify complex selectors densely', () => {
    const input = [
      { type: 'type', content: 'div', name: 'div' },
      { type: 'class', content: '.container', name: 'container' },
      { type: 'combinator', content: '+' },
      { type: 'type', content: 'span', name: 'span' },
      { type: 'pseudo-class', content: ':hover', name: 'hover' },
    ] as const satisfies Token[];

    const expected = 'div.container+span:hover';

    const result = stringifyDense(input);
    expect(result).toEqual(expected);
  });
});

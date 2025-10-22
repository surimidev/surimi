import { describe, expectTypeOf, it } from 'vitest';

import { tokenize } from '#tokenize';

describe('pseudo-class and pseudo-element selectors', () => {
  it('tokenizes pseudo-classes and pseudo-elements', () => {
    const input = 'a:hover::after';

    type Expected = [
      { type: 'type'; content: 'a'; name: 'a' },
      { type: 'pseudo-class'; content: ':hover'; name: 'hover' },
      { type: 'pseudo-element'; content: '::after'; name: 'after' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes multiple pseudo-classes', () => {
    const input = 'button:active:focus';

    type Expected = [
      { type: 'type'; content: 'button'; name: 'button' },
      { type: 'pseudo-class'; content: ':active'; name: 'active' },
      { type: 'pseudo-class'; content: ':focus'; name: 'focus' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes pseudo-classes with parameters', () => {
    const input = 'li:nth-child(2n+1)';

    type Expected = [
      { type: 'type'; content: 'li'; name: 'li' },
      { type: 'pseudo-class'; content: ':nth-child(2n+1)'; name: 'nth-child'; argument: '2n+1' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes `is` pseudo-class with selector argument', () => {
    const input = 'div:is(.class1, #id2)';

    type Expected = [
      { type: 'type'; content: 'div'; name: 'div' },
      { type: 'pseudo-class'; content: ':is(.class1, #id2)'; name: 'is'; argument: '.class1, #id2' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes `not` pseudo-class with selector argument', () => {
    const input = 'span:not(.excluded)';

    type Expected = [
      { type: 'type'; content: 'span'; name: 'span' },
      { type: 'pseudo-class'; content: ':not(.excluded)'; name: 'not'; argument: '.excluded' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes `where` pseudo-class with selector argument', () => {
    const input = 'p:where(.optional)';

    type Expected = [
      { type: 'type'; content: 'p'; name: 'p' },
      { type: 'pseudo-class'; content: ':where(.optional)'; name: 'where'; argument: '.optional' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });
});

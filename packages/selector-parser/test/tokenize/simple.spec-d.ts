import { describe, expectTypeOf, it } from 'vitest';

import { tokenize } from '#tokenize';

describe('simple selectors', () => {
  it('tokenizes a type selector', () => {
    const input = 'div';

    type Expected = [{ type: 'type'; content: 'div'; name: 'div' }];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes a universal selector', () => {
    const input = '*';

    type Expected = [{ type: 'universal'; content: '*' }];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes a class selector', () => {
    const input = '.my-class';

    type Expected = [{ type: 'class'; content: '.my-class'; name: 'my-class' }];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes an ID selector', () => {
    const input = '#my-id';

    type Expected = [{ type: 'id'; content: '#my-id'; name: 'my-id' }];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes a pseudo-class selector', () => {
    const input = ':hover';

    type Expected = [{ type: 'pseudo-class'; content: ':hover'; name: 'hover' }];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes a pseudo-element selector', () => {
    const input = '::before';

    type Expected = [{ type: 'pseudo-element'; content: '::before'; name: 'before' }];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });
});

describe('simple combinators', () => {
  it('tokenizes simple descendant combinations', () => {
    const input = 'div span';

    type Expected = [
      { type: 'type'; content: 'div'; name: 'div' },
      { type: 'combinator'; content: ' ' },
      { type: 'type'; content: 'span'; name: 'span' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes simple child combinations', () => {
    const input = 'div > span';

    type Expected = [
      { type: 'type'; content: 'div'; name: 'div' },
      { type: 'combinator'; content: '>' },
      { type: 'type'; content: 'span'; name: 'span' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes simple adjacent sibling combinations', () => {
    const input = 'div + span';

    type Expected = [
      { type: 'type'; content: 'div'; name: 'div' },
      { type: 'combinator'; content: '+' },
      { type: 'type'; content: 'span'; name: 'span' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes simple general sibling combinations', () => {
    const input = 'div ~ span';

    type Expected = [
      { type: 'type'; content: 'div'; name: 'div' },
      { type: 'combinator'; content: '~' },
      { type: 'type'; content: 'span'; name: 'span' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes multiple combinators', () => {
    const input = '.button > .icon + a';

    type Expected = [
      { type: 'class'; content: '.button'; name: 'button' },
      { type: 'combinator'; content: '>' },
      { type: 'class'; content: '.icon'; name: 'icon' },
      { type: 'combinator'; content: '+' },
      { type: 'type'; content: 'a'; name: 'a' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });
});

describe('simple combined selectors', () => {
  it('tokenizes ID and class combinations', () => {
    const input = '#header.navbar';

    type Expected = [
      { type: 'id'; content: '#header'; name: 'header' },
      { type: 'class'; content: '.navbar'; name: 'navbar' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes type and pseudo-class combinations', () => {
    const input = 'a:hover';

    type Expected = [
      { type: 'type'; content: 'a'; name: 'a' },
      { type: 'pseudo-class'; content: ':hover'; name: 'hover' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes more combinators', () => {
    const input = 'ul > li + li ~ li';

    type Expected = [
      { type: 'type'; content: 'ul'; name: 'ul' },
      { type: 'combinator'; content: '>' },
      { type: 'type'; content: 'li'; name: 'li' },
      { type: 'combinator'; content: '+' },
      { type: 'type'; content: 'li'; name: 'li' },
      { type: 'combinator'; content: '~' },
      { type: 'type'; content: 'li'; name: 'li' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes class and pseudo-element combinations', () => {
    const input = '.button::after';

    type Expected = [
      { type: 'class'; content: '.button'; name: 'button' },
      { type: 'pseudo-element'; content: '::after'; name: 'after' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes class combinations', () => {
    const input = 'div.class1.class2';

    type Expected = [
      { type: 'type'; content: 'div'; name: 'div' },
      { type: 'class'; content: '.class1'; name: 'class1' },
      { type: 'class'; content: '.class2'; name: 'class2' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes ID combinations', () => {
    const input = 'div#id1#id2';

    type Expected = [
      { type: 'type'; content: 'div'; name: 'div' },
      { type: 'id'; content: '#id1'; name: 'id1' },
      { type: 'id'; content: '#id2'; name: 'id2' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes type, class, ID combinations', () => {
    const input = 'div.class#id';

    type Expected = [
      { type: 'type'; content: 'div'; name: 'div' },
      { type: 'class'; content: '.class'; name: 'class' },
      { type: 'id'; content: '#id'; name: 'id' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });

  it('tokenizes pseudo-class and pseudo-element combinations', () => {
    const input = 'a:hover::after';

    type Expected = [
      { type: 'type'; content: 'a'; name: 'a' },
      { type: 'pseudo-class'; content: ':hover'; name: 'hover' },
      { type: 'pseudo-element'; content: '::after'; name: 'after' },
    ];

    const tokens = tokenize(input);
    expectTypeOf(tokens).toEqualTypeOf<Expected>();
  });
});

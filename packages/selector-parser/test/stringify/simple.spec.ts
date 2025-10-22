import { describe, expect, it } from 'vitest';

import type { Token } from '#index';
import { stringify } from '#index';

describe('stringify - Simple Selectors', () => {
  describe('Type Selectors', () => {
    it('should stringify a simple type selector', () => {
      const input = [{ type: 'type', content: 'div', name: 'div' }] as const satisfies Token[];

      const expected = 'div';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });

    it('should stringify uppercase type selector', () => {
      const input = [{ type: 'type', content: 'DIV', name: 'DIV' }] as const satisfies Token[];

      const expected = 'DIV';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });

    it('should stringify different type selectors', () => {
      const input = [{ type: 'type', content: 'span', name: 'span' }] as const satisfies Token[];

      const expected = 'span';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });
  });

  describe('Universal Selector', () => {
    it('should stringify universal selector', () => {
      const input = [{ type: 'universal', content: '*' }] as const satisfies Token[];

      const expected = '*';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });
  });

  describe('Class Selectors', () => {
    it('should stringify a class selector', () => {
      const input = [{ type: 'class', content: '.my-class', name: 'my-class' }] as const satisfies Token[];

      const expected = '.my-class';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });

    it('should stringify class with underscores', () => {
      const input = [{ type: 'class', content: '.my_class', name: 'my_class' }] as const satisfies Token[];

      const expected = '.my_class';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });

    it('should stringify class with numbers', () => {
      const input = [{ type: 'class', content: '.class123', name: 'class123' }] as const satisfies Token[];

      const expected = '.class123';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });
  });

  describe('ID Selectors', () => {
    it('should stringify an ID selector', () => {
      const input = [{ type: 'id', content: '#my-id', name: 'my-id' }] as const satisfies Token[];

      const expected = '#my-id';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });

    it('should stringify ID with underscores', () => {
      const input = [{ type: 'id', content: '#my_id', name: 'my_id' }] as const satisfies Token[];

      const expected = '#my_id';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });

    it('should stringify ID with numbers', () => {
      const input = [{ type: 'id', content: '#id123', name: 'id123' }] as const satisfies Token[];

      const expected = '#id123';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });
  });

  describe('Pseudo-Classes', () => {
    it('should stringify pseudo-class without argument', () => {
      const input = [{ type: 'pseudo-class', content: ':hover', name: 'hover' }] as const satisfies Token[];

      const expected = ':hover';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });

    it('should stringify pseudo-class with argument', () => {
      const input = [
        { type: 'pseudo-class', content: ':nth-child(2n+1)', name: 'nth-child', argument: '2n+1' },
      ] as const satisfies Token[];

      const expected = ':nth-child(2n+1)';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });

    it('should stringify pseudo-class with empty argument', () => {
      const input = [
        { type: 'pseudo-class', content: ':where()', name: 'where', argument: '' },
      ] as const satisfies Token[];

      const expected = ':where()';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });

    it('should stringify pseudo-class with nested selector argument', () => {
      const input = [
        { type: 'pseudo-class', content: ':is(.a, :not(.b))', name: 'is', argument: '.a, :not(.b)' },
      ] as const satisfies Token[];

      const expected = ':is(.a, :not(.b))';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });
  });

  describe('Pseudo-Elements', () => {
    it('should stringify pseudo-element', () => {
      const input = [{ type: 'pseudo-element', content: '::before', name: 'before' }] as const satisfies Token[];

      const expected = '::before';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });

    it('should stringify ::after', () => {
      const input = [{ type: 'pseudo-element', content: '::after', name: 'after' }] as const satisfies Token[];

      const expected = '::after';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });

    it('should stringify ::first-line', () => {
      const input = [
        { type: 'pseudo-element', content: '::first-line', name: 'first-line' },
      ] as const satisfies Token[];

      const expected = '::first-line';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });
  });
});

describe('stringify - Combinators', () => {
  describe('Descendant Combinator', () => {
    it('should stringify descendant combinator', () => {
      const input = [
        { type: 'type', content: 'div', name: 'div' },
        { type: 'combinator', content: ' ' },
        { type: 'type', content: 'span', name: 'span' },
      ] as const satisfies Token[];

      const expected = 'div span';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });

    it('should stringify multiple descendant combinators', () => {
      const input = [
        { type: 'type', content: 'div', name: 'div' },
        { type: 'combinator', content: ' ' },
        { type: 'type', content: 'span', name: 'span' },
        { type: 'combinator', content: ' ' },
        { type: 'type', content: 'a', name: 'a' },
      ] as const satisfies Token[];

      const expected = 'div span a';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });
  });

  describe('Child Combinator', () => {
    it('should stringify child combinator', () => {
      const input = [
        { type: 'type', content: 'div', name: 'div' },
        { type: 'combinator', content: '>' },
        { type: 'type', content: 'span', name: 'span' },
      ] as const satisfies Token[];

      const expected = 'div > span';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });

    it('should stringify child combinator with spaces', () => {
      const input = [
        { type: 'type', content: 'div', name: 'div' },
        { type: 'combinator', content: ' > ' },
        { type: 'type', content: 'span', name: 'span' },
      ] as const satisfies Token[];

      const expected = 'div > span';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });
  });

  describe('Adjacent Sibling Combinator', () => {
    it('should stringify adjacent sibling combinator', () => {
      const input = [
        { type: 'type', content: 'div', name: 'div' },
        { type: 'combinator', content: '+' },
        { type: 'type', content: 'span', name: 'span' },
      ] as const satisfies Token[];

      const expected = 'div + span';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });

    it('should stringify adjacent sibling combinator with spaces', () => {
      const input = [
        { type: 'type', content: 'div', name: 'div' },
        { type: 'combinator', content: ' + ' },
        { type: 'type', content: 'span', name: 'span' },
      ] as const satisfies Token[];

      const expected = 'div + span';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });
  });

  describe('General Sibling Combinator', () => {
    it('should stringify general sibling combinator', () => {
      const input = [
        { type: 'type', content: 'div', name: 'div' },
        { type: 'combinator', content: '~' },
        { type: 'type', content: 'span', name: 'span' },
      ] as const satisfies Token[];

      const expected = 'div ~ span';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });

    it('should stringify general sibling combinator with spaces', () => {
      const input = [
        { type: 'type', content: 'div', name: 'div' },
        { type: 'combinator', content: ' ~ ' },
        { type: 'type', content: 'span', name: 'span' },
      ] as const satisfies Token[];

      const expected = 'div ~ span';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });
  });

  describe('Column Combinator', () => {
    it('should stringify column combinator', () => {
      const input = [
        { type: 'type', content: 'col', name: 'col' },
        { type: 'combinator', content: '||' },
        { type: 'type', content: 'td', name: 'td' },
      ] as const satisfies Token[];

      const expected = 'col || td';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });
  });

  describe('Mixed Combinators', () => {
    it('should stringify multiple different combinators', () => {
      const input = [
        { type: 'type', content: 'ul', name: 'ul' },
        { type: 'combinator', content: '>' },
        { type: 'type', content: 'li', name: 'li' },
        { type: 'combinator', content: '+' },
        { type: 'type', content: 'li', name: 'li' },
        { type: 'combinator', content: '~' },
        { type: 'type', content: 'li', name: 'li' },
      ] as const satisfies Token[];

      const expected = 'ul > li + li ~ li';

      const result = stringify(input);
      expect(result).toEqual(expected);
    });
  });
});

describe('stringify - Compound Selectors', () => {
  it('should stringify type with class', () => {
    const input = [
      { type: 'type', content: 'div', name: 'div' },
      { type: 'class', content: '.container', name: 'container' },
    ] as const satisfies Token[];

    const expected = 'div.container';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify type with ID', () => {
    const input = [
      { type: 'type', content: 'div', name: 'div' },
      { type: 'id', content: '#main', name: 'main' },
    ] as const satisfies Token[];

    const expected = 'div#main';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify type with class and ID', () => {
    const input = [
      { type: 'type', content: 'div', name: 'div' },
      { type: 'class', content: '.container', name: 'container' },
      { type: 'id', content: '#main', name: 'main' },
    ] as const satisfies Token[];

    const expected = 'div.container#main';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify multiple classes', () => {
    const input = [
      { type: 'type', content: 'div', name: 'div' },
      { type: 'class', content: '.class1', name: 'class1' },
      { type: 'class', content: '.class2', name: 'class2' },
      { type: 'class', content: '.class3', name: 'class3' },
    ] as const satisfies Token[];

    const expected = 'div.class1.class2.class3';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify multiple IDs', () => {
    const input = [
      { type: 'type', content: 'div', name: 'div' },
      { type: 'id', content: '#id1', name: 'id1' },
      { type: 'id', content: '#id2', name: 'id2' },
    ] as const satisfies Token[];

    const expected = 'div#id1#id2';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify type with pseudo-class', () => {
    const input = [
      { type: 'type', content: 'a', name: 'a' },
      { type: 'pseudo-class', content: ':hover', name: 'hover' },
    ] as const satisfies Token[];

    const expected = 'a:hover';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify type with pseudo-element', () => {
    const input = [
      { type: 'type', content: 'p', name: 'p' },
      { type: 'pseudo-element', content: '::first-line', name: 'first-line' },
    ] as const satisfies Token[];

    const expected = 'p::first-line';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify type with pseudo-class and pseudo-element', () => {
    const input = [
      { type: 'type', content: 'a', name: 'a' },
      { type: 'pseudo-class', content: ':hover', name: 'hover' },
      { type: 'pseudo-element', content: '::after', name: 'after' },
    ] as const satisfies Token[];

    const expected = 'a:hover::after';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify complex compound selector', () => {
    const input = [
      { type: 'type', content: 'div', name: 'div' },
      { type: 'class', content: '.class', name: 'class' },
      { type: 'id', content: '#id', name: 'id' },
      { type: 'attribute', content: '[attr]', name: 'attr' },
      { type: 'pseudo-class', content: ':hover', name: 'hover' },
      { type: 'pseudo-element', content: '::before', name: 'before' },
    ] as const satisfies Token[];

    const expected = 'div.class#id[attr]:hover::before';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });
});

describe('stringify - Namespaces', () => {
  it('should stringify namespace with type', () => {
    const input = [{ type: 'type', content: 'svg|rect', name: 'rect', namespace: 'svg' }] as const satisfies Token[];

    const expected = 'svg|rect';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify universal namespace', () => {
    const input = [{ type: 'type', content: '*|div', name: 'div', namespace: '*' }] as const satisfies Token[];

    const expected = '*|div';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify explicit no namespace', () => {
    const input = [{ type: 'type', content: '|div', name: 'div', namespace: '' }] as const satisfies Token[];

    const expected = '|div';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify namespace with attribute', () => {
    const input = [
      { type: 'attribute', content: '[svg|href]', name: 'href', namespace: 'svg' },
    ] as const satisfies Token[];

    const expected = '[svg|href]';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify universal namespace with universal selector', () => {
    const input = [{ type: 'universal', content: 'svg|*', namespace: 'svg' }] as const satisfies Token[];

    const expected = 'svg|*';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });
});

describe('stringify - Selector Lists', () => {
  it('should stringify comma separated selectors', () => {
    const input = [
      { type: 'type', content: 'div', name: 'div' },
      { type: 'comma', content: ',' },
      { type: 'type', content: 'span', name: 'span' },
    ] as const satisfies Token[];

    const expected = 'div, span';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify comma separated with spaces', () => {
    const input = [
      { type: 'type', content: 'div', name: 'div' },
      { type: 'comma', content: ', ' },
      { type: 'type', content: 'span', name: 'span' },
    ] as const satisfies Token[];

    const expected = 'div, span';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify multiple comma separated selectors', () => {
    const input = [
      { type: 'class', content: '.class1', name: 'class1' },
      { type: 'comma', content: ',' },
      { type: 'id', content: '#id1', name: 'id1' },
      { type: 'comma', content: ',' },
      { type: 'type', content: 'div', name: 'div' },
    ] as const satisfies Token[];

    const expected = '.class1, #id1, div';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });
});

describe('stringify - Complex Selectors', () => {
  it('should stringify complex real-world selector', () => {
    const input = [
      { type: 'type', content: 'div', name: 'div' },
      { type: 'class', content: '.container', name: 'container' },
      { type: 'combinator', content: '>' },
      { type: 'type', content: 'ul', name: 'ul' },
      { type: 'class', content: '.list', name: 'list' },
      { type: 'combinator', content: ' ' },
      { type: 'type', content: 'li', name: 'li' },
      { type: 'pseudo-class', content: ':first-child', name: 'first-child' },
    ] as const satisfies Token[];

    const expected = 'div.container > ul.list li:first-child';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify selector with multiple attributes', () => {
    const input = [
      { type: 'type', content: 'input', name: 'input' },
      { type: 'attribute', content: '[type="radio"]', name: 'type', operator: '=', value: '"radio"' },
      { type: 'attribute', content: '[value="female"]', name: 'value', operator: '=', value: '"female"' },
      { type: 'combinator', content: '+' },
      { type: 'type', content: 'label', name: 'label' },
    ] as const satisfies Token[];

    const expected = 'input[type="radio"][value="female"] + label';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify selector with :not pseudo-class', () => {
    const input = [
      { type: 'type', content: 'a', name: 'a' },
      { type: 'pseudo-class', content: ':not([href])', name: 'not', argument: '[href]' },
      { type: 'pseudo-class', content: ':not([tabindex])', name: 'not', argument: '[tabindex]' },
    ] as const satisfies Token[];

    const expected = 'a:not([href]):not([tabindex])';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });
});

describe('stringify - Edge Cases', () => {
  it('should stringify empty array', () => {
    const input = [] as const satisfies Token[];

    const expected = '';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify single selector alone', () => {
    const input = [{ type: 'class', content: '.standalone', name: 'standalone' }] as const satisfies Token[];

    const expected = '.standalone';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify universal selector alone', () => {
    const input = [{ type: 'universal', content: '*' }] as const satisfies Token[];

    const expected = '*';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify universal with class', () => {
    const input = [
      { type: 'universal', content: '*' },
      { type: 'class', content: '.class', name: 'class' },
    ] as const satisfies Token[];

    const expected = '*.class';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });

  it('should stringify very long selector', () => {
    const input = [
      { type: 'type', content: 'div', name: 'div' },
      { type: 'class', content: '.class1', name: 'class1' },
      { type: 'class', content: '.class2', name: 'class2' },
      { type: 'class', content: '.class3', name: 'class3' },
      { type: 'id', content: '#id', name: 'id' },
      { type: 'attribute', content: '[attr]', name: 'attr' },
      { type: 'pseudo-class', content: ':hover', name: 'hover' },
      { type: 'pseudo-class', content: ':focus', name: 'focus' },
      { type: 'pseudo-element', content: '::before', name: 'before' },
    ] as const satisfies Token[];

    const expected = 'div.class1.class2.class3#id[attr]:hover:focus::before';

    const result = stringify(input);
    expect(result).toEqual(expected);
  });
});

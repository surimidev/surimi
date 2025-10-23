import { describe, expect, it } from 'vitest';

import type { Token } from '#index';
import { stringifyAtRule } from '#index';

describe('stringify - @media Rules', () => {
  describe('Basic Media Types', () => {
    it('should stringify simple @media', () => {
      const input = [{ type: 'at-rule-name', name: 'media', content: '@media' }] as const satisfies Token[];

      const expected = '@media';

      const result = stringifyAtRule(input);
      expect(result).toEqual(expected);
    });

    it('should stringify @media with screen', () => {
      const input = [
        { type: 'at-rule-name', name: 'media', content: '@media' },
        { type: 'identifier', value: 'screen', content: 'screen' },
      ] as const satisfies Token[];

      const expected = '@media screen';

      const result = stringifyAtRule(input);
      expect(result).toEqual(expected);
    });

    it('should stringify @media with print', () => {
      const input = [
        { type: 'at-rule-name', name: 'media', content: '@media' },
        { type: 'identifier', value: 'print', content: 'print' },
      ] as const satisfies Token[];

      const expected = '@media print';

      const result = stringifyAtRule(input);
      expect(result).toEqual(expected);
    });
  });

  describe('Media Features', () => {
    it('should stringify @media with min-width', () => {
      const input = [
        { type: 'at-rule-name', name: 'media', content: '@media' },
        { type: 'delimiter', delimiter: '(', content: '(' },
        { type: 'identifier', value: 'min-width', content: 'min-width' },
        { type: 'delimiter', delimiter: ':', content: ':' },
        { type: 'dimension', value: 768, unit: 'px', content: '768px' },
        { type: 'delimiter', delimiter: ')', content: ')' },
      ] as const satisfies Token[];

      const expected = '@media ( min-width : 768px )';

      const result = stringifyAtRule(input);
      expect(result).toEqual(expected);
    });

    it('should stringify @media with orientation', () => {
      const input = [
        { type: 'at-rule-name', name: 'media', content: '@media' },
        { type: 'delimiter', delimiter: '(', content: '(' },
        { type: 'identifier', value: 'orientation', content: 'orientation' },
        { type: 'delimiter', delimiter: ':', content: ':' },
        { type: 'identifier', value: 'portrait', content: 'portrait' },
        { type: 'delimiter', delimiter: ')', content: ')' },
      ] as const satisfies Token[];

      const expected = '@media ( orientation : portrait )';

      const result = stringifyAtRule(input);
      expect(result).toEqual(expected);
    });
  });

  describe('Logical Operators', () => {
    it('should stringify @media with and operator', () => {
      const input = [
        { type: 'at-rule-name', name: 'media', content: '@media' },
        { type: 'identifier', value: 'screen', content: 'screen' },
        { type: 'operator', operator: 'and', content: 'and' },
        { type: 'delimiter', delimiter: '(', content: '(' },
        { type: 'identifier', value: 'min-width', content: 'min-width' },
        { type: 'delimiter', delimiter: ':', content: ':' },
        { type: 'dimension', value: 768, unit: 'px', content: '768px' },
        { type: 'delimiter', delimiter: ')', content: ')' },
      ] as const satisfies Token[];

      const expected = '@media screen and ( min-width : 768px )';

      const result = stringifyAtRule(input);
      expect(result).toEqual(expected);
    });

    it('should stringify @media with or operator', () => {
      const input = [
        { type: 'at-rule-name', name: 'media', content: '@media' },
        { type: 'delimiter', delimiter: '(', content: '(' },
        { type: 'identifier', value: 'orientation', content: 'orientation' },
        { type: 'delimiter', delimiter: ':', content: ':' },
        { type: 'identifier', value: 'portrait', content: 'portrait' },
        { type: 'delimiter', delimiter: ')', content: ')' },
        { type: 'operator', operator: 'or', content: 'or' },
        { type: 'delimiter', delimiter: '(', content: '(' },
        { type: 'identifier', value: 'orientation', content: 'orientation' },
        { type: 'delimiter', delimiter: ':', content: ':' },
        { type: 'identifier', value: 'landscape', content: 'landscape' },
        { type: 'delimiter', delimiter: ')', content: ')' },
      ] as const satisfies Token[];

      const expected = '@media ( orientation : portrait ) or ( orientation : landscape )';

      const result = stringifyAtRule(input);
      expect(result).toEqual(expected);
    });

    it('should stringify @media with not operator', () => {
      const input = [
        { type: 'at-rule-name', name: 'media', content: '@media' },
        { type: 'operator', operator: 'not', content: 'not' },
        { type: 'identifier', value: 'print', content: 'print' },
      ] as const satisfies Token[];

      const expected = '@media not print';

      const result = stringifyAtRule(input);
      expect(result).toEqual(expected);
    });
  });
});

describe('stringify - @container Rules', () => {
  it('should stringify simple @container', () => {
    const input = [{ type: 'at-rule-name', name: 'container', content: '@container' }] as const satisfies Token[];

    const expected = '@container';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @container with size query', () => {
    const input = [
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'min-width', content: 'min-width' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'dimension', value: 400, unit: 'px', content: '400px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ] as const satisfies Token[];

    const expected = '@container ( min-width : 400px )';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @container with name', () => {
    const input = [
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'function', name: 'sidebar', argument: 'min-width: 300px', content: 'sidebar(min-width: 300px)' },
    ] as const satisfies Token[];

    const expected = '@container sidebar(min-width: 300px)';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @container with comparison operator', () => {
    const input = [
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'width', content: 'width' },
      { type: 'operator', operator: '>', content: '>' },
      { type: 'dimension', value: 400, unit: 'px', content: '400px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ] as const satisfies Token[];

    const expected = '@container ( width > 400px )';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });
});

describe('stringify - @keyframes Rules', () => {
  it('should stringify @keyframes with name', () => {
    const input = [
      { type: 'at-rule-name', name: 'keyframes', content: '@keyframes' },
      { type: 'identifier', value: 'slide-in', content: 'slide-in' },
    ] as const satisfies Token[];

    const expected = '@keyframes slide-in';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @keyframes with quoted name', () => {
    const input = [
      { type: 'at-rule-name', name: 'keyframes', content: '@keyframes' },
      { type: 'string', value: '"my-animation"', content: '"my-animation"' },
    ] as const satisfies Token[];

    const expected = '@keyframes "my-animation"';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @keyframes with vendor prefix', () => {
    const input = [
      { type: 'at-rule-name', name: '-webkit-keyframes', content: '@-webkit-keyframes' },
      { type: 'identifier', value: 'fade', content: 'fade' },
    ] as const satisfies Token[];

    const expected = '@-webkit-keyframes fade';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });
});

describe('stringify - @supports Rules', () => {
  it('should stringify @supports with property check', () => {
    const input = [
      { type: 'at-rule-name', name: 'supports', content: '@supports' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'display', content: 'display' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'identifier', value: 'grid', content: 'grid' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ] as const satisfies Token[];

    const expected = '@supports ( display : grid )';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @supports with function value', () => {
    const input = [
      { type: 'at-rule-name', name: 'supports', content: '@supports' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'transform-function', content: 'transform-function' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'function', name: 'rotate', argument: '45deg', content: 'rotate(45deg)' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ] as const satisfies Token[];

    const expected = '@supports ( transform-function : rotate(45deg) )';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @supports with selector function', () => {
    const input = [
      { type: 'at-rule-name', name: 'supports', content: '@supports' },
      { type: 'function', name: 'selector', argument: ':has(> img)', content: 'selector(:has(> img))' },
    ] as const satisfies Token[];

    const expected = '@supports selector(:has(> img))';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @supports with and operator', () => {
    const input = [
      { type: 'at-rule-name', name: 'supports', content: '@supports' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'display', content: 'display' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'identifier', value: 'grid', content: 'grid' },
      { type: 'delimiter', delimiter: ')', content: ')' },
      { type: 'operator', operator: 'and', content: 'and' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'gap', content: 'gap' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'dimension', value: 1, unit: 'rem', content: '1rem' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ] as const satisfies Token[];

    const expected = '@supports ( display : grid ) and ( gap : 1rem )';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });
});

describe('stringify - @import Rules', () => {
  it('should stringify @import with string', () => {
    const input = [
      { type: 'at-rule-name', name: 'import', content: '@import' },
      { type: 'string', value: '"styles.css"', content: '"styles.css"' },
    ] as const satisfies Token[];

    const expected = '@import "styles.css"';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @import with url function', () => {
    const input = [
      { type: 'at-rule-name', name: 'import', content: '@import' },
      { type: 'url', value: 'base.css', content: 'url(base.css)' },
    ] as const satisfies Token[];

    const expected = '@import url(base.css)';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @import with media query', () => {
    const input = [
      { type: 'at-rule-name', name: 'import', content: '@import' },
      { type: 'string', value: '"print.css"', content: '"print.css"' },
      { type: 'identifier', value: 'print', content: 'print' },
    ] as const satisfies Token[];

    const expected = '@import "print.css" print';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @import with layer', () => {
    const input = [
      { type: 'at-rule-name', name: 'import', content: '@import' },
      { type: 'string', value: '"theme.css"', content: '"theme.css"' },
      { type: 'function', name: 'layer', argument: 'theme', content: 'layer(theme)' },
    ] as const satisfies Token[];

    const expected = '@import "theme.css" layer(theme)';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });
});

describe('stringify - @layer Rules', () => {
  it('should stringify @layer with name', () => {
    const input = [
      { type: 'at-rule-name', name: 'layer', content: '@layer' },
      { type: 'identifier', value: 'utilities', content: 'utilities' },
    ] as const satisfies Token[];

    const expected = '@layer utilities';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @layer with multiple names', () => {
    const input = [
      { type: 'at-rule-name', name: 'layer', content: '@layer' },
      { type: 'identifier', value: 'reset', content: 'reset' },
      { type: 'delimiter', delimiter: ',', content: ',' },
      { type: 'identifier', value: 'base', content: 'base' },
      { type: 'delimiter', delimiter: ',', content: ',' },
      { type: 'identifier', value: 'components', content: 'components' },
    ] as const satisfies Token[];

    const expected = '@layer reset , base , components';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @layer with nested notation', () => {
    const input = [
      { type: 'at-rule-name', name: 'layer', content: '@layer' },
      { type: 'identifier', value: 'framework', content: 'framework' },
      { type: 'delimiter', delimiter: '.', content: '.' },
      { type: 'identifier', value: 'components', content: 'components' },
    ] as const satisfies Token[];

    const expected = '@layer framework . components';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });
});

describe('stringify - @namespace Rules', () => {
  it('should stringify @namespace with url', () => {
    const input = [
      { type: 'at-rule-name', name: 'namespace', content: '@namespace' },
      { type: 'url', value: 'http://www.w3.org/1999/xhtml', content: 'url(http://www.w3.org/1999/xhtml)' },
    ] as const satisfies Token[];

    const expected = '@namespace url(http://www.w3.org/1999/xhtml)';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @namespace with prefix', () => {
    const input = [
      { type: 'at-rule-name', name: 'namespace', content: '@namespace' },
      { type: 'identifier', value: 'svg', content: 'svg' },
      { type: 'url', value: 'http://www.w3.org/2000/svg', content: 'url(http://www.w3.org/2000/svg)' },
    ] as const satisfies Token[];

    const expected = '@namespace svg url(http://www.w3.org/2000/svg)';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @namespace with string', () => {
    const input = [
      { type: 'at-rule-name', name: 'namespace', content: '@namespace' },
      { type: 'string', value: '"http://www.w3.org/1999/xhtml"', content: '"http://www.w3.org/1999/xhtml"' },
    ] as const satisfies Token[];

    const expected = '@namespace "http://www.w3.org/1999/xhtml"';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });
});

describe('stringify - @property Rules', () => {
  it('should stringify @property with custom property', () => {
    const input = [
      { type: 'at-rule-name', name: 'property', content: '@property' },
      { type: 'identifier', value: '--my-color', content: '--my-color' },
    ] as const satisfies Token[];

    const expected = '@property --my-color';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @property with complex name', () => {
    const input = [
      { type: 'at-rule-name', name: 'property', content: '@property' },
      { type: 'identifier', value: '--theme-primary-color', content: '--theme-primary-color' },
    ] as const satisfies Token[];

    const expected = '@property --theme-primary-color';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });
});

describe('stringify - @font-face Rules', () => {
  it('should stringify @font-face', () => {
    const input = [{ type: 'at-rule-name', name: 'font-face', content: '@font-face' }] as const satisfies Token[];

    const expected = '@font-face';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });
});

describe('stringify - @page Rules', () => {
  it('should stringify @page', () => {
    const input = [{ type: 'at-rule-name', name: 'page', content: '@page' }] as const satisfies Token[];

    const expected = '@page';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @page with pseudo-class', () => {
    const input = [
      { type: 'at-rule-name', name: 'page', content: '@page' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'identifier', value: 'first', content: 'first' },
    ] as const satisfies Token[];

    const expected = '@page : first';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify @page with named page', () => {
    const input = [
      { type: 'at-rule-name', name: 'page', content: '@page' },
      { type: 'identifier', value: 'chapter', content: 'chapter' },
    ] as const satisfies Token[];

    const expected = '@page chapter';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });
});

describe('stringify - @charset Rules', () => {
  it('should stringify @charset', () => {
    const input = [
      { type: 'at-rule-name', name: 'charset', content: '@charset' },
      { type: 'string', value: '"UTF-8"', content: '"UTF-8"' },
    ] as const satisfies Token[];

    const expected = '@charset "UTF-8"';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });
});

describe('stringify - Value Types', () => {
  it('should stringify numbers', () => {
    const input = [
      { type: 'at-rule-name', name: 'media', content: '@media' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'resolution', content: 'resolution' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'number', value: 2, content: '2' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ] as const satisfies Token[];

    const expected = '@media ( resolution : 2 )';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify percentages', () => {
    const input = [
      { type: 'at-rule-name', name: 'media', content: '@media' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'aspect-ratio', content: 'aspect-ratio' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'percentage', value: 50, content: '50%' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ] as const satisfies Token[];

    const expected = '@media ( aspect-ratio : 50% )';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify hash values', () => {
    const input = [
      { type: 'at-rule-name', name: 'media', content: '@media' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'color', content: 'color' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'hash', value: 'fff', content: '#fff' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ] as const satisfies Token[];

    const expected = '@media ( color : #fff )';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });
});

describe('stringify - Edge Cases', () => {
  it('should stringify empty array', () => {
    const input = [] as const satisfies Token[];

    const expected = '';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify single token', () => {
    const input = [{ type: 'at-rule-name', name: 'media', content: '@media' }] as const satisfies Token[];

    const expected = '@media';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });

  it('should stringify complex nested query', () => {
    const input = [
      { type: 'at-rule-name', name: 'supports', content: '@supports' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'display', content: 'display' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'identifier', value: 'grid', content: 'grid' },
      { type: 'delimiter', delimiter: ')', content: ')' },
      { type: 'operator', operator: 'and', content: 'and' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'operator', operator: 'not', content: 'not' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'display', content: 'display' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'identifier', value: 'flex', content: 'flex' },
      { type: 'delimiter', delimiter: ')', content: ')' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ] as const satisfies Token[];

    const expected = '@supports ( display : grid ) and ( not ( display : flex ) )';

    const result = stringifyAtRule(input);
    expect(result).toEqual(expected);
  });
});

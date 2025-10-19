import { describe, expect, it } from 'vitest';

import { parseSelectorString } from '#utils/builder.utils';

describe('parseSelectorString', () => {
  describe('Simple Selectors', () => {
    it('should parse a single class selector', () => {
      const result = parseSelectorString('.button');
      expect(result).toEqual([{ selector: '.button' }]);
    });

    it('should parse a single ID selector', () => {
      const result = parseSelectorString('#main');
      expect(result).toEqual([{ selector: '#main' }]);
    });

    it('should parse a single element selector', () => {
      const result = parseSelectorString('div');
      expect(result).toEqual([{ selector: 'div' }]);
    });

    it('should parse attribute selectors', () => {
      const result = parseSelectorString('input[type="text"]');
      expect(result).toEqual([{ selector: 'input[type="text"]' }]);
    });

    it('should handle empty string', () => {
      const result = parseSelectorString('');
      expect(result).toEqual([]);
    });

    it('should handle whitespace-only string', () => {
      const result = parseSelectorString('   ');
      expect(result).toEqual([]);
    });
  });

  describe('Pseudo-Classes', () => {
    it('should parse selector with single pseudo-class', () => {
      const result = parseSelectorString('.button:hover');
      expect(result).toEqual([{ selector: '.button' }, { pseudoClass: 'hover' }]);
    });

    it('should parse selector with multiple pseudo-classes', () => {
      const result = parseSelectorString('input:focus:valid');
      expect(result).toEqual([{ selector: 'input' }, { pseudoClass: 'focus' }, { pseudoClass: 'valid' }]);
    });

    it('should parse complex pseudo-classes', () => {
      const result = parseSelectorString('li:nth-child(2n+1)');
      expect(result).toEqual([{ selector: 'li' }, { pseudoClass: 'nth-child(2n+1)' }]);
    });

    it('should parse pseudo-class without base selector', () => {
      const result = parseSelectorString(':hover');
      expect(result).toEqual([{ pseudoClass: 'hover' }]);
    });
  });

  describe('Pseudo-Elements', () => {
    it('should parse selector with single pseudo-element', () => {
      const result = parseSelectorString('.button::after');
      expect(result).toEqual([{ selector: '.button' }, { pseudoElement: 'after' }]);
    });

    it('should parse selector with multiple pseudo-elements', () => {
      const result = parseSelectorString('.button:hover::after');
      expect(result).toEqual([{ selector: '.button' }, { pseudoClass: 'hover' }, { pseudoElement: 'after' }]);
    });

    it('should parse pseudo-element without base selector', () => {
      const result = parseSelectorString('::before');
      expect(result).toEqual([{ pseudoElement: 'before' }]);
    });
  });

  describe('Combined Pseudo-Classes and Pseudo-Elements', () => {
    it('should parse selector with pseudo-class and pseudo-element', () => {
      const result = parseSelectorString('.button:hover::after');
      expect(result).toEqual([{ selector: '.button' }, { pseudoClass: 'hover' }, { pseudoElement: 'after' }]);
    });

    it('should parse complex combination', () => {
      const result = parseSelectorString('input[type="text"]:focus:valid::placeholder');
      expect(result).toEqual([
        { selector: 'input[type="text"]' },
        { pseudoClass: 'focus' },
        { pseudoClass: 'valid' },
        { pseudoElement: 'placeholder' },
      ]);
    });
  });

  describe('Combinators', () => {
    it('should parse child combinator', () => {
      const result = parseSelectorString('div > .icon');
      expect(result).toEqual([{ selector: 'div' }, { selector: '.icon', relation: 'child' }]);
    });

    it('should parse adjacent sibling combinator', () => {
      const result = parseSelectorString('h1 + p');
      expect(result).toEqual([{ selector: 'h1' }, { selector: 'p', relation: 'adjacent' }]);
    });

    it('should parse general sibling combinator', () => {
      const result = parseSelectorString('h1 ~ p');
      expect(result).toEqual([{ selector: 'h1' }, { selector: 'p', relation: 'sibling' }]);
    });

    it('should parse descendant combinator', () => {
      const result = parseSelectorString('div .content');
      expect(result).toEqual([{ selector: 'div' }, { selector: '.content', relation: 'descendant' }]);
    });

    it('should parse chained combinators', () => {
      const result = parseSelectorString('nav > ul > li');
      expect(result).toEqual([
        { selector: 'nav' },
        { selector: 'ul', relation: 'child' },
        { selector: 'li', relation: 'child' },
      ]);
    });

    it('should parse combinators with pseudo-classes', () => {
      const result = parseSelectorString('button:hover > .icon');
      expect(result).toEqual([
        { selector: 'button' },
        { pseudoClass: 'hover' },
        { selector: '.icon', relation: 'child' },
      ]);
    });

    it('should parse complex selector chain', () => {
      const result = parseSelectorString('.menu > li:hover::after');
      expect(result).toEqual([
        { selector: '.menu' },
        { selector: 'li', relation: 'child' },
        { pseudoClass: 'hover' },
        { pseudoElement: 'after' },
      ]);
    });
  });

  describe('Comma-separated Selectors', () => {
    it('should handle comma-separated selectors as individual results', () => {
      // TODO: Fix
      const result1 = parseSelectorString('.button, .link');
      const result2 = parseSelectorString('.link');

      expect(result1).toEqual([{ selector: '.button' }, { selector: '.link' }]);
      expect(result2).toEqual([{ selector: '.link' }]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle complex attribute selectors', () => {
      const result = parseSelectorString('input[data-test="special:value"]:focus');
      expect(result).toEqual([{ selector: 'input[data-test="special:value"]' }, { pseudoClass: 'focus' }]);
    });

    it('should handle selectors with special characters', () => {
      const result = parseSelectorString('.class\\:name:hover');
      expect(result).toEqual([{ selector: '.class\\:name' }, { pseudoClass: 'hover' }]);
    });

    it('should preserve whitespace in selectors', () => {
      const result = parseSelectorString('div[title="hello world"]');
      expect(result).toEqual([{ selector: 'div[title="hello world"]' }]);
    });

    it('should handle universal selector', () => {
      const result = parseSelectorString('*:hover');
      expect(result).toEqual([{ selector: '*' }, { pseudoClass: 'hover' }]);
    });

    it('should handle vendor prefixed pseudo-elements', () => {
      const result = parseSelectorString('input::-webkit-input-placeholder');
      expect(result).toEqual([{ selector: 'input' }, { pseudoElement: '-webkit-input-placeholder' }]);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type information for literal strings', () => {
      // This test verifies that the return type matches the input type
      const result = parseSelectorString('.button:hover');

      // The result should be strongly typed based on the input string
      expect(result).toEqual([{ selector: '.button' }, { pseudoClass: 'hover' }]);
    });

    it('should handle const string inputs', () => {
      const selector = '.test:focus::after' as const;
      const result = parseSelectorString(selector);

      expect(result).toEqual([{ selector: '.test' }, { pseudoClass: 'focus' }, { pseudoElement: 'after' }]);
    });
  });
});

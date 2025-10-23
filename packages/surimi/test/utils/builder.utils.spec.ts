import { describe, expect, it } from 'vitest';

import type { FlatBuilderContext } from '#types/builder.types';
import { combineSelectors } from '#utils/builder.utils';

describe('combineSelectors', () => {
  describe('Single Selectors', () => {
    it('should handle a single selector without modifiers', () => {
      const input: FlatBuilderContext = [{ selector: '.button' }];
      expect(combineSelectors(input)).toBe('.button');
    });

    it('should handle empty context', () => {
      const input: FlatBuilderContext = [];
      expect(combineSelectors(input)).toBe('');
    });

    it('should handle context with only pseudo-classes', () => {
      const input: FlatBuilderContext = [{ pseudoClass: 'hover' }];
      expect(combineSelectors(input)).toBe(':hover');
    });

    it('should handle context with only pseudo-elements', () => {
      const input: FlatBuilderContext = [{ pseudoElement: 'after' }];
      expect(combineSelectors(input)).toBe('::after');
    });

    it('should combine selector with single pseudo-class', () => {
      const input: FlatBuilderContext = [{ selector: '.button' }, { pseudoClass: 'hover' }];
      expect(combineSelectors(input)).toBe('.button:hover');
    });

    it('should combine selector with single pseudo-element', () => {
      const input: FlatBuilderContext = [{ selector: '.button' }, { pseudoElement: 'after' }];
      expect(combineSelectors(input)).toBe('.button::after');
    });

    it('should combine selector with multiple pseudo-classes', () => {
      const input: FlatBuilderContext = [{ selector: 'input' }, { pseudoClass: 'focus' }, { pseudoClass: 'invalid' }];
      expect(combineSelectors(input)).toBe('input:focus:invalid');
    });

    it('should combine selector with multiple pseudo-elements', () => {
      const input: FlatBuilderContext = [
        { selector: '.button' },
        { pseudoElement: 'before' },
        { pseudoElement: 'after' },
      ];
      expect(combineSelectors(input)).toBe('.button::before::after');
    });

    it('should combine selector with pseudo-classes and pseudo-elements', () => {
      const input: FlatBuilderContext = [
        { selector: 'input[type="text"]' },
        { pseudoClass: 'focus' },
        { pseudoClass: 'valid' },
        { pseudoElement: 'placeholder' },
      ];
      expect(combineSelectors(input)).toBe('input[type="text"]:focus:valid::placeholder');
    });

    it('should handle complex selector strings', () => {
      const input: FlatBuilderContext = [
        { selector: 'div[data-test="complex-selector"]' },
        { pseudoClass: 'nth-child(2n+1)' },
        { pseudoElement: 'first-line' },
      ];
      expect(combineSelectors(input)).toBe('div[data-test="complex-selector"]:nth-child(2n+1)::first-line');
    });
  });

  describe('Simple Groups', () => {
    it('should handle a simple group without modifiers', () => {
      const input: FlatBuilderContext = [
        {
          group: [{ selector: '.button' }, { selector: '.link' }],
        },
      ];
      expect(combineSelectors(input)).toBe('.button, .link');
    });

    it('should apply pseudo-class to all group members', () => {
      const input: FlatBuilderContext = [
        {
          group: [{ selector: 'html' }, { selector: 'body' }],
        },
        { pseudoClass: 'hover' },
      ];
      expect(combineSelectors(input)).toBe('html:hover, body:hover');
    });

    it('should apply pseudo-element to all group members', () => {
      const input: FlatBuilderContext = [
        {
          group: [{ selector: '.button' }, { selector: '#link' }],
        },
        { pseudoElement: 'after' },
      ];
      expect(combineSelectors(input)).toBe('.button::after, #link::after');
    });

    it('should apply multiple modifiers to all group members', () => {
      const input: FlatBuilderContext = [
        {
          group: [{ selector: 'input' }, { selector: 'textarea' }],
        },
        { pseudoClass: 'focus' },
        { pseudoClass: 'invalid' },
        { pseudoElement: 'placeholder' },
      ];
      expect(combineSelectors(input)).toBe('input:focus:invalid::placeholder, textarea:focus:invalid::placeholder');
    });

    it('should handle empty group', () => {
      const input: FlatBuilderContext = [{ group: [] }, { pseudoClass: 'hover' }];
      expect(combineSelectors(input)).toBe('');
    });

    it('should handle group with complex selectors', () => {
      const input: FlatBuilderContext = [
        {
          group: [
            { selector: 'input[type="email"]' },
            { selector: 'input[type="password"]' },
            { selector: 'textarea[required]' },
          ],
        },
        { pseudoClass: 'focus' },
        { pseudoClass: 'valid' },
      ];
      expect(combineSelectors(input)).toBe(
        'input[type="email"]:focus:valid, input[type="password"]:focus:valid, textarea[required]:focus:valid',
      );
    });
  });

  describe('Multiple Groups', () => {
    it('should handle multiple groups without modifiers', () => {
      const input: FlatBuilderContext = [
        {
          group: [{ selector: 'div' }, { selector: 'span' }],
        },
        {
          group: [{ selector: '.class1' }, { selector: '.class2' }],
        },
      ];
      expect(combineSelectors(input)).toBe('div, span, .class1, .class2');
    });

    it('should apply modifiers to all groups', () => {
      const input: FlatBuilderContext = [
        {
          group: [{ selector: 'div' }, { selector: 'span' }],
        },
        {
          group: [{ selector: '.primary' }, { selector: '.secondary' }],
        },
        { pseudoClass: 'hover' },
      ];
      expect(combineSelectors(input)).toBe('div:hover, span:hover, .primary:hover, .secondary:hover');
    });

    it('should handle three or more groups', () => {
      const input: FlatBuilderContext = [
        {
          group: [{ selector: 'h1' }, { selector: 'h2' }],
        },
        {
          group: [{ selector: '.title' }],
        },
        {
          group: [{ selector: '#main-heading' }, { selector: '#sub-heading' }],
        },
        { pseudoClass: 'focus' },
      ];
      expect(combineSelectors(input)).toBe('h1:focus, h2:focus, .title:focus, #main-heading:focus, #sub-heading:focus');
    });
  });

  describe('Nested Groups', () => {
    it('should flatten simple nested groups', () => {
      const input: FlatBuilderContext = [
        {
          group: [
            { selector: 'div' },
            {
              group: [{ selector: '.nested1' }, { selector: '.nested2' }],
            },
            { selector: 'span' },
          ],
        },
        { pseudoClass: 'hover' },
      ];
      expect(combineSelectors(input)).toBe('div:hover, .nested1:hover, .nested2:hover, span:hover');
    });

    it('should handle deeply nested groups', () => {
      const input: FlatBuilderContext = [
        {
          group: [
            { selector: 'level1' },
            {
              group: [
                { selector: 'level2a' },
                {
                  group: [{ selector: 'level3a' }, { selector: 'level3b' }],
                },
                { selector: 'level2b' },
              ],
            },
            { selector: 'level1b' },
          ],
        },
        { pseudoClass: 'active' },
      ];
      expect(combineSelectors(input)).toBe(
        'level1:active, level2a:active, level3a:active, level3b:active, level2b:active, level1b:active',
      );
    });

    it('should handle nested groups with empty groups', () => {
      const input: FlatBuilderContext = [
        {
          group: [
            { selector: 'div' },
            { group: [] },
            { selector: 'span' },
            {
              group: [{ selector: '.nested' }],
            },
          ],
        },
        { pseudoClass: 'hover' },
      ];
      expect(combineSelectors(input)).toBe('div:hover, span:hover, .nested:hover');
    });
  });

  describe('Mixed Content in Groups', () => {
    it('should ignore pseudo-classes within groups', () => {
      const input: FlatBuilderContext = [
        {
          group: [
            { selector: 'div' },
            { pseudoClass: 'hover' }, // This should be ignored
            { selector: 'span' },
          ],
        },
        { pseudoClass: 'focus' }, // This should be applied
      ];
      expect(combineSelectors(input)).toBe('div:focus, span:focus');
    });

    it('should ignore pseudo-elements within groups', () => {
      const input: FlatBuilderContext = [
        {
          group: [
            { selector: '.button' },
            { pseudoElement: 'before' }, // This should be ignored
            { selector: '.link' },
          ],
        },
        { pseudoElement: 'after' }, // This should be applied
      ];
      expect(combineSelectors(input)).toBe('.button::after, .link::after');
    });

    it('should ignore mixed non-selector items within groups', () => {
      const input: FlatBuilderContext = [
        {
          group: [
            { selector: 'input' },
            { pseudoClass: 'focus' }, // Ignored
            { pseudoElement: 'placeholder' }, // Ignored
            { selector: 'textarea' },
            { pseudoClass: 'invalid' }, // Ignored
          ],
        },
        { pseudoClass: 'required' },
        { pseudoElement: 'after' },
      ];
      expect(combineSelectors(input)).toBe('input:required::after, textarea:required::after');
    });
  });

  describe('Edge Cases', () => {
    it('should handle modifiers without any selectors or groups', () => {
      const input: FlatBuilderContext = [
        { pseudoClass: 'hover' },
        { pseudoClass: 'focus' },
        { pseudoElement: 'before' },
      ];
      expect(combineSelectors(input)).toBe(':hover:focus::before');
    });

    it('should preserve selector order within groups', () => {
      const input: FlatBuilderContext = [
        {
          group: [{ selector: 'z-last' }, { selector: 'a-first' }, { selector: 'm-middle' }],
        },
      ];
      expect(combineSelectors(input)).toBe('z-last, a-first, m-middle');
    });

    it('should preserve group order when multiple groups exist', () => {
      const input: FlatBuilderContext = [
        {
          group: [{ selector: 'second-group-item1' }, { selector: 'second-group-item2' }],
        },
        {
          group: [{ selector: 'first-group-item' }],
        },
      ];
      expect(combineSelectors(input)).toBe('second-group-item1, second-group-item2, first-group-item');
    });

    it('should handle very long selector lists', () => {
      const longGroup = Array.from({ length: 10 }, (_, i) => ({ selector: `item${i}` }));
      const input: FlatBuilderContext = [{ group: longGroup }, { pseudoClass: 'hover' }];
      const expected = Array.from({ length: 10 }, (_, i) => `item${i}:hover`).join(', ');
      expect(combineSelectors(input)).toBe(expected);
    });

    it('should handle special characters in selectors', () => {
      const input: FlatBuilderContext = [
        {
          group: [
            { selector: '[data-test="special:chars"]' },
            { selector: '.class\\:with\\:colons' },
            { selector: '#id\\@with\\@symbols' },
          ],
        },
        { pseudoClass: 'hover' },
      ];
      expect(combineSelectors(input)).toBe(
        '[data-test="special:chars"]:hover, .class\\:with\\:colons:hover, #id\\@with\\@symbols:hover',
      );
    });
  });

  describe('Performance and Memory', () => {
    it('should handle empty nested structures efficiently', () => {
      const input: FlatBuilderContext = [
        {
          group: [{ group: [] }, { group: [{ group: [] }] }, { selector: 'actual-content' }],
        },
      ];
      expect(combineSelectors(input)).toBe('actual-content');
    });

    it('should not modify input data', () => {
      const input: FlatBuilderContext = [
        {
          group: [{ selector: 'test' }],
        },
        { pseudoClass: 'hover' },
      ];
      const originalInput = JSON.parse(JSON.stringify(input));

      combineSelectors(input);

      expect(input).toEqual(originalInput);
    });
  });
});

import { beforeEach, describe, expect, it } from 'vitest';

import type { Token } from '@surimi/parsers';

import { mixin, select, style, Surimi } from '../../../src/index';

describe('Usables - style() and use()', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  describe('Creating styles with style()', () => {
    it('should create a StyleBuilder with initial styles', () => {
      const initialStyles = {
        color: 'red',
        fontSize: '16px',
      };

      const styleBuilder = style(initialStyles);

      expect(styleBuilder.build()).toEqual(initialStyles);
    });

    it('should extend styles with new properties', () => {
      const baseStyle = style({
        color: 'red',
      });

      const extendedStyle = baseStyle.extend({
        fontSize: '16px',
      });

      expect(extendedStyle.build()).toEqual({
        color: 'red',
        fontSize: '16px',
      });
    });

    it('should extend styles with another StyleBuilder', () => {
      const baseStyle = style({
        color: 'red',
      });

      const additionalStyle = style({
        fontSize: '16px',
      });

      const extendedStyle = baseStyle.extend(additionalStyle);

      expect(extendedStyle.build()).toEqual({
        color: 'red',
        fontSize: '16px',
      });
    });
  });

  describe('Creating mixins with mixin()', () => {
    it('should create a MixinBuilder with the given context and styles', () => {
      const myMixin = mixin('.my-class').style({
        margin: '10px',
        padding: '5px',
      });

      expect(myMixin.context).toEqual([{ type: 'class', name: 'my-class', content: '.my-class' }] satisfies Token[]);
      expect(myMixin.styles).toEqual({
        margin: '10px',
        padding: '5px',
      });
    });

    it('should create an empty MixinBuilder when no styles are provided', () => {
      const myMixin = mixin('#my-id');

      expect(myMixin.context).toEqual([{ type: 'id', name: 'my-id', content: '#my-id' }] satisfies Token[]);
      expect(myMixin.styles).toBeUndefined();
    });

    it('should throw an error when no selectors are provided', () => {
      // @ts-expect-error Testing error case
      expect(() => mixin()).toThrow('At least one selector must be provided');
    });

    it('should throw an error when a non-string selector is provided', () => {
      // @ts-expect-error Testing error case
      expect(() => mixin(123)).toThrow('Selector must be a string');
    });

    it('should work with complex selectors', () => {
      const complexMixin = mixin('.class1', '#id1', 'div[attr="value"]').style({
        display: 'block',
      });

      expect(complexMixin.context).toEqual([
        { type: 'class', name: 'class1', content: '.class1' },
        { type: 'comma', content: ',' },
        { type: 'id', name: 'id1', content: '#id1' },
        { type: 'comma', content: ',' },
        { type: 'type', name: 'div', content: 'div' },
        { type: 'attribute', name: 'attr', operator: '=', content: '[attr="value"]', value: '"value"' },
      ] satisfies Token[]);
      expect(complexMixin.styles).toEqual({
        display: 'block',
      });
    });
  });

  describe('use() style in selectorBuilder', () => {
    it('should apply styles from a StyleBuilder', () => {
      const buttonStyle = style({
        backgroundColor: 'blue',
        color: 'white',
      });

      select('.button').use(buttonStyle);

      expect(Surimi.build()).toBe(`\
.button {
    background-color: blue;
    color: white
}`);
    });

    it('should chain use() with other methods', () => {
      const baseStyles = style({
        padding: '1rem',
        borderRadius: '4px',
      });

      select('.btn').use(baseStyles).hover().style({ opacity: 0.8 });

      expect(Surimi.build()).toBe(`\
.btn {
    padding: 1rem;
    border-radius: 4px
}
.btn:hover {
    opacity: 0.8
}`);
    });
  });

  describe('use() mixin in selectorBuilder', () => {
    it('should apply styles from a MixinBuilder', () => {
      const myMixin = mixin(':hover').style({
        textDecoration: 'underline',
      });

      select('.link').use(myMixin);

      expect(Surimi.build()).toBe(`\
.link:hover {
    text-decoration: underline
}`);
    });

    it('should chain use() with other methods', () => {
      const hoverMixin = mixin(':hover').style({
        textDecoration: 'underline',
      });

      select('.nav-link').style({ color: 'blue' }).use(hoverMixin);

      expect(Surimi.build()).toBe(`\
.nav-link {
    color: blue
}
.nav-link:hover {
    text-decoration: underline
}`);
    });
  });
});

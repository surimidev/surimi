import { beforeEach, describe, expect, it } from 'vitest';

import s, { select } from '../../src/index';

describe('Pseudo-classes and Pseudo-elements', () => {
  beforeEach(() => {
    s.clear();
  });

  describe('Basic Pseudo-classes', () => {
    it('should support :hover pseudo-class', () => {
      select('.button').hover().style({ backgroundColor: 'lightgray' });

      expect(s.build()).toBe(`\
.button:hover {
    background-color: lightgray
}`);
    });

    it('should support :focus pseudo-class', () => {
      select('.input').focus().style({ outline: '2px solid blue' });

      expect(s.build()).toBe(`\
.input:focus {
    outline: 2px solid blue
}`);
    });

    it('should support :active pseudo-class', () => {
      select('.link').active().style({ color: 'red' });

      expect(s.build()).toBe(`\
.link:active {
    color: red
}`);
    });

    it('should support :disabled pseudo-class', () => {
      select('.button').disabled().style({ opacity: 0.5 });

      expect(s.build()).toBe(`\
.button:disabled {
    opacity: 0.5
}`);
    });

    it('should chain multiple pseudo-classes', () => {
      select('.button').hover().focus().style({
        backgroundColor: 'blue',
        outline: 'none',
      });

      expect(s.build()).toBe(`\
.button:hover:focus {
    background-color: blue;
    outline: none
}`);
    });
  });

  describe('Pseudo-classes and nesting', () => {
    it('should fall back to the main selector after a pseudo class', () => {
      select('.card').hover().style({ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }).style({ fontWeight: 'bold' });

      expect(s.build()).toBe(`\
.card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1)
}
.card {
    font-weight: bold
}`);
    });
  });

  describe('Basic Pseudo-elements', () => {
    it('should support ::before pseudo-element', () => {
      select('.text').before().style({ content: '"→"' });

      expect(s.build()).toBe(`\
.text::before {
    content: "→"
}`);
    });

    it('should support ::after pseudo-element', () => {
      select('.text').after().style({
        content: '""',
        display: 'block',
      });

      expect(s.build()).toBe(`\
.text::after {
    content: "";
    display: block
}`);
    });
  });
});

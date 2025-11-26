import { beforeEach, describe, expect, it } from 'vitest';

import { select, Surimi } from '../../../src/index';

describe('Pseudo-classes and Pseudo-elements', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  describe('Basic Pseudo-classes', () => {
    it('should support :hover pseudo-class', () => {
      select('.button').hover().style({ backgroundColor: 'lightgray' });

      expect(Surimi.build()).toBe(`\
.button:hover {
    background-color: lightgray
}`);
    });

    it('should support :focus pseudo-class', () => {
      select('.input').focus().style({ outline: '2px solid blue' });

      expect(Surimi.build()).toBe(`\
.input:focus {
    outline: 2px solid blue
}`);
    });

    it('should support :active pseudo-class', () => {
      select('.link').active().style({ color: 'red' });

      expect(Surimi.build()).toBe(`\
.link:active {
    color: red
}`);
    });

    it('should support :disabled pseudo-class', () => {
      select('.button').disabled().style({ opacity: 0.5 });

      expect(Surimi.build()).toBe(`\
.button:disabled {
    opacity: 0.5
}`);
    });

    it('should chain multiple pseudo-classes', () => {
      select('.button').hover().focus().style({
        backgroundColor: 'blue',
        outline: 'none',
      });

      expect(Surimi.build()).toBe(`\
.button:hover:focus {
    background-color: blue;
    outline: none
}`);
    });
  });

  describe('Pseudo-classes and nesting', () => {
    it('should not fall back to the main selector after a pseudo class', () => {
      select('.card').style({ fontWeight: 'bold' }).hover().style({ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' });

      expect(Surimi.build()).toBe(`\
.card {
    font-weight: bold
}
.card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1)
}`);
    });
  });

  describe('Basic Pseudo-elements', () => {
    it('should support ::before pseudo-element', () => {
      select('.text').before().style({ content: '"→"' });

      expect(Surimi.build()).toBe(`\
.text::before {
    content: "→"
}`);
    });

    it('should support ::after pseudo-element', () => {
      select('.text').after().style({
        content: '""',
        display: 'block',
      });

      expect(Surimi.build()).toBe(`\
.text::after {
    content: "";
    display: block
}`);
    });
  });
});

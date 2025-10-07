import { beforeEach, describe, expect, it } from 'vitest';

import s from '../../src/index';

describe('Complex Selector Combinations', () => {
  beforeEach(() => {
    s.clear();
  });

  describe('.and() - Multiple class selector', () => {
    it('should combine multiple classes', () => {
      s.select('.btn').and('.primary').style({ backgroundColor: 'blue' });

      expect(s.build()).toBe(`\
.btn.primary {
    background-color: blue
}`);
    });

    it('should chain multiple .and() calls', () => {
      s.select('.btn').and('.primary').and('.large').style({ padding: '1rem' });

      expect(s.build()).toBe(`\
.btn.primary.large {
    padding: 1rem
}`);
    });

    it('should work with element selectors', () => {
      s.select('button').and('.disabled').style({ opacity: '0.5' });

      expect(s.build()).toBe(`\
button.disabled {
    opacity: 0.5
}`);
    });

    it('should work with ID selectors', () => {
      s.select('#header').and('.sticky').style({ position: 'fixed' });

      expect(s.build()).toBe(`\
#header.sticky {
    position: fixed
}`);
    });
  });

  describe('.is() - Pseudo-class with selector', () => {
    it('should create :is() pseudo-class with single selector', () => {
      s.select('.card').is('.active').style({ borderColor: 'blue' });

      expect(s.build()).toBe(`\
.card:is(.active) {
    border-color: blue
}`);
    });

    it('should create :is() pseudo-class with multiple selectors', () => {
      s.select('.btn').is('.primary, .secondary').style({ fontWeight: 'bold' });

      expect(s.build()).toBe(`\
.btn:is(.primary, .secondary) {
    font-weight: bold
}`);
    });

    it('should work with complex selectors inside :is()', () => {
      s.select('.form').is('input[type="text"], textarea').style({ border: '1px solid gray' });

      expect(s.build()).toBe(`\
.form:is(input[type="text"], textarea) {
    border: 1px solid gray
}`);
    });
  });

  describe('.where() - Pseudo-class with selector', () => {
    it('should create :where() pseudo-class with single selector', () => {
      s.select('.card').where('.highlighted').style({ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' });

      expect(s.build()).toBe(`\
.card:where(.highlighted) {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1)
}`);
    });

    it('should create :where() pseudo-class with multiple selectors', () => {
      s.select('.btn').where('.primary, .danger').style({ color: 'white' });

      expect(s.build()).toBe(`\
.btn:where(.primary, .danger) {
    color: white
}`);
    });

    it('should work with attribute selectors inside :where()', () => {
      s.select('input').where('[required], [aria-required="true"]').style({ borderColor: 'red' });

      expect(s.build()).toBe(`\
input:where([required], [aria-required="true"]) {
    border-color: red
}`);
    });
  });

  describe('.not() - Negation pseudo-class', () => {
    it('should create :not() pseudo-class with class selector', () => {
      s.select('.btn').not('.disabled').style({ cursor: 'pointer' });

      expect(s.build()).toBe(`\
.btn:not(.disabled) {
    cursor: pointer
}`);
    });

    it('should create :not() pseudo-class with element selector', () => {
      s.select('input').not('input[type="hidden"]').style({ display: 'block' });

      expect(s.build()).toBe(`\
input:not(input[type="hidden"]) {
    display: block
}`);
    });

    it('should create :not() with attribute selector', () => {
      s.select('button').not('[disabled]').style({ backgroundColor: 'blue' });

      expect(s.build()).toBe(`\
button:not([disabled]) {
    background-color: blue
}`);
    });

    it('should chain with other pseudo-classes', () => {
      s.select('.btn').not('.disabled').hover().style({ backgroundColor: 'darkblue' });

      expect(s.build()).toBe(`\
.btn:not(.disabled):hover {
    background-color: darkblue
}`);
    });
  });

  describe('.adjacent() - Adjacent sibling combinator (+)', () => {
    it('should create adjacent sibling selector', () => {
      s.select('.label').adjacent('input').style({ marginTop: '0.5rem' });

      expect(s.build()).toBe(`\
.label + input {
    margin-top: 0.5rem
}`);
    });

    it('should work with class selectors', () => {
      s.select('.btn').adjacent('.btn').style({ marginLeft: '0.5rem' });

      expect(s.build()).toBe(`\
.btn + .btn {
    margin-left: 0.5rem
}`);
    });

    it('should work with pseudo-classes', () => {
      s.select('input:checked').adjacent('.label').style({ fontWeight: 'bold' });

      expect(s.build()).toBe(`\
input:checked + .label {
    font-weight: bold
}`);
    });
  });

  describe('.sibling() - General sibling combinator (~)', () => {
    it('should create general sibling selector', () => {
      s.select('.header').sibling('.content').style({ marginTop: '2rem' });

      expect(s.build()).toBe(`\
.header ~ .content {
    margin-top: 2rem
}`);
    });

    it('should work with element selectors', () => {
      s.select('h1').sibling('p').style({ fontSize: '1.2rem' });

      expect(s.build()).toBe(`\
h1 ~ p {
    font-size: 1.2rem
}`);
    });

    it('should work with complex selectors', () => {
      s.select('input[type="checkbox"]:checked').sibling('.checkbox-label').style({ color: 'green' });

      expect(s.build()).toBe(`\
input[type="checkbox"]:checked ~ .checkbox-label {
    color: green
}`);
    });
  });

  describe('Complex chaining', () => {
    it('should chain multiple complex selectors', () => {
      s.select('.form')
        .child('.field')
        .and('.required')
        .not('.disabled')
        .descendant('input')
        .style({ borderColor: 'red' });

      expect(s.build()).toBe(`\
.form > .field.required:not(.disabled) input {
    border-color: red
}`);
    });

    it('should work with pseudo-classes and combinators', () => {
      s.select('.btn').and('.primary').hover().adjacent('.tooltip').style({ display: 'block' });

      expect(s.build()).toBe(`\
.btn.primary:hover + .tooltip {
    display: block
}`);
    });
  });
});

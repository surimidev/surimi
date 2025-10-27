import { beforeEach, describe, expect, it } from 'vitest';

import { select, Surimi } from '#index';

describe('Complex Selector Combinations', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  describe('.join() - Multiple class selector', () => {
    it('should combine multiple classes', () => {
      select('.btn').join('.primary').style({ backgroundColor: 'blue' });

      expect(Surimi.build()).toBe(`\
.btn.primary {
    background-color: blue
}`);
    });

    it('should chain multiple .join() calls', () => {
      select('.btn').join('.primary').join('.large').style({ padding: '1rem' });

      expect(Surimi.build()).toBe(`\
.btn.primary.large {
    padding: 1rem
}`);
    });

    it('should work with element selectors', () => {
      select('button').join('.disabled').style({ opacity: '0.5' });

      expect(Surimi.build()).toBe(`\
button.disabled {
    opacity: 0.5
}`);
    });

    it('should work with ID selectors', () => {
      select('#header').join('.sticky').style({ position: 'fixed' });

      expect(Surimi.build()).toBe(`\
#header.sticky {
    position: fixed
}`);
    });
  });

  describe('.is() - Pseudo-class with selector', () => {
    it('should create :is() pseudo-class with single selector', () => {
      select('.card').is('.active').style({ borderColor: 'blue' });

      expect(Surimi.build()).toBe(`\
.card:is(.active) {
    border-color: blue
}`);
    });

    it('should create :is() pseudo-class with multiple selectors', () => {
      select('.btn').is('.primary, .secondary').style({ fontWeight: 'bold' });

      expect(Surimi.build()).toBe(`\
.btn:is(.primary, .secondary) {
    font-weight: bold
}`);
    });

    it('should work with complex selectors inside :is()', () => {
      select('.form').is('input[type="text"], textarea').style({ border: '1px solid gray' });

      expect(Surimi.build()).toBe(`\
.form:is(input[type="text"], textarea) {
    border: 1px solid gray
}`);
    });
  });

  describe('.where() - Pseudo-class with selector', () => {
    it('should create :where() pseudo-class with single selector', () => {
      select('.card').where('.highlighted').style({ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' });

      expect(Surimi.build()).toBe(`\
.card:where(.highlighted) {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1)
}`);
    });

    it('should create :where() pseudo-class with multiple selectors', () => {
      select('.btn').where('.primary, .danger').style({ color: 'white' });

      expect(Surimi.build()).toBe(`\
.btn:where(.primary, .danger) {
    color: white
}`);
    });

    it('should work with attribute selectors inside :where()', () => {
      select('input').where('[required], [aria-required="true"]').style({ borderColor: 'red' });

      expect(Surimi.build()).toBe(`\
input:where([required], [aria-required="true"]) {
    border-color: red
}`);
    });
  });

  describe('.not() - Negation pseudo-class', () => {
    it('should create :not() pseudo-class with class selector', () => {
      select('.btn').not('.disabled').style({ cursor: 'pointer' });

      expect(Surimi.build()).toBe(`\
.btn:not(.disabled) {
    cursor: pointer
}`);
    });

    it('should create :not() pseudo-class with element selector', () => {
      select('input').not('input[type="hidden"]').style({ display: 'block' });

      expect(Surimi.build()).toBe(`\
input:not(input[type="hidden"]) {
    display: block
}`);
    });

    it('should create :not() with attribute selector', () => {
      select('button').not('[disabled]').style({ backgroundColor: 'blue' });

      expect(Surimi.build()).toBe(`\
button:not([disabled]) {
    background-color: blue
}`);
    });

    it('should chain with other pseudo-classes', () => {
      select('.btn').not('.disabled').hover().style({ backgroundColor: 'darkblue' });

      expect(Surimi.build()).toBe(`\
.btn:not(.disabled):hover {
    background-color: darkblue
}`);
    });
  });

  describe('.adjacent() - Adjacent sibling combinator (+)', () => {
    it('should create adjacent sibling selector', () => {
      select('.label').adjacent('input').style({ marginTop: '0.5rem' });

      expect(Surimi.build()).toBe(`\
.label + input {
    margin-top: 0.5rem
}`);
    });

    it('should work with class selectors', () => {
      select('.btn').adjacent('.btn').style({ marginLeft: '0.5rem' });

      expect(Surimi.build()).toBe(`\
.btn + .btn {
    margin-left: 0.5rem
}`);
    });

    it('should work with pseudo-classes', () => {
      select('input:checked').adjacent('.label').style({ fontWeight: 'bold' });

      expect(Surimi.build()).toBe(`\
input:checked + .label {
    font-weight: bold
}`);
    });
  });

  describe('.sibling() - General sibling combinator (~)', () => {
    it('should create general sibling selector', () => {
      select('.header').sibling('.content').style({ marginTop: '2rem' });

      expect(Surimi.build()).toBe(`\
.header ~ .content {
    margin-top: 2rem
}`);
    });

    it('should work with element selectors', () => {
      select('h1').sibling('p').style({ fontSize: '1.2rem' });

      expect(Surimi.build()).toBe(`\
h1 ~ p {
    font-size: 1.2rem
}`);
    });

    it('should work with complex selectors', () => {
      select('input[type="checkbox"]:checked').sibling('.checkbox-label').style({ color: 'green' });

      expect(Surimi.build()).toBe(`\
input[type="checkbox"]:checked ~ .checkbox-label {
    color: green
}`);
    });
  });

  describe('Complex chaining', () => {
    it('should chain multiple complex selectors', () => {
      select('.form')
        .child('.field')
        .join('.required')
        .not('.disabled')
        .descendant('input')
        .style({ borderColor: 'red' });

      expect(Surimi.build()).toBe(`\
.form > .field.required:not(.disabled) input {
    border-color: red
}`);
    });

    it('should work with pseudo-classes and combinators', () => {
      select('.btn').join('.primary').hover().adjacent('.tooltip').style({ display: 'block' });

      expect(Surimi.build()).toBe(`\
.btn.primary:hover + .tooltip {
    display: block
}`);
    });
  });
});

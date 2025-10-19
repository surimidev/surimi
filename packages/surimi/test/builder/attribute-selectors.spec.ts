import { beforeEach, describe, expect, it } from 'vitest';

import s, { select } from '../../src/index';

describe('Attribute Selectors', () => {
  beforeEach(() => {
    s.clear();
  });

  describe('.attr() - Attribute exists', () => {
    it('should create attribute existence selector', () => {
      select('input').attr('required').style({ borderColor: 'red' });

      expect(s.build()).toBe(`\
input[required] {
    border-color: red
}`);
    });

    it('should work with complex selectors', () => {
      select('.form').child('input').attr('data-validate').style({ position: 'relative' });

      expect(s.build()).toBe(`\
.form > input[data-validate] {
    position: relative
}`);
    });
  });

  describe('.attr().equals() - Exact attribute match', () => {
    it('should create exact match attribute selector', () => {
      select('input').attr('type').equals('text').style({ padding: '0.5rem' });

      expect(s.build()).toBe(`\
input[type="text"] {
    padding: 0.5rem
}`);
    });

    it('should work with data attributes', () => {
      select('.component').attr('data-theme').equals('dark').style({ backgroundColor: '#333' });

      expect(s.build()).toBe(`\
.component[data-theme="dark"] {
    background-color: #333
}`);
    });

    it('should handle special characters in values', () => {
      select('.btn').attr('data-action').equals('save:form').style({ color: 'green' });

      expect(s.build()).toBe(`\
.btn[data-action="save:form"] {
    color: green
}`);
    });
  });

  describe('.attr().startsWith() - Starts with match', () => {
    it('should create starts-with attribute selector', () => {
      select('input').attr('name').startsWith('user').style({ backgroundColor: '#f0f0f0' });

      expect(s.build()).toBe(`\
input[name^="user"] {
    background-color: #f0f0f0
}`);
    });

    it('should work with class attributes', () => {
      select('div').attr('class').startsWith('btn-').style({ cursor: 'pointer' });

      expect(s.build()).toBe(`\
div[class^="btn-"] {
    cursor: pointer
}`);
    });
  });

  describe('.attr().endsWith() - Ends with match', () => {
    it('should create ends-with attribute selector', () => {
      select('img').attr('src').endsWith('.jpg').style({ border: '1px solid gray' });

      expect(s.build()).toBe(`\
img[src$=".jpg"] {
    border: 1px solid gray
}`);
    });

    it('should work with href attributes', () => {
      select('a').attr('href').endsWith('.pdf').style({ textDecoration: 'none' });

      expect(s.build()).toBe(`\
a[href$=".pdf"] {
    text-decoration: none
}`);
    });
  });

  describe('.attr().contains() - Contains match', () => {
    it('should create contains attribute selector', () => {
      select('input').attr('placeholder').contains('email').style({ fontStyle: 'italic' });

      expect(s.build()).toBe(`\
input[placeholder*="email"] {
    font-style: italic
}`);
    });

    it('should work with title attributes', () => {
      select('span').attr('title').contains('tooltip').style({ position: 'relative' });

      expect(s.build()).toBe(`\
span[title*="tooltip"] {
    position: relative
}`);
    });
  });

  describe('Multiple attribute selectors', () => {
    it('should chain multiple attribute selectors', () => {
      select('input')
        .attr('type')
        .equals('text')
        .attr('required')
        .style({ borderColor: 'red', backgroundColor: '#ffe6e6' });

      expect(s.build()).toBe(`\
input[type="text"][required] {
    border-color: red;
    background-color: #ffe6e6
}`);
    });

    it('should work with complex chaining', () => {
      select('.form')
        .child('input')
        .attr('type')
        .equals('email')
        .attr('data-validate')
        .equals('true')
        .hover()
        .style({ boxShadow: '0 0 5px blue' });

      expect(s.build()).toBe(`\
.form > input[type="email"][data-validate="true"]:hover {
    box-shadow: 0 0 5px blue
}`);
    });
  });

  describe('Attribute selectors with pseudo-classes', () => {
    it('should work with hover', () => {
      select('input').attr('type').equals('submit').hover().style({ backgroundColor: 'darkblue' });

      expect(s.build()).toBe(`\
input[type="submit"]:hover {
    background-color: darkblue
}`);
    });

    it('should work with focus', () => {
      select('input').attr('required').focus().style({ outline: '2px solid blue' });

      expect(s.build()).toBe(`\
input[required]:focus {
    outline: 2px solid blue
}`);
    });

    it('should work with disabled', () => {
      select('button').attr('type').equals('button').disabled().style({ opacity: '0.3' });

      expect(s.build()).toBe(`\
button[type="button"]:disabled {
    opacity: 0.3
}`);
    });
  });

  describe('Attribute selectors in complex combinations', () => {
    it('should work with .not()', () => {
      select('input').not('[type="hidden"]').style({ display: 'block' });

      expect(s.build()).toBe(`\
input:not([type="hidden"]) {
    display: block
}`);
    });

    it('should work inside .is()', () => {
      select('.field').is('input[required], textarea[required]').style({ borderLeft: '3px solid red' });

      expect(s.build()).toBe(`\
.field:is(input[required], textarea[required]) {
    border-left: 3px solid red
}`);
    });
  });
});

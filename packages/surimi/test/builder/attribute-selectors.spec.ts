import { beforeEach, describe, expect, it } from 'vitest';

import s from '../../src/index';

describe('Attribute Selectors', () => {
  beforeEach(() => {
    s.clear();
  });

  describe('.attr() - Attribute exists', () => {
    it('should create attribute existence selector', () => {
      s.select('input').attr('required').style({ borderColor: 'red' });

      expect(s.build()).toBe(`\
input[required] {
    border-color: red
}`);
    });

    it('should work with complex selectors', () => {
      s.select('.form').child('input').attr('data-validate').style({ position: 'relative' });

      expect(s.build()).toBe(`\
.form > input[data-validate] {
    position: relative
}`);
    });
  });

  describe('.attr().equals() - Exact attribute match', () => {
    it('should create exact match attribute selector', () => {
      s.select('input').attr('type').equals('text').style({ padding: '0.5rem' });

      expect(s.build()).toBe(`\
input[type="text"] {
    padding: 0.5rem
}`);
    });

    it('should work with data attributes', () => {
      s.select('.component').attr('data-theme').equals('dark').style({ backgroundColor: '#333' });

      expect(s.build()).toBe(`\
.component[data-theme="dark"] {
    background-color: #333
}`);
    });

    it('should handle special characters in values', () => {
      s.select('.btn').attr('data-action').equals('save:form').style({ color: 'green' });

      expect(s.build()).toBe(`\
.btn[data-action="save:form"] {
    color: green
}`);
    });
  });

  describe('.attr().startsWith() - Starts with match', () => {
    it('should create starts-with attribute selector', () => {
      s.select('input').attr('name').startsWith('user').style({ backgroundColor: '#f0f0f0' });

      expect(s.build()).toBe(`\
input[name^="user"] {
    background-color: #f0f0f0
}`);
    });

    it('should work with class attributes', () => {
      s.select('div').attr('class').startsWith('btn-').style({ cursor: 'pointer' });

      expect(s.build()).toBe(`\
div[class^="btn-"] {
    cursor: pointer
}`);
    });
  });

  describe('.attr().endsWith() - Ends with match', () => {
    it('should create ends-with attribute selector', () => {
      s.select('img').attr('src').endsWith('.jpg').style({ border: '1px solid gray' });

      expect(s.build()).toBe(`\
img[src$=".jpg"] {
    border: 1px solid gray
}`);
    });

    it('should work with href attributes', () => {
      s.select('a').attr('href').endsWith('.pdf').style({ textDecoration: 'none' });

      expect(s.build()).toBe(`\
a[href$=".pdf"] {
    text-decoration: none
}`);
    });
  });

  describe('.attr().contains() - Contains match', () => {
    it('should create contains attribute selector', () => {
      s.select('input').attr('placeholder').contains('email').style({ fontStyle: 'italic' });

      expect(s.build()).toBe(`\
input[placeholder*="email"] {
    font-style: italic
}`);
    });

    it('should work with title attributes', () => {
      s.select('span').attr('title').contains('tooltip').style({ position: 'relative' });

      expect(s.build()).toBe(`\
span[title*="tooltip"] {
    position: relative
}`);
    });
  });

  describe('Multiple attribute selectors', () => {
    it('should chain multiple attribute selectors', () => {
      s.select('input')
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
      s.select('.form')
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
      s.select('input').attr('type').equals('submit').hover().style({ backgroundColor: 'darkblue' });

      expect(s.build()).toBe(`\
input[type="submit"]:hover {
    background-color: darkblue
}`);
    });

    it('should work with focus', () => {
      s.select('input').attr('required').focus().style({ outline: '2px solid blue' });

      expect(s.build()).toBe(`\
input[required]:focus {
    outline: 2px solid blue
}`);
    });

    it('should work with disabled', () => {
      s.select('button').attr('type').equals('button').disabled().style({ opacity: '0.3' });

      expect(s.build()).toBe(`\
button[type="button"]:disabled {
    opacity: 0.3
}`);
    });
  });

  describe('Attribute selectors in complex combinations', () => {
    it('should work with .not()', () => {
      s.select('input').not('[type="hidden"]').style({ display: 'block' });

      expect(s.build()).toBe(`\
input:not([type="hidden"]) {
    display: block
}`);
    });

    it('should work inside .is()', () => {
      s.select('.field').is('input[required], textarea[required]').style({ borderLeft: '3px solid red' });

      expect(s.build()).toBe(`\
.field:is(input[required], textarea[required]) {
    border-left: 3px solid red
}`);
    });
  });
});

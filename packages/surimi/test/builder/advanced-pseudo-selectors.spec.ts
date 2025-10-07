import { beforeEach, describe, expect, it } from 'vitest';

import s from '../../src/index';

describe('Advanced Pseudo-selectors', () => {
  beforeEach(() => {
    s.clear();
  });

  describe('.nthChild() - nth-child selector', () => {
    it('should create :nth-child() selector with number', () => {
      s.select('.item').nthChild(3).style({ backgroundColor: 'yellow' });

      expect(s.build()).toBe(`\
.item:nth-child(3) {
    background-color: yellow
}`);
    });

    it('should create :nth-child() selector with odd', () => {
      s.select('tr').nthChild('odd').style({ backgroundColor: '#f0f0f0' });

      expect(s.build()).toBe(`\
tr:nth-child(odd) {
    background-color: #f0f0f0
}`);
    });

    it('should create :nth-child() selector with even', () => {
      s.select('tr').nthChild('even').style({ backgroundColor: 'white' });

      expect(s.build()).toBe(`\
tr:nth-child(even) {
    background-color: white
}`);
    });

    it('should create :nth-child() selector with formula', () => {
      s.select('.card').nthChild('2n+1').style({ marginRight: '0' });

      expect(s.build()).toBe(`\
.card:nth-child(2n+1) {
    margin-right: 0
}`);
    });

    it('should chain with other pseudo-classes', () => {
      s.select('.btn').nthChild(2).hover().style({ transform: 'scale(1.05)' });

      expect(s.build()).toBe(`\
.btn:nth-child(2):hover {
    transform: scale(1.05)
}`);
    });
  });

  describe('.firstChild() - first-child selector', () => {
    it('should create :first-child selector', () => {
      s.select('.nav-item').firstChild().style({ marginLeft: '0' });

      expect(s.build()).toBe(`\
.nav-item:first-child {
    margin-left: 0
}`);
    });

    it('should work with element selectors', () => {
      s.select('p').firstChild().style({ marginTop: '0' });

      expect(s.build()).toBe(`\
p:first-child {
    margin-top: 0
}`);
    });

    it('should chain with other selectors', () => {
      s.select('.container').child('div').firstChild().style({ borderTop: 'none' });

      expect(s.build()).toBe(`\
.container > div:first-child {
    border-top: none
}`);
    });
  });

  describe('.lastChild() - last-child selector', () => {
    it('should create :last-child selector', () => {
      s.select('.nav-item').lastChild().style({ marginRight: '0' });

      expect(s.build()).toBe(`\
.nav-item:last-child {
    margin-right: 0
}`);
    });

    it('should work with element selectors', () => {
      s.select('p').lastChild().style({ marginBottom: '0' });

      expect(s.build()).toBe(`\
p:last-child {
    margin-bottom: 0
}`);
    });

    it('should work in complex selectors', () => {
      s.select('.sidebar').descendant('ul').child('li').lastChild().style({ borderBottom: 'none' });

      expect(s.build()).toBe(`\
.sidebar ul > li:last-child {
    border-bottom: none
}`);
    });
  });

  describe('.nthOfType() - nth-of-type selector', () => {
    it('should create :nth-of-type() selector with number', () => {
      s.select('h2').nthOfType(1).style({ fontSize: '2rem' });

      expect(s.build()).toBe(`\
h2:nth-of-type(1) {
    font-size: 2rem
}`);
    });

    it('should create :nth-of-type() selector with odd', () => {
      s.select('article').nthOfType('odd').style({ backgroundColor: '#f9f9f9' });

      expect(s.build()).toBe(`\
article:nth-of-type(odd) {
    background-color: #f9f9f9
}`);
    });

    it('should create :nth-of-type() selector with even', () => {
      s.select('section').nthOfType('even').style({ padding: '2rem' });

      expect(s.build()).toBe(`\
section:nth-of-type(even) {
    padding: 2rem
}`);
    });

    it('should create :nth-of-type() selector with formula', () => {
      s.select('img').nthOfType('3n').style({ border: '2px solid blue' });

      expect(s.build()).toBe(`\
img:nth-of-type(3n) {
    border: 2px solid blue
}`);
    });

    it('should work with class selectors', () => {
      s.select('.image').nthOfType(2).style({ float: 'right' });

      expect(s.build()).toBe(`\
.image:nth-of-type(2) {
    float: right
}`);
    });
  });

  describe('Complex combinations', () => {
    it('should combine multiple nth selectors', () => {
      s.select('.grid-item').nthChild('odd').nthOfType('even').style({ opacity: '0.8' });

      expect(s.build()).toBe(`\
.grid-item:nth-child(odd):nth-of-type(even) {
    opacity: 0.8
}`);
    });

    it('should work with other pseudo-classes', () => {
      s.select('.btn').firstChild().hover().focus().style({
        outline: '2px solid blue',
        transform: 'translateY(-2px)',
      });

      expect(s.build()).toBe(`\
.btn:first-child:hover:focus {
    outline: 2px solid blue;
    transform: translateY(-2px)
}`);
    });

    it('should work with attribute selectors', () => {
      s.select('input').attr('type').equals('checkbox').nthChild(2).style({ marginLeft: '1rem' });

      expect(s.build()).toBe(`\
input[type="checkbox"]:nth-child(2) {
    margin-left: 1rem
}`);
    });

    it('should work with combinators', () => {
      s.select('.form').child('input').firstChild().adjacent('.label').style({ fontWeight: 'bold' });

      expect(s.build()).toBe(`\
.form > input:first-child + .label {
    font-weight: bold
}`);
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle negative numbers in nth-child', () => {
      s.select('.item').nthChild(-1).style({ display: 'none' });

      expect(s.build()).toBe(`\
.item:nth-child(-1) {
    display: none
}`);
    });

    it('should handle zero in nth-of-type', () => {
      s.select('p').nthOfType(0).style({ color: 'gray' });

      expect(s.build()).toBe(`\
p:nth-of-type(0) {
    color: gray
}`);
    });

    it('should handle complex formulas', () => {
      s.select('.tile').nthChild('-2n+3').style({ background: 'linear-gradient(45deg, #f0f, #0ff)' });

      expect(s.build()).toBe(`\
.tile:nth-child(-2n+3) {
    background: linear-gradient(45deg, #f0f, #0ff)
}`);
    });
  });
});

import { beforeEach, describe, expect, it } from 'vitest';

import { select, Surimi } from '../../src/index';

describe('Advanced Pseudo-selectors', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  describe('.nthChild() - nth-child selector', () => {
    it('should create :nth-child() selector with number', () => {
      select('.item').nthChild(3).style({ backgroundColor: 'yellow' });

      expect(Surimi.build()).toBe(`\
.item:nth-child(3) {
    background-color: yellow
}`);
    });

    it('should create :nth-child() selector with odd', () => {
      select('tr').nthChild('odd').style({ backgroundColor: '#f0f0f0' });

      expect(Surimi.build()).toBe(`\
tr:nth-child(odd) {
    background-color: #f0f0f0
}`);
    });

    it('should create :nth-child() selector with even', () => {
      select('tr').nthChild('even').style({ backgroundColor: 'white' });

      expect(Surimi.build()).toBe(`\
tr:nth-child(even) {
    background-color: white
}`);
    });

    it('should create :nth-child() selector with formula', () => {
      select('.card').nthChild('2n+1').style({ marginRight: '0' });

      expect(Surimi.build()).toBe(`\
.card:nth-child(2n+1) {
    margin-right: 0
}`);
    });

    it('should chain with other pseudo-classes', () => {
      select('.btn').nthChild(2).hover().style({ transform: 'scale(1.05)' });

      expect(Surimi.build()).toBe(`\
.btn:nth-child(2):hover {
    transform: scale(1.05)
}`);
    });
  });

  describe('.firstChild() - first-child selector', () => {
    it('should create :first-child selector', () => {
      select('.nav-item').firstChild().style({ marginLeft: '0' });

      expect(Surimi.build()).toBe(`\
.nav-item:first-child {
    margin-left: 0
}`);
    });

    it('should work with element selectors', () => {
      select('p').firstChild().style({ marginTop: '0' });

      expect(Surimi.build()).toBe(`\
p:first-child {
    margin-top: 0
}`);
    });

    it('should chain with other selectors', () => {
      select('.container').child('div').firstChild().style({ borderTop: 'none' });

      expect(Surimi.build()).toBe(`\
.container > div:first-child {
    border-top: none
}`);
    });
  });

  describe('.lastChild() - last-child selector', () => {
    it('should create :last-child selector', () => {
      select('.nav-item').lastChild().style({ marginRight: '0' });

      expect(Surimi.build()).toBe(`\
.nav-item:last-child {
    margin-right: 0
}`);
    });

    it('should work with element selectors', () => {
      select('p').lastChild().style({ marginBottom: '0' });

      expect(Surimi.build()).toBe(`\
p:last-child {
    margin-bottom: 0
}`);
    });

    it('should work in complex selectors', () => {
      select('.sidebar').descendant('ul').child('li').lastChild().style({ borderBottom: 'none' });

      expect(Surimi.build()).toBe(`\
.sidebar ul > li:last-child {
    border-bottom: none
}`);
    });
  });

  describe('.nthOfType() - nth-of-type selector', () => {
    it('should create :nth-of-type() selector with number', () => {
      select('h2').nthOfType(1).style({ fontSize: '2rem' });

      expect(Surimi.build()).toBe(`\
h2:nth-of-type(1) {
    font-size: 2rem
}`);
    });

    it('should create :nth-of-type() selector with odd', () => {
      select('article').nthOfType('odd').style({ backgroundColor: '#f9f9f9' });

      expect(Surimi.build()).toBe(`\
article:nth-of-type(odd) {
    background-color: #f9f9f9
}`);
    });

    it('should create :nth-of-type() selector with even', () => {
      select('section').nthOfType('even').style({ padding: '2rem' });

      expect(Surimi.build()).toBe(`\
section:nth-of-type(even) {
    padding: 2rem
}`);
    });

    it('should create :nth-of-type() selector with formula', () => {
      select('img').nthOfType('3n').style({ border: '2px solid blue' });

      expect(Surimi.build()).toBe(`\
img:nth-of-type(3n) {
    border: 2px solid blue
}`);
    });

    it('should work with class selectors', () => {
      select('.image').nthOfType(2).style({ float: 'right' });

      expect(Surimi.build()).toBe(`\
.image:nth-of-type(2) {
    float: right
}`);
    });
  });

  describe('Complex combinations', () => {
    it('should combine multiple nth selectors', () => {
      select('.grid-item').nthChild('odd').nthOfType('even').style({ opacity: '0.8' });

      expect(Surimi.build()).toBe(`\
.grid-item:nth-child(odd):nth-of-type(even) {
    opacity: 0.8
}`);
    });

    it('should work with other pseudo-classes', () => {
      select('.btn').firstChild().hover().focus().style({
        outline: '2px solid blue',
        transform: 'translateY(-2px)',
      });

      expect(Surimi.build()).toBe(`\
.btn:first-child:hover:focus {
    outline: 2px solid blue;
    transform: translateY(-2px)
}`);
    });

    it('should work with combinators', () => {
      select('.form').child('input').firstChild().adjacent('.label').style({ fontWeight: 'bold' });

      expect(Surimi.build()).toBe(`\
.form > input:first-child + .label {
    font-weight: bold
}`);
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle negative numbers in nth-child', () => {
      select('.item').nthChild(-1).style({ display: 'none' });

      expect(Surimi.build()).toBe(`\
.item:nth-child(-1) {
    display: none
}`);
    });

    it('should handle zero in nth-of-type', () => {
      select('p').nthOfType(0).style({ color: 'gray' });

      expect(Surimi.build()).toBe(`\
p:nth-of-type(0) {
    color: gray
}`);
    });

    it('should handle complex formulas', () => {
      select('.tile').nthChild('-2n+3').style({ background: 'linear-gradient(45deg, #f0f, #0ff)' });

      expect(Surimi.build()).toBe(`\
.tile:nth-child(-2n+3) {
    background: linear-gradient(45deg, #f0f, #0ff)
}`);
    });
  });
});

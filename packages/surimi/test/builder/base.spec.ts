import { beforeEach, describe, expect, it } from 'vitest';

import { select, Surimi } from '../../src/index';

describe('Basic Selector & Style Application', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  describe('Basic CSS Selectors', () => {
    it('should support class selectors', () => {
      select('.container').style({ display: 'flex' });

      expect(Surimi.build()).toBe(`\
.container {
    display: flex
}`);
    });

    it('should support ID selectors', () => {
      select('#header').style({ backgroundColor: 'blue' });

      expect(Surimi.build()).toBe(`\
#header {
    background-color: blue
}`);
    });

    it('should support element selectors', () => {
      select('button').style({ border: 'none' });

      expect(Surimi.build()).toBe(`\
button {
    border: none
}`);
    });

    it('should support multiple selectors as arguments', () => {
      select('.container', '.wrapper').style({ padding: '1rem' });

      expect(Surimi.build()).toBe(`\
.container, .wrapper {
    padding: 1rem
}`);
    });

    it('should support CSS selector strings with multiple selectors', () => {
      select('html', '.container', '.outer').style({ boxSizing: 'border-box' });

      expect(Surimi.build()).toBe(`\
html, .container, .outer {
    box-sizing: border-box
}`);
    });
  });

  describe('CSS Properties with TypeScript Validation', () => {
    it('should support basic CSS properties', () => {
      select('.box').style({
        width: '100px',
        height: '100px',
        margin: '0 auto',
      });

      expect(Surimi.build()).toBe(`\
.box {
    width: 100px;
    height: 100px;
    margin: 0 auto
}`);
    });

    it('should support flexbox properties', () => {
      select('.flex-container').style({
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'stretch',
      });

      expect(Surimi.build()).toBe(`\
.flex-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: stretch
}`);
    });

    it('should support grid properties', () => {
      select('.grid-container').style({
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
      });

      expect(Surimi.build()).toBe(`\
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem
}`);
    });

    it('should support color properties', () => {
      select('.colorful').style({
        color: '#333',
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        borderColor: 'hsl(120, 50%, 50%)',
      });

      expect(Surimi.build()).toBe(`\
.colorful {
    color: #333;
    background-color: rgba(255, 0, 0, 0.5);
    border-color: hsl(120, 50%, 50%)
}`);
    });
  });

  describe('CSS Output Generation', () => {
    it('should handle empty styles gracefully', () => {
      select('.empty').style({});

      expect(Surimi.build()).toBe(`\
.empty {}`);
    });

    it('should preserve CSS property order', () => {
      select('.ordered').style({
        position: 'absolute',
        top: '0',
        left: '0',
        zIndex: 1000,
      });

      expect(Surimi.build()).toBe(`\
.ordered {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1000
}`);
    });

    it('should handle numeric values correctly', () => {
      select('.numbers').style({
        width: '100px',
        height: '200px',
        zIndex: 999,
        opacity: 0.5,
      });

      expect(Surimi.build()).toBe(`\
.numbers {
    width: 100px;
    height: 200px;
    z-index: 999;
    opacity: 0.5
}`);
    });

    it('should handle vendor-prefixed properties', () => {
      select('.prefixed').style({
        WebkitTransform: 'rotate(45deg)',
        MozTransform: 'rotate(45deg)',
        transform: 'rotate(45deg)',
      });

      expect(Surimi.build()).toBe(`\
.prefixed {
    -webkit-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    transform: rotate(45deg)
}`);
    });
  });
});

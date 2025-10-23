import { beforeEach, describe, expect, it } from 'vitest';

import { media, Surimi } from '../../src/index';

describe('Media Queries', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  describe('Simple Media Queries', () => {
    it('should support basic media queries', () => {
      media().minWidth('768px').select('.container').style({
        flexDirection: 'row',
      });

      expect(Surimi.build()).toBe(`\
@media ( min-width : 768px ) {
    .container {
        flex-direction: row
    }
}`);
    });

    it('should support max-width media queries', () => {
      media().maxWidth('768px').select('.mobile-nav').style({
        display: 'block',
      });

      expect(Surimi.build()).toBe(`\
@media ( max-width : 768px ) {
    .mobile-nav {
        display: block
    }
}`);
    });

    it('should support complex media query conditions', () => {
      media().minWidth('768px').and().maxWidth('1024px').select('.tablet-layout').style({
        columns: 2,
      });

      expect(Surimi.build()).toBe(`\
@media ( min-width : 768px ) and ( max-width : 1024px ) {
    .tablet-layout {
        columns: 2
    }
}`);
    });

    it('should support print media queries', () => {
      media().print().select('.no-print').style({
        display: 'none',
      });

      expect(Surimi.build()).toBe(`\
@media print {
    .no-print {
        display: none
    }
}`);
    });
  });

  describe('Media Query Chaining', () => {
    it('should combine basic selectors with pseudo-classes and media queries', () => {
      media().minWidth('768px').select('.button').hover().style({ backgroundColor: 'blue' });

      expect(Surimi.build()).toBe(`\
@media ( min-width : 768px ) {
    .button:hover {
        background-color: blue
    }
}`);
    });
  });

  describe('Media query builder', () => {
    it('should support minWidth and maxWidth methods', () => {
      media().minWidth('600px').and().maxWidth('1200px').select('.responsive').style({
        fontSize: '18px',
      });

      expect(Surimi.build()).toBe(`\
@media ( min-width : 600px ) and ( max-width : 1200px ) {
    .responsive {
        font-size: 18px
    }
}`);
    });

    it('should support orientation method', () => {
      media().orientation('landscape').select('.landscape-only').style({
        display: 'block',
      });

      expect(Surimi.build()).toBe(`\
@media ( orientation : landscape ) {
    .landscape-only {
        display: block
    }
}`);
    });

    it('should support raw method', () => {
      media().minResolution('2dppx').select('.high-res').style({
        border: '1px solid black',
      });

      expect(Surimi.build()).toBe(`\
@media ( min-resolution : 2dppx ) {
    .high-res {
        border: 1px solid black
    }
}`);
    });
  });
});

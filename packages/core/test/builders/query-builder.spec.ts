import { beforeEach, describe, expect, it } from 'vitest';

import { container, mixin, select, Surimi } from '../../src/index';

describe('Container Queries', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  describe('Simple Container Queries', () => {
    it('should support basic named-based container queries', () => {
      container().name('my-container').select('h2').style({
        fontSize: '1.5rem',
      });

      expect(Surimi.build()).toBe(`\
@container my-container {
    h2 {
        font-size: 1.5rem
    }
}`);
    });

    it('should support min-width container queries', () => {
      container().minWidth('600px').select('.card').style({
        padding: '16px',
      });

      expect(Surimi.build()).toBe(`\
@container ( min-width : 600px ) {
    .card {
        padding: 16px
    }
}`);
    });

    it('should support complex container query conditions', () => {
      container().minWidth('600px').and().maxWidth('900px').select('.sidebar').style({
        display: 'block',
      });

      expect(Surimi.build()).toBe(`\
@container ( min-width : 600px ) and ( max-width : 900px ) {
    .sidebar {
        display: block
    }
}`);
    });

    it('should support multiple container query parameters', () => {
      container().name('content-container').minWidth('500px').and().maxWidth('1200px').select('.content').style({
        margin: '0 auto',
      });

      expect(Surimi.build()).toBe(`\
@container content-container ( min-width : 500px ) and ( max-width : 1200px ) {
    .content {
        margin: 0 auto
    }
}`);
    });

    it('should support style container queries', () => {
      container().style('responsive', true).select('.grid').style({
        gap: '10px',
      });

      expect(Surimi.build()).toBe(`\
@container style(--responsive: true) {
    .grid {
        gap: 10px
    }
}`);
    });
  });

  it('should support re-using container queries', () => {
    const cardContainer = container().name('card-container').minWidth('400px').and().maxWidth('800px');

    cardContainer.select('.card-header').style({
      fontSize: '1.25rem',
    });

    cardContainer.select('.card-body').style({
      fontSize: '1rem',
    });

    expect(Surimi.build()).toBe(`\
@container card-container ( min-width : 400px ) and ( max-width : 800px ) {
    .card-header {
        font-size: 1.25rem
    }
    .card-body {
        font-size: 1rem
    }
}`);
  });

  it('should work with mixins and media queries', () => {
    const focusable = mixin(':focus').style({
      outline: '2px solid blue',
    });

    const button = select('.button')
      .style({
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
      })
      .use(focusable);

    container().minWidth('500px').select(button).style({
      fontSize: '1rem',
    });

    expect(Surimi.build()).toBe(`\
.button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px
}
.button:focus {
    outline: 2px solid blue
}
@container ( min-width : 500px ) {
    .button {
        font-size: 1rem
    }
}`);
  });
});

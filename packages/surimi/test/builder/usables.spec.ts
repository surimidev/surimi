import { beforeEach, describe, expect, it } from 'vitest';

import { mixin, select, style, Surimi } from '../../src/index';

describe('Usables - style() and use()', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  describe('use() style in selectorBuilder', () => {
    it('should apply styles from a StyleBuilder', () => {
      const buttonStyle = style({
        backgroundColor: 'blue',
        color: 'white',
      });

      select('.button').use(buttonStyle);

      expect(Surimi.build()).toBe(`\
.button {
    background-color: blue;
    color: white
}`);
    });

    it('should chain use() with other methods', () => {
      const baseStyles = style({
        padding: '1rem',
        borderRadius: '4px',
      });

      select('.btn').use(baseStyles).hover().style({ opacity: 0.8 });

      expect(Surimi.build()).toBe(`\
.btn {
    padding: 1rem;
    border-radius: 4px
}
.btn:hover {
    opacity: 0.8
}`);
    });
  });

  describe('use() mixin in selectorBuilder', () => {
    it('should apply styles from a MixinBuilder', () => {
      const myMixin = mixin(':hover').style({
        textDecoration: 'underline',
      });

      select('.link').use(myMixin);

      expect(Surimi.build()).toBe(`\
.link:hover {
    text-decoration: underline
}`);
    });

    it('should chain use() with other methods', () => {
      const hoverMixin = mixin(':hover').style({
        textDecoration: 'underline',
      });

      select('.nav-link').style({ color: 'blue' }).use(hoverMixin);

      expect(Surimi.build()).toBe(`\
.nav-link {
    color: blue
}
.nav-link:hover {
    text-decoration: underline
}`);
    });
  });
});

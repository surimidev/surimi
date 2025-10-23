import { beforeEach, describe, expect, it } from 'vitest';

import { media, select, Surimi } from '../../src/index';

describe('Nesting and Complex Combinations', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  describe('Basic Selector Relationships', () => {
    it('should support direct child combinator', () => {
      select('.card').child('.title').style({ fontSize: '1.2em' });

      expect(Surimi.build()).toBe(`\
.card > .title {
    font-size: 1.2em
}`);
    });

    it('should support descendant combinator', () => {
      select('.nav').descendant('a').style({ textDecoration: 'none' });

      expect(Surimi.build()).toBe(`\
.nav a {
    text-decoration: none
}`);
    });

    it('should support multiple child relationships', () => {
      select('.sidebar').child('.menu').child('.item').style({
        padding: '0.5rem',
      });

      expect(Surimi.build()).toBe(`\
.sidebar > .menu > .item {
    padding: 0.5rem
}`);
    });

    it('should support mixed relationships', () => {
      select('.main').descendant('.section').child('.header').style({
        fontWeight: 'bold',
      });

      expect(Surimi.build()).toBe(`\
.main .section > .header {
    font-weight: bold
}`);
    });
  });

  describe('Method Chaining and Complex Combinations', () => {
    it('should handle complex selector chains', () => {
      select('.nav').child('.item').hover().child('a').style({ color: 'white' });

      expect(Surimi.build()).toBe(`\
.nav > .item:hover > a {
    color: white
}`);
    });

    it('should support multiple style applications on the same selector', () => {
      select('.multi-style').style({ display: 'flex' });
      select('.multi-style').hover().style({ backgroundColor: 'gray' });
      media().maxWidth('768px').select('.multi-style').style({ flexDirection: 'column' });

      expect(Surimi.build()).toBe(`\
.multi-style {
    display: flex
}
.multi-style:hover {
    background-color: gray
}
@media ( max-width : 768px ) {
    .multi-style {
        flex-direction: column
    }
}`);
    });

    it('should support multiple chained style calls', () => {
      select('.complex').style({ color: 'red' }).style({ border: '1px solid black' });

      expect(Surimi.build()).toBe(`\
.complex {
    color: red;
    border: 1px solid black
}`);
    });

    it('should support multiple style calls in one chain', () => {
      select('.complex').style({ color: 'red' }).hover().style({ color: 'blue' });

      expect(Surimi.build()).toBe(`\
.complex {
    color: red
}
.complex:hover {
    color: blue
}`);
    });

    it('should support even more style calls in one chain', () => {
      select('.complex').style({ color: 'red' });
      select('.complex').hover().style({ color: 'blue' });
      media().maxWidth('600px').select('.complex').style({ color: 'green' });

      expect(Surimi.build()).toBe(`\
.complex {
    color: red
}
.complex:hover {
    color: blue
}
@media ( max-width : 600px ) {
    .complex {
        color: green
    }
}`);
    });

    it('should handle complex chaining with structural selectors correctly', () => {
      select('.parent').child('a').style({ color: 'black' });
      select('.parent').child('a').hover().style({ color: 'blue' });
      media().maxWidth('600px').select('.parent').child('a').style({ color: 'red' });

      expect(Surimi.build()).toBe(`\
.parent > a {
    color: black
}
.parent > a:hover {
    color: blue
}
@media ( max-width : 600px ) {
    .parent > a {
        color: red
    }
}`);
    });
  });
});

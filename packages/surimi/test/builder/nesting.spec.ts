import { beforeEach, describe, expect, it } from 'vitest';

import s from '../../src/index';

describe('Nesting and Complex Combinations', () => {
  beforeEach(() => {
    s.clear();
  });

  describe('Basic Selector Relationships', () => {
    it('should support direct child combinator', () => {
      s.select('.card').child('.title').style({ fontSize: '1.2em' });

      expect(s.build()).toBe(`\
.card > .title {
    font-size: 1.2em
}`);
    });

    it('should support descendant combinator', () => {
      s.select('.nav').descendant('a').style({ textDecoration: 'none' });

      expect(s.build()).toBe(`\
.nav a {
    text-decoration: none
}`);
    });

    it('should support multiple child relationships', () => {
      s.select('.sidebar').child('.menu').child('.item').style({
        padding: '0.5rem',
      });

      expect(s.build()).toBe(`\
.sidebar > .menu > .item {
    padding: 0.5rem
}`);
    });

    it('should support mixed relationships', () => {
      s.select('.main').descendant('.section').child('.header').style({
        fontWeight: 'bold',
      });

      expect(s.build()).toBe(`\
.main .section > .header {
    font-weight: bold
}`);
    });
  });

  describe('Method Chaining and Complex Combinations', () => {
    it('should handle complex selector chains', () => {
      s.select('.nav').child('.item').hover().child('a').style({ color: 'white' });

      expect(s.build()).toBe(`\
.nav > .item:hover > a {
    color: white
}`);
    });

    it('should support multiple style applications on the same selector', () => {
      s.select('.multi-style').style({ display: 'flex' });
      s.select('.multi-style').hover().style({ backgroundColor: 'gray' });
      s.media('(max-width: 768px)').select('.multi-style').style({ flexDirection: 'column' });

      expect(s.build()).toBe(`\
.multi-style {
    display: flex
}
.multi-style:hover {
    background-color: gray
}
@media (max-width: 768px) {
    .multi-style {
        flex-direction: column
    }
}`);
    });

    it('should support multiple chained style calls', () => {
      s.select('.complex').style({ color: 'red' }).style({ border: '1px solid black' });

      expect(s.build()).toBe(`\
.complex {
    color: red;
    border: 1px solid black
}`);
    });

    it('should support multiple style calls in one chain', () => {
      s.select('.complex').style({ color: 'red' }).hover().style({ color: 'blue' });

      expect(s.build()).toBe(`\
.complex {
    color: red
}
.complex:hover {
    color: blue
}`);
    });

    it('should support even more style calls in one chain', () => {
      s.select('.complex').style({ color: 'red' });
      s.select('.complex').hover().style({ color: 'blue' });
      s.media('(max-width: 600px)').select('.complex').style({ color: 'green' });

      expect(s.build()).toBe(`\
.complex {
    color: red
}
.complex:hover {
    color: blue
}
@media (max-width: 600px) {
    .complex {
        color: green
    }
}`);
    });

    it('should handle complex chaining with structural selectors correctly', () => {
      s.select('.parent').child('a').style({ color: 'black' });
      s.select('.parent').child('a').hover().style({ color: 'blue' });
      s.media('(max-width: 600px)').select('.parent').child('a').style({ color: 'red' });

      expect(s.build()).toBe(`\
.parent > a {
    color: black
}
.parent > a:hover {
    color: blue
}
@media (max-width: 600px) {
    .parent > a {
        color: red
    }
}`);
    });
  });
});

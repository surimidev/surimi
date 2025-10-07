import { beforeEach, describe, expect, it } from 'vitest';

import s from '../../src/index';

describe('Enhanced Navigation', () => {
  beforeEach(() => {
    s.clear();
  });

  describe('.parent() - Navigate back to parent selector', () => {
    it('should navigate back to parent after child selector', () => {
      const parentBuilder = s.select('.container').child('.item');

      // Apply styles to child
      parentBuilder.style({ display: 'flex' });

      // Navigate back to parent and apply different styles
      parentBuilder.parent().style({ padding: '1rem' });

      expect(s.build()).toBe(`\
.container > .item {
    display: flex
}
.container {
    padding: 1rem
}`);
    });

    it('should navigate back through multiple levels', () => {
      const builder = s.select('.wrapper').child('.container').child('.item');

      // Style the deepest child
      builder.style({ fontSize: '14px' });

      // Navigate back one level
      builder.parent().style({ backgroundColor: '#f0f0f0' });

      // Navigate back to root
      builder.parent().parent().style({ margin: '2rem' });

      expect(s.build()).toBe(`\
.wrapper > .container > .item {
    font-size: 14px
}
.wrapper > .container {
    background-color: #f0f0f0
}
.wrapper {
    margin: 2rem
}`);
    });

    it('should work with descendant selectors', () => {
      const builder = s.select('.sidebar').descendant('.menu').descendant('.item');

      builder.style({ borderRadius: '4px' });
      builder.parent().style({ listStyle: 'none' });
      builder.parent().parent().style({ width: '250px' });

      expect(s.build()).toBe(`\
.sidebar .menu .item {
    border-radius: 4px
}
.sidebar .menu {
    list-style: none
}
.sidebar {
    width: 250px
}`);
    });

    it('should work with pseudo-classes and attributes', () => {
      const builder = s.select('.form').child('input').attr('type').equals('text').focus();

      builder.style({ outline: '2px solid blue' });
      builder.parent().style({ backgroundColor: '#fff' });

      expect(s.build()).toBe(`\
.form > input[type="text"]:focus {
    outline: 2px solid blue
}
.form {
    background-color: #fff
}`);
    });

    it('should throw error when no parent exists', () => {
      expect(() => {
        s.select('.root').parent();
      }).toThrow('No parent selector found');
    });
  });

  describe('.root() - Navigate back to root selector', () => {
    it('should navigate back to root from any depth', () => {
      const rootBuilder = s.select('.app').child('.main').child('.content').child('.article');

      // Style the deep child
      rootBuilder.style({ lineHeight: '1.6' });

      // Navigate back to root
      rootBuilder.root().style({ minHeight: '100vh' });

      expect(s.build()).toBe(`\
.app > .main > .content > .article {
    line-height: 1.6
}
.app {
    min-height: 100vh
}`);
    });

    it('should work with complex selector chains', () => {
      const builder = s.select('.dashboard').child('.widget').and('.active').descendant('.title').firstChild();

      builder.style({ fontWeight: 'bold' });
      builder.root().style({ display: 'grid' });

      expect(s.build()).toBe(`\
.dashboard > .widget.active .title:first-child {
    font-weight: bold
}
.dashboard {
    display: grid
}`);
    });

    it('should work with attribute selectors', () => {
      const builder = s.select('.form').child('input').attr('required').hover();

      builder.style({ borderColor: 'red' });
      builder.root().style({ maxWidth: '600px' });

      expect(s.build()).toBe(`\
.form > input[required]:hover {
    border-color: red
}
.form {
    max-width: 600px
}`);
    });

    it('should return the same instance when already at root', () => {
      const rootBuilder = s.select('.root');
      const sameBuilder = rootBuilder.root();

      expect(rootBuilder).toBe(sameBuilder);
    });
  });

  describe('Navigation with style reset behavior', () => {
    it('should maintain navigation chain after style application', () => {
      const builder = s.select('.container').child('.item');

      // Apply styles (this typically resets the builder)
      builder.style({ color: 'blue' });

      // But navigation should still work
      builder.parent().style({ padding: '1rem' });

      expect(s.build()).toBe(`\
.container > .item {
    color: blue
}
.container {
    padding: 1rem
}`);
    });

    it('should handle multiple style applications with navigation', () => {
      const builder = s.select('.wrapper').child('.box').child('.content');

      // Style the deepest element
      builder.style({ fontSize: '16px' });

      // Navigate and style parent
      builder.parent().style({ backgroundColor: 'white' });

      // Style the content again (should work on reset instance)
      builder.style({ lineHeight: '1.5' });

      // Navigate to root
      builder.root().style({ margin: 'auto' });

      expect(s.build()).toBe(`\
.wrapper > .box > .content {
    font-size: 16px;
    line-height: 1.5
}
.wrapper > .box {
    background-color: white
}
.wrapper {
    margin: auto
}`);
    });
  });

  describe('Navigation in media queries', () => {
    it('should work within media query context', () => {
      const builder = s.media().minWidth('768px').select('.container').child('.item');

      builder.style({ flexDirection: 'row' });
      builder.parent().style({ display: 'flex' });

      expect(s.build()).toBe(`\
@media (min-width: 768px) {
    .container > .item {
        flex-direction: row
    }
    .container {
        display: flex
    }
}`);
    });

    it('should navigate to root within media queries', () => {
      const builder = s.media().maxWidth('600px').select('.sidebar').child('.menu').child('.item');

      builder.style({ fontSize: '14px' });
      builder.root().style({ width: '100%' });

      expect(s.build()).toBe(`\
@media (max-width: 600px) {
    .sidebar > .menu > .item {
        font-size: 14px
    }
    .sidebar {
        width: 100%
    }
}`);
    });
  });
});

import { beforeEach, describe, expect, it } from 'vitest';

import { mixin, select, style, Surimi } from '#index';

describe('Selector Builder - Combinations', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  describe('nesting builders', () => {
    it('should allow nesting selector builders', () => {
      const button = select('.button').style({ padding: '1rem' });
      const container = select('.container').style({ margin: '2rem' });

      container.select(button).style({ color: 'red' });

      expect(Surimi.build()).toBe(`\
.button {
    padding: 1rem
}
.container {
    margin: 2rem;
    .button {
        color: red
    }
}`);
    });

    it('should allow multiple levels of nesting', () => {
      const icon = select('.icon').style({ width: '16px' });
      const button = select('.button').style({ padding: '1rem' });
      const container = select('.container').style({ margin: '2rem' });

      button.select(icon).style({ height: '16px' });
      container.select(button).style({ color: 'red' });

      expect(Surimi.build()).toBe(`\
.icon {
    width: 16px
}
.button {
    padding: 1rem;
    .icon {
        height: 16px
    }
}
.container {
    margin: 2rem;
    .button {
        color: red
    }
}`);
    });

    it('should handle complex chaining with pseudo-classes correctly', () => {
      const container = select('.container');
      const containerButton = container.select('.button');

      containerButton.style({ color: 'red' });
      containerButton.hover().style({ color: 'blue' });
      containerButton.hover().active().style({ color: 'green' });

      expect(Surimi.build()).toBe(`\
.container {
    .button {
        color: red
    }
    .button:hover {
        color: blue
    }
    .button:hover:active {
        color: green
    }
}`);
    });
  });

  describe('nesting builders with styles and mixins', () => {
    it('should allow nesting selector builders with styles and mixins', () => {
      const baseButton = style({ padding: '1rem' });
      const primary = mixin('.primary').style({ backgroundColor: 'blue' });
      const container = select('.container').style({ margin: '2rem' });

      const button = select('.button').use(baseButton);
      const primaryButton = button.use(primary);

      container.select(primaryButton).style({ color: 'red' });

      expect(Surimi.build()).toBe(`\
.container {
    margin: 2rem;
    .button {
        color: red
    }
}
.button {
    padding: 1rem
}
.button.primary {
    background-color: blue
}`);
    });
  });
});

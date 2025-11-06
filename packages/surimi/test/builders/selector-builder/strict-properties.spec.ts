import { beforeEach, describe, expect, it } from 'vitest';

import { select, style, Surimi } from '../../../src/index';
import type { StrictCssPropertiesFull } from '../../../src/index';

describe('Strict Properties Integration Tests', () => {
  beforeEach(() => {
    Surimi.clear();
    Surimi.resetConfig();
  });

  describe('Default Non-Strict Mode', () => {
    it('should work with standard CSS properties', () => {
      select('.box').style({
        color: 'red',
        display: 'flex',
        padding: '10px',
      });

      const css = Surimi.build();
      expect(css).toContain('color: red');
      expect(css).toContain('display: flex');
      expect(css).toContain('padding: 10px');
    });

    it('should work with any string value (backward compatibility)', () => {
      select('.box').style({
        color: 'red',
        display: 'flex',
      });

      expect(Surimi.build()).toContain('color: red');
    });

    it('should work with numeric values', () => {
      select('.box').style({
        opacity: 0.5,
        zIndex: 10,
      });

      const css = Surimi.build();
      expect(css).toContain('opacity: 0.5');
      expect(css).toContain('z-index: 10');
    });
  });

  describe('Strict Type Usage', () => {
    it('should accept strict CSS properties', () => {
      const strictStyles: StrictCssPropertiesFull = {
        display: 'flex',
        color: 'red',
        padding: '10px',
      };

      select('.box').style(strictStyles);

      const css = Surimi.build();
      expect(css).toContain('display: flex');
      expect(css).toContain('color: red');
      expect(css).toContain('padding: 10px');
    });

    it('should work with global CSS values', () => {
      const strictStyles: StrictCssPropertiesFull = {
        color: 'inherit',
        display: 'initial',
        margin: 'unset',
      };

      select('.box').style(strictStyles);

      const css = Surimi.build();
      expect(css).toContain('color: inherit');
      expect(css).toContain('display: initial');
      expect(css).toContain('margin: unset');
    });
  });

  describe('Custom Properties Support', () => {
    it('should support custom CSS properties', () => {
      select('.box').style({
        '--primary-color': 'blue',
        '--spacing': '1rem',
        '--opacity': 0.8,
      });

      const css = Surimi.build();
      expect(css).toContain('--primary-color: blue');
      expect(css).toContain('--spacing: 1rem');
      expect(css).toContain('--opacity: 0.8');
    });

    it('should use custom properties in values', () => {
      select('.box').style({
        '--primary-color': '#6366f1',
        color: 'var(--primary-color)',
        backgroundColor: 'var(--primary-color)',
      });

      const css = Surimi.build();
      expect(css).toContain('--primary-color: #6366f1');
      expect(css).toContain('color: var(--primary-color)');
      expect(css).toContain('background-color: var(--primary-color)');
    });

    it('should work with strict types', () => {
      const strictStyles: StrictCssPropertiesFull = {
        '--theme-color': 'blue',
        color: 'var(--theme-color)',
      };

      select('.box').style(strictStyles);

      const css = Surimi.build();
      expect(css).toContain('--theme-color: blue');
      expect(css).toContain('color: var(--theme-color)');
    });
  });

  describe('Vendor-Prefixed Properties', () => {
    it('should support -webkit- prefix', () => {
      select('.box').style({
        '-webkit-transform': 'rotate(45deg)',
        '-webkit-appearance': 'none',
        '-webkit-user-select': 'none',
      });

      const css = Surimi.build();
      expect(css).toContain('-webkit-transform: rotate(45deg)');
      expect(css).toContain('-webkit-appearance: none');
      expect(css).toContain('-webkit-user-select: none');
    });

    it('should support -moz- prefix', () => {
      select('.box').style({
        '-moz-appearance': 'none',
        '-moz-user-select': 'none',
      });

      const css = Surimi.build();
      expect(css).toContain('-moz-appearance: none');
      expect(css).toContain('-moz-user-select: none');
    });

    it('should support -ms- prefix', () => {
      select('.box').style({
        '-ms-transform': 'scale(1.2)',
        '-ms-user-select': 'none',
      });

      const css = Surimi.build();
      expect(css).toContain('-ms-transform: scale(1.2)');
      expect(css).toContain('-ms-user-select: none');
    });

    it('should work alongside standard properties', () => {
      select('.box').style({
        transform: 'rotate(45deg)',
        '-webkit-transform': 'rotate(45deg)',
        '-moz-transform': 'rotate(45deg)',
        '-ms-transform': 'rotate(45deg)',
      });

      const css = Surimi.build();
      expect(css).toContain('transform: rotate(45deg)');
      expect(css).toContain('-webkit-transform: rotate(45deg)');
    });

    it('should work with strict types', () => {
      const strictStyles: StrictCssPropertiesFull = {
        transform: 'rotate(45deg)',
        '-webkit-transform': 'rotate(45deg)',
      };

      select('.box').style(strictStyles);
      expect(Surimi.build()).toContain('transform: rotate(45deg)');
    });
  });

  describe('Configuration System', () => {
    it('should have default configuration', () => {
      const config = Surimi.getConfig();
      expect(config.strictProperties).toBe(false);
      expect(config.allowCustomProperties).toBe(true);
      expect(config.allowVendorPrefixes).toBe(true);
    });

    it('should allow setting configuration', () => {
      Surimi.configure({ strictProperties: true });
      expect(Surimi.getConfig().strictProperties).toBe(true);
    });

    it('should allow partial configuration', () => {
      Surimi.configure({ strictProperties: true });
      const config = Surimi.getConfig();

      expect(config.strictProperties).toBe(true);
      expect(config.allowCustomProperties).toBe(true); // Default
      expect(config.allowVendorPrefixes).toBe(true); // Default
    });

    it('should reset configuration to defaults', () => {
      Surimi.configure({ strictProperties: true });
      expect(Surimi.getConfig().strictProperties).toBe(true);

      Surimi.resetConfig();
      expect(Surimi.getConfig().strictProperties).toBe(false);
    });

    it('should preserve configuration across style calls', () => {
      Surimi.configure({ strictProperties: true });

      select('.box1').style({ color: 'red' });
      expect(Surimi.getConfig().strictProperties).toBe(true);

      select('.box2').style({ color: 'blue' });
      expect(Surimi.getConfig().strictProperties).toBe(true);
    });
  });

  describe('Complex CSS Values', () => {
    it('should support calc() expressions', () => {
      select('.box').style({
        width: 'calc(100% - 20px)',
        padding: 'calc(1rem + 2px)',
      });

      const css = Surimi.build();
      expect(css).toContain('width: calc(100% - 20px)');
      expect(css).toContain('padding: calc(1rem + 2px)');
    });

    it('should support rgb/rgba colors', () => {
      select('.box').style({
        color: 'rgb(255, 0, 0)',
        backgroundColor: 'rgba(0, 0, 255, 0.5)',
      });

      const css = Surimi.build();
      expect(css).toContain('color: rgb(255, 0, 0)');
      expect(css).toContain('background-color: rgba(0, 0, 255, 0.5)');
    });

    it('should support gradients', () => {
      select('.box').style({
        background: 'linear-gradient(to right, red, blue)',
      });

      expect(Surimi.build()).toContain('background: linear-gradient(to right, red, blue)');
    });

    it('should support multiple box shadows', () => {
      select('.box').style({
        boxShadow: '0 0 10px rgba(0,0,0,0.5), 0 5px 20px blue',
      });

      expect(Surimi.build()).toContain('box-shadow: 0 0 10px rgba(0,0,0,0.5), 0 5px 20px blue');
    });

    it('should support transform functions', () => {
      select('.box').style({
        transform: 'rotate(45deg) scale(1.2) translateX(10px)',
      });

      expect(Surimi.build()).toContain('transform: rotate(45deg) scale(1.2) translateX(10px)');
    });
  });

  describe('Style Function with Strict Types', () => {
    it('should work with style() function', () => {
      const buttonBase = style({
        padding: '10px 20px',
        borderRadius: '4px',
      });

      select('.button').use(buttonBase);

      const css = Surimi.build();
      expect(css).toContain('padding: 10px 20px');
      expect(css).toContain('border-radius: 4px');
    });

    it('should work with strict types in style() function', () => {
      const strictStyles: StrictCssPropertiesFull = {
        display: 'flex',
        padding: '1rem',
      };

      const buttonBase = style(strictStyles);
      select('.button').use(buttonBase);

      const css = Surimi.build();
      expect(css).toContain('display: flex');
      expect(css).toContain('padding: 1rem');
    });
  });

  describe('Combined Real-World Scenarios', () => {
    it('should handle a complete button style', () => {
      const buttonStyles: StrictCssPropertiesFull = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 20px',
        borderRadius: '4px',
        backgroundColor: '#6366f1',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '--button-shadow': '0 2px 4px rgba(0,0,0,0.1)',
        boxShadow: 'var(--button-shadow)',
      };

      select('.btn').style(buttonStyles).hover().style({
        backgroundColor: '#4338ca',
        transform: 'translateY(-1px)',
      });

      const css = Surimi.build();
      expect(css).toContain('.btn {');
      expect(css).toContain('display: inline-flex');
      expect(css).toContain('background-color: #6366f1');
      expect(css).toContain('.btn:hover {');
      expect(css).toContain('background-color: #4338ca');
    });

    it('should handle responsive design with custom properties', () => {
      select(':root').style({
        '--spacing-sm': '0.5rem',
        '--spacing-md': '1rem',
        '--spacing-lg': '2rem',
      });

      select('.container').style({
        padding: 'var(--spacing-md)',
      });

      const css = Surimi.build();
      expect(css).toContain('--spacing-sm: 0.5rem');
      expect(css).toContain('padding: var(--spacing-md)');
    });
  });
});

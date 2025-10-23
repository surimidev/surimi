import { describe, expect, it } from 'vitest';

import { property } from '#index';
import type { CssProperties } from '#types/css.types';
import { createDeclarations, formatPropertyName, formatPropertyValue } from '#utils/postcss.utils';

describe('postcss.utils', () => {
  describe('formatPropertyName', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(formatPropertyName('backgroundColor')).toBe('background-color');
      expect(formatPropertyName('fontSize')).toBe('font-size');
      expect(formatPropertyName('borderTopWidth')).toBe('border-top-width');
      expect(formatPropertyName('textDecorationLine')).toBe('text-decoration-line');
    });

    it('should handle single words without conversion', () => {
      expect(formatPropertyName('color')).toBe('color');
      expect(formatPropertyName('display')).toBe('display');
      expect(formatPropertyName('margin')).toBe('margin');
      expect(formatPropertyName('padding')).toBe('padding');
    });

    it('should handle consecutive capital letters', () => {
      expect(formatPropertyName('WebkitTransform')).toBe('-webkit-transform');
      expect(formatPropertyName('MozAppearance')).toBe('-moz-appearance');
    });

    it('should handle properties with numbers', () => {
      expect(formatPropertyName('gridColumn1')).toBe('grid-column1');
      expect(formatPropertyName('animation2Delay')).toBe('animation2-delay');
    });

    it('should handle edge cases', () => {
      expect(formatPropertyName('')).toBe('');
      expect(formatPropertyName('a')).toBe('a');
      expect(formatPropertyName('A')).toBe('-a');
    });

    it('should preserve already kebab-case properties', () => {
      expect(formatPropertyName('border-color')).toBe('border-color');
      expect(formatPropertyName('font-family')).toBe('font-family');
    });
  });

  describe('formatPropertyValue', () => {
    it('should convert numbers to strings', () => {
      expect(formatPropertyValue(0)).toBe('0');
      expect(formatPropertyValue(10)).toBe('10');
      expect(formatPropertyValue(3.14)).toBe('3.14');
      expect(formatPropertyValue(-5)).toBe('-5');
    });

    it('should handle string values', () => {
      expect(formatPropertyValue('red')).toBe('red');
      expect(formatPropertyValue('100px')).toBe('100px');
      expect(formatPropertyValue('auto')).toBe('auto');
      expect(formatPropertyValue('')).toBe('');
    });

    it('should handle boolean values', () => {
      expect(formatPropertyValue(true)).toBe('true');
      expect(formatPropertyValue(false)).toBe('false');
    });

    it('should handle null and undefined', () => {
      expect(formatPropertyValue(null)).toBe('null');
      expect(formatPropertyValue(undefined)).toBe('undefined');
    });

    it('should handle objects by converting to string', () => {
      expect(formatPropertyValue({ color: 'red' })).toBe('[object Object]');
      expect(formatPropertyValue([1, 2, 3])).toBe('1,2,3');
    });

    it('should handle special values', () => {
      expect(formatPropertyValue(NaN)).toBe('NaN');
      expect(formatPropertyValue(Infinity)).toBe('Infinity');
      expect(formatPropertyValue(-Infinity)).toBe('-Infinity');
    });
  });

  describe('createDeclarations', () => {
    it('should create declarations from simple CSS properties', () => {
      const properties: CssProperties = {
        color: 'red',
        fontSize: '16px',
        backgroundColor: '#ffffff',
      };

      const declarations = createDeclarations(properties);

      expect(declarations).toHaveLength(3);
      expect(declarations[0]?.prop).toBe('color');
      expect(declarations[0]?.value).toBe('red');
      expect(declarations[1]?.prop).toBe('font-size');
      expect(declarations[1]?.value).toBe('16px');
      expect(declarations[2]?.prop).toBe('background-color');
      expect(declarations[2]?.value).toBe('#ffffff');
    });

    it('should handle numeric values', () => {
      const properties: CssProperties = {
        opacity: 0.5,
        zIndex: 100,
        flexGrow: 1,
        order: -1,
      };

      const declarations = createDeclarations(properties);

      expect(declarations).toHaveLength(4);
      expect(declarations[0]?.prop).toBe('opacity');
      expect(declarations[0]?.value).toBe('0.5');
      expect(declarations[1]?.prop).toBe('z-index');
      expect(declarations[1]?.value).toBe('100');
      expect(declarations[2]?.prop).toBe('flex-grow');
      expect(declarations[2]?.value).toBe('1');
      expect(declarations[3]?.prop).toBe('order');
      expect(declarations[3]?.value).toBe('-1');
    });

    it('should handle custom properties', () => {
      const primaryColor = property('primary-color', 'color', false, '#3498db');
      const spacing = property('spacing-unit', 'length', true, '8px');

      const properties: CssProperties = {
        color: primaryColor,
        margin: spacing,
        fontSize: '16px',
      };

      const declarations = createDeclarations(properties);

      expect(declarations).toHaveLength(3);
      expect(declarations[0]?.prop).toBe('color');
      expect(declarations[0]?.value).toBe('var(--primary-color)');
      expect(declarations[1]?.prop).toBe('margin');
      expect(declarations[1]?.value).toBe('var(--spacing-unit)');
      expect(declarations[2]?.prop).toBe('font-size');
      expect(declarations[2]?.value).toBe('16px');
    });

    it('should skip null and undefined values', () => {
      const properties: CssProperties = {
        color: 'red',
        fontSize: null as never,
        backgroundColor: undefined,
        margin: '10px',
      };

      const declarations = createDeclarations(properties);

      expect(declarations).toHaveLength(2);
      expect(declarations[0]?.prop).toBe('color');
      expect(declarations[0]?.value).toBe('red');
      expect(declarations[1]?.prop).toBe('margin');
      expect(declarations[1]?.value).toBe('10px');
    });

    it('should handle empty properties object', () => {
      const properties: CssProperties = {};
      const declarations = createDeclarations(properties);
      expect(declarations).toHaveLength(0);
    });

    it('should handle complex CSS values', () => {
      const properties: CssProperties = {
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        transform: 'translateX(10px) rotate(45deg) scale(1.2)',
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
      };

      const declarations = createDeclarations(properties);

      expect(declarations).toHaveLength(4);
      expect(declarations[0]?.prop).toBe('background');
      expect(declarations[0]?.value).toBe('linear-gradient(45deg, #ff6b6b, #4ecdc4)');
      expect(declarations[1]?.prop).toBe('box-shadow');
      expect(declarations[1]?.value).toBe('0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)');
      expect(declarations[2]?.prop).toBe('transform');
      expect(declarations[2]?.value).toBe('translateX(10px) rotate(45deg) scale(1.2)');
      expect(declarations[3]?.prop).toBe('font-family');
      expect(declarations[3]?.value).toBe('"Helvetica Neue", Arial, sans-serif');
    });

    it('should handle vendor-prefixed properties', () => {
      const properties: CssProperties = {
        WebkitTransform: 'scale(1.1)',
        MozUserSelect: 'none',
        msGridColumns: '1fr 1fr',
      };

      const declarations = createDeclarations(properties);

      expect(declarations).toHaveLength(3);
      expect(declarations[0]?.prop).toBe('-webkit-transform');
      expect(declarations[0]?.value).toBe('scale(1.1)');
      expect(declarations[1]?.prop).toBe('-moz-user-select');
      expect(declarations[1]?.value).toBe('none');
      expect(declarations[2]?.prop).toBe('ms-grid-columns');
      expect(declarations[2]?.value).toBe('1fr 1fr');
    });

    it('should handle mixed custom properties and regular properties', () => {
      const themeColor = property({
        name: 'theme-color',
        syntax: '<color>',
        inherits: true,
        initialValue: '#000000',
      });

      const baseSpacing = property({
        name: 'base-spacing',
        syntax: '<length>',
        inherits: false,
        initialValue: '1rem',
      });

      const properties: CssProperties = {
        color: themeColor,
        backgroundColor: 'white',
        padding: baseSpacing,
        border: '1px solid',
        margin: '0 auto',
      };

      const declarations = createDeclarations(properties);

      expect(declarations).toHaveLength(5);
      expect(declarations[0]?.prop).toBe('color');
      expect(declarations[0]?.value).toBe('var(--theme-color)');
      expect(declarations[1]?.prop).toBe('background-color');
      expect(declarations[1]?.value).toBe('white');
      expect(declarations[2]?.prop).toBe('padding');
      expect(declarations[2]?.value).toBe('var(--base-spacing)');
      expect(declarations[3]?.prop).toBe('border');
      expect(declarations[3]?.value).toBe('1px solid');
      expect(declarations[4]?.prop).toBe('margin');
      expect(declarations[4]?.value).toBe('0 auto');
    });

    it('should preserve property order', () => {
      const properties: CssProperties = {
        zIndex: 999,
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
      };

      const declarations = createDeclarations(properties);

      expect(declarations).toHaveLength(6);
      expect(declarations.map(d => d.prop)).toEqual(['z-index', 'position', 'top', 'left', 'right', 'bottom']);
    });

    it('should handle zero values correctly', () => {
      const properties: CssProperties = {
        margin: 0,
        padding: '0px',
        opacity: 0,
        zIndex: 0,
      };

      const declarations = createDeclarations(properties);

      expect(declarations).toHaveLength(4);
      expect(declarations[0]?.value).toBe('0');
      expect(declarations[1]?.value).toBe('0px');
      expect(declarations[2]?.value).toBe('0');
      expect(declarations[3]?.value).toBe('0');
    });

    it('should handle custom property with complex syntax', () => {
      const complexProperty = property({
        name: 'complex-value',
        syntax: '<integer> | <length> | <percentage>',
        inherits: false,
        initialValue: '100%',
      });

      const properties: CssProperties = {
        width: complexProperty,
        height: '100vh',
      };

      const declarations = createDeclarations(properties);

      expect(declarations).toHaveLength(2);
      expect(declarations[0]?.prop).toBe('width');
      expect(declarations[0]?.value).toBe('var(--complex-value)');
      expect(declarations[1]?.prop).toBe('height');
      expect(declarations[1]?.value).toBe('100vh');
    });
  });
});

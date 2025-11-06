import { describe, expectTypeOf, it } from 'vitest';

import type {
  GlobalCssValue,
  StrictCssPropertiesFull,
  StrictCustomProperties,
  VendorPrefixedProperties,
} from '../../src/index';

describe('StrictCssProperties Type Tests', () => {
  describe('Valid CSS Values', () => {
    it('should accept valid display values', () => {
      const styles: StrictCssPropertiesFull = {
        display: 'flex',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();

      const styles2: StrictCssPropertiesFull = {
        display: 'grid',
      };
      expectTypeOf(styles2).toEqualTypeOf<StrictCssPropertiesFull>();

      const styles3: StrictCssPropertiesFull = {
        display: 'block',
      };
      expectTypeOf(styles3).toEqualTypeOf<StrictCssPropertiesFull>();
    });

    it('should accept valid color values', () => {
      const styles: StrictCssPropertiesFull = {
        color: 'red',
        backgroundColor: 'blue',
        borderColor: '#6366f1',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });

    it('should accept numeric values', () => {
      const styles: StrictCssPropertiesFull = {
        opacity: 0.5,
        zIndex: 10,
        flexGrow: 1,
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });

    it('should accept length values', () => {
      const styles: StrictCssPropertiesFull = {
        padding: '10px',
        margin: '1rem',
        width: '100%',
        height: '50vh',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });
  });

  describe('Global CSS Values', () => {
    it('should accept inherit keyword', () => {
      const styles: StrictCssPropertiesFull = {
        color: 'inherit',
        display: 'inherit',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });

    it('should accept initial keyword', () => {
      const styles: StrictCssPropertiesFull = {
        color: 'initial',
        padding: 'initial',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });

    it('should accept unset keyword', () => {
      const styles: StrictCssPropertiesFull = {
        margin: 'unset',
        backgroundColor: 'unset',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });

    it('should accept revert keyword', () => {
      const styles: StrictCssPropertiesFull = {
        display: 'revert',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });

    it('should accept revert-layer keyword', () => {
      const styles: StrictCssPropertiesFull = {
        color: 'revert-layer',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });

    it('should accept global values for any property', () => {
      const globalValue: GlobalCssValue = 'inherit';
      const styles: StrictCssPropertiesFull = {
        display: globalValue,
        color: globalValue,
        padding: globalValue,
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });
  });

  describe('Custom Properties', () => {
    it('should accept custom properties with string values', () => {
      const styles: StrictCustomProperties = {
        '--primary-color': '#6366f1',
        '--spacing': '1rem',
        '--font-family': 'Arial, sans-serif',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCustomProperties>();
    });

    it('should accept custom properties with numeric values', () => {
      const styles: StrictCustomProperties = {
        '--opacity': 0.5,
        '--z-index': 10,
        '--line-height': 1.5,
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCustomProperties>();
    });

    it('should work in StrictCssPropertiesFull', () => {
      const styles: StrictCssPropertiesFull = {
        '--primary-color': 'blue',
        '--spacing': '1rem',
        color: 'var(--primary-color)',
        padding: 'var(--spacing)',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });
  });

  describe('Vendor-Prefixed Properties', () => {
    it('should accept -webkit- prefixed properties', () => {
      const styles: VendorPrefixedProperties = {
        '-webkit-transform': 'rotate(45deg)',
        '-webkit-appearance': 'none',
        '-webkit-user-select': 'none',
      };
      expectTypeOf(styles).toEqualTypeOf<VendorPrefixedProperties>();
    });

    it('should accept -moz- prefixed properties', () => {
      const styles: VendorPrefixedProperties = {
        '-moz-appearance': 'none',
        '-moz-user-select': 'none',
      };
      expectTypeOf(styles).toEqualTypeOf<VendorPrefixedProperties>();
    });

    it('should accept -ms- prefixed properties', () => {
      const styles: VendorPrefixedProperties = {
        '-ms-transform': 'scale(1.2)',
        '-ms-user-select': 'none',
      };
      expectTypeOf(styles).toEqualTypeOf<VendorPrefixedProperties>();
    });

    it('should work in StrictCssPropertiesFull', () => {
      const styles: StrictCssPropertiesFull = {
        transform: 'rotate(45deg)',
        '-webkit-transform': 'rotate(45deg)',
        '-moz-transform': 'rotate(45deg)',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });
  });

  describe('Complex CSS Values', () => {
    it('should accept calc() expressions', () => {
      const styles: StrictCssPropertiesFull = {
        width: 'calc(100% - 20px)',
        padding: 'calc(1rem + 2px)',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });

    it('should accept var() references', () => {
      const styles: StrictCssPropertiesFull = {
        color: 'var(--primary-color)',
        padding: 'var(--spacing, 1rem)',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });

    it('should accept rgb/rgba colors', () => {
      const styles: StrictCssPropertiesFull = {
        color: 'rgb(255, 0, 0)',
        backgroundColor: 'rgba(0, 0, 255, 0.5)',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });

    it('should accept gradients', () => {
      const styles: StrictCssPropertiesFull = {
        background: 'linear-gradient(to right, red, blue)',
        backgroundImage: 'radial-gradient(circle, yellow, green)',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });

    it('should accept multiple box shadows', () => {
      const styles: StrictCssPropertiesFull = {
        boxShadow: '0 0 10px rgba(0,0,0,0.5), 0 5px 20px blue',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });

    it('should accept transform functions', () => {
      const styles: StrictCssPropertiesFull = {
        transform: 'rotate(45deg) scale(1.2) translateX(10px)',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });
  });

  describe('Combined Usage', () => {
    it('should accept all types combined', () => {
      const styles: StrictCssPropertiesFull = {
        // Standard properties
        display: 'flex',
        color: 'red',
        padding: '10px',

        // Global values
        margin: 'inherit',

        // Custom properties
        '--primary-color': '#6366f1',
        '--spacing': '1rem',

        // Vendor prefixes
        '-webkit-transform': 'rotate(45deg)',
        '-moz-appearance': 'none',

        // Complex values
        background: 'linear-gradient(to right, red, blue)',
        transform: 'rotate(45deg) scale(1.2)',
      };
      expectTypeOf(styles).toEqualTypeOf<StrictCssPropertiesFull>();
    });
  });
});

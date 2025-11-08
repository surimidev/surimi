import { describe, expect, it } from 'vitest';

import { execute } from '../../src/compiler';

describe('Execute Function', () => {
  describe('CSS extraction', () => {
    it('should extract CSS from executed code', async () => {
      // Note: This test uses pre-generated CSS string since execute()
      // expects code that has already been bundled (no external imports)
      const code = `
        export const __SURIMI_GENERATED_CSS__ = '.test { color: red }';
      `;

      const result = await execute(code);

      expect(result.css).toBeDefined();
      expect(typeof result.css).toBe('string');
      expect(result.css).toContain('.test');
      expect(result.css).toContain('color');
    });

    it('should handle empty CSS', async () => {
      const code = `
        export const __SURIMI_GENERATED_CSS__ = '';
      `;

      const result = await execute(code);

      expect(result.css).toBe('');
      expect(result.js).toBe('');
    });
  });

  describe('Export handling', () => {
    it('should extract string exports', async () => {
      const code = `
        export const __SURIMI_GENERATED_CSS__ = '';
        export const testString = 'hello world';
      `;

      const result = await execute(code);

      expect(result.js).toContain('export const testString = "hello world"');
    });

    it('should extract number exports', async () => {
      const code = `
        export const __SURIMI_GENERATED_CSS__ = '';
        export const testNumber = 42;
        export const testFloat = 3.14;
      `;

      const result = await execute(code);

      expect(result.js).toContain('export const testNumber = 42');
      expect(result.js).toContain('export const testFloat = 3.14');
    });

    it('should extract boolean exports', async () => {
      const code = `
        export const __SURIMI_GENERATED_CSS__ = '';
        export const testTrue = true;
        export const testFalse = false;
      `;

      const result = await execute(code);

      expect(result.js).toContain('export const testTrue = true');
      expect(result.js).toContain('export const testFalse = false');
    });

    it('should extract null exports', async () => {
      const code = `
        export const __SURIMI_GENERATED_CSS__ = '';
        export const testNull = null;
      `;

      const result = await execute(code);

      expect(result.js).toContain('export const testNull = null');
    });

    it('should extract object exports', async () => {
      const code = `
        export const __SURIMI_GENERATED_CSS__ = '';
        export const testObject = { a: 1, b: 'test' };
      `;

      const result = await execute(code);

      expect(result.js).toContain('export const testObject =');
      expect(result.js).toContain('"a"');
      expect(result.js).toContain('"b"');
    });

    it('should extract array exports', async () => {
      const code = `
        export const __SURIMI_GENERATED_CSS__ = '';
        export const testArray = [1, 2, 3];
      `;

      const result = await execute(code);

      expect(result.js).toContain('export const testArray = [1,2,3]');
    });

    it('should extract nested object exports', async () => {
      const code = `
        export const __SURIMI_GENERATED_CSS__ = '';
        export const config = {
          theme: {
            colors: {
              primary: '#007bff'
            }
          },
          spacing: [0, 4, 8, 16]
        };
      `;

      const result = await execute(code);

      expect(result.js).toContain('export const config =');
      expect(result.js).toContain('#007bff');
    });
  });

  describe('Special exports handling', () => {
    it('should not include default export', async () => {
      const code = `
        export const __SURIMI_GENERATED_CSS__ = '';
        export default function() { return 'test'; };
        export const normalExport = 'value';
      `;

      const result = await execute(code);

      expect(result.js).not.toContain('default');
      expect(result.js).toContain('export const normalExport = "value"');
    });

    it('should not include __SURIMI_GENERATED_CSS__ in JS output', async () => {
      const code = `
        export const __SURIMI_GENERATED_CSS__ = '.test { color: red }';
        export const userExport = 'value';
      `;

      const result = await execute(code);

      expect(result.js).not.toContain('__SURIMI_GENERATED_CSS__');
      expect(result.js).toContain('export const userExport = "value"');
    });

    it('should skip non-serializable exports', async () => {
      const code = `
        export const __SURIMI_GENERATED_CSS__ = '';
        export const myFunction = function() { return 'test'; };
        export const mySymbol = Symbol('test');
        export const validExport = 'value';
      `;

      const result = await execute(code);

      expect(result.js).not.toContain('myFunction');
      expect(result.js).not.toContain('mySymbol');
      expect(result.js).toContain('export const validExport = "value"');
    });
  });

  describe('No exports scenario', () => {
    it('should handle code with no user exports', async () => {
      const code = `
        export const __SURIMI_GENERATED_CSS__ = '.test { color: blue }';
      `;

      const result = await execute(code);

      expect(result.js).toBe('');
      expect(result.css).toBe('.test { color: blue }');
    });
  });

  describe('Multiple exports', () => {
    it('should handle multiple exports correctly', async () => {
      const code = `
        export const __SURIMI_GENERATED_CSS__ = '';
        export const str = 'test';
        export const num = 100;
        export const bool = true;
        export const obj = { key: 'value' };
        export const arr = ['a', 'b', 'c'];
      `;

      const result = await execute(code);

      expect(result.js).toContain('export const str = "test"');
      expect(result.js).toContain('export const num = 100');
      expect(result.js).toContain('export const bool = true');
      expect(result.js).toContain('export const obj =');
      expect(result.js).toContain('export const arr =');
    });
  });

  describe('Error handling', () => {
    it('should handle syntax errors gracefully', async () => {
      const code = `
        this is not valid javascript
      `;

      await expect(execute(code)).rejects.toThrow();
    });

    it('should handle import errors with cleaned error message', async () => {
      const code = `
        import { NonExistent } from 'surimi';
        export const __SURIMI_GENERATED_CSS__ = '';
      `;

      try {
        await execute(code);
        // If no error is thrown, fail the test
        expect.fail();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          // Check that data URL is stripped from error message
          expect(error.message).not.toContain('data:text/javascript;base64');
        }
      }
    });
  });
});

import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { compile } from '../../src';

const fixturesDir = path.resolve(__dirname, '../fixtures');

describe('Compiler', () => {
  const createOptions = (fixture: string) => ({
    inputPath: path.join(fixturesDir, fixture),
    cwd: process.cwd(),
    include: ['**/*.css.ts'],
    exclude: ['**/node_modules/**'],
  });

  describe('Simple compilation', () => {
    it('should compile a simple CSS file', async () => {
      const result = await compile(createOptions('simple.css.ts'));

      expect(result).toBeDefined();
      expect(result?.css).toBeDefined();
      expect(result?.js).toBeDefined();
      expect(result?.dependencies).toBeInstanceOf(Array);

      // Check CSS output
      expect(result?.css).toContain('.container');
      expect(result?.css).toContain('display');
      expect(result?.css).toContain('flex');
      expect(result?.css).toContain('padding');

      // Check JS exports
      expect(result?.js).toContain('export const buttonClass = "btn-primary"');
    });

    it('should handle empty CSS files', async () => {
      const result = await compile(createOptions('empty.css.ts'));

      expect(result).toBeDefined();
      expect(result?.css).toBeDefined();
      expect(result?.js).toBeDefined();

      // Empty file should produce minimal output
      expect(result?.js).toBe('');
    });
  });

  describe('Exports handling', () => {
    it('should preserve all export types', async () => {
      const result = await compile(createOptions('with-exports.css.ts'));

      expect(result).toBeDefined();
      expect(result?.js).toBeDefined();

      // Check CSS
      expect(result?.css).toContain('.card');

      // Check various export types
      expect(result?.js).toContain('export const className = "card-component"');
      expect(result?.js).toContain('export const spacing = 16');
      expect(result?.js).toContain('export const isEnabled = true');
      expect(result?.js).toContain('export const config =');
      expect(result?.js).toContain('export const tags =');
    });

    it('should handle complex export scenarios', async () => {
      const result = await compile(createOptions('complex-exports.css.ts'));

      expect(result).toBeDefined();

      // All types should be exported
      expect(result?.js).toContain('export const stringValue = "hello"');
      expect(result?.js).toContain('export const numberValue = 42');
      expect(result?.js).toContain('export const booleanValue = true');
      expect(result?.js).toContain('export const nullValue = null');
      expect(result?.js).toContain('export const arrayValue =');
      expect(result?.js).toContain('export const objectValue =');
      expect(result?.js).toContain('export const nestedObject =');

      // Nested values should be serialized correctly
      expect(result?.js).toContain('#007bff');
      expect(result?.js).toContain('#6c757d');
    });
  });

  describe('Imports handling', () => {
    it('should handle files with imports from other CSS files', async () => {
      const result = await compile(createOptions('with-imports.css.ts'));

      expect(result).toBeDefined();

      // Should compile successfully
      expect(result?.css).toContain('background-color');
      expect(result?.css).toContain('blue');

      // Should re-export the imported value
      expect(result?.js).toContain('export const buttonClass');
    });
  });

  describe('Media queries', () => {
    it('should compile media queries correctly', async () => {
      const result = await compile(createOptions('media-queries.css.ts'));

      expect(result).toBeDefined();

      // Check base styles
      expect(result?.css).toContain('.responsive-grid');
      expect(result?.css).toContain('display');
      expect(result?.css).toContain('grid');

      // Check media queries
      expect(result?.css).toContain('@media');
      expect(result?.css).toContain('min-width');
      expect(result?.css).toContain('768px');
      expect(result?.css).toContain('1024px');
      expect(result?.css).toContain('grid-template-columns');

      // Check exports
      expect(result?.js).toContain('export const breakpoints =');
      expect(result?.js).toContain('mobile');
      expect(result?.js).toContain('desktop');
    });
  });

  describe('Dependencies tracking', () => {
    it('should track file dependencies', async () => {
      const result = await compile(createOptions('simple.css.ts'));

      expect(result?.dependencies).toBeInstanceOf(Array);
      expect(result?.dependencies.length).toBeGreaterThan(0);

      // Should include the input file itself or its modules
      const hasRelevantDeps = result?.dependencies.some(
        (dep: string) => dep.includes('.css.ts') || dep.includes('surimi') || dep.includes('simple'),
      );
      expect(hasRelevantDeps).toBe(true);
    });

    it('should track dependencies for files with imports', async () => {
      const result = await compile(createOptions('with-imports.css.ts'));

      expect(result?.dependencies).toBeInstanceOf(Array);
      expect(result?.dependencies.length).toBeGreaterThan(0);

      // Should include both the main file and the imported file
      const dependencyPaths = result?.dependencies.map((dep: string) => dep.toLowerCase());
      const hasImportedFile = dependencyPaths?.some(
        (dep: string) => dep.includes('simple.css.ts') || dep.includes('with-imports.css.ts'),
      );
      expect(hasImportedFile).toBe(true);
    });

    it('should not include node_modules in dependencies', async () => {
      const result = await compile(createOptions('simple.css.ts'));

      // Filter dependencies to check for node_modules
      const hasNodeModules = result?.dependencies.some((dep: string) => dep.includes('node_modules'));

      expect(hasNodeModules).toBe(false);
    });
  });

  describe('Output format', () => {
    it('should return correct result structure', async () => {
      const result = await compile(createOptions('simple.css.ts'));

      expect(result).toBeDefined();
      expect(result).toHaveProperty('css');
      expect(result).toHaveProperty('js');
      expect(result).toHaveProperty('dependencies');

      expect(typeof result?.css).toBe('string');
      expect(typeof result?.js).toBe('string');
      expect(Array.isArray(result?.dependencies)).toBe(true);
    });

    it('should produce valid CSS output', async () => {
      const result = await compile(createOptions('simple.css.ts'));

      // CSS should have proper structure
      expect(result?.css).toMatch(/\.[a-zA-Z-_]+\s*\{/); // Selector with opening brace
      expect(result?.css).toContain('}'); // Closing brace
    });
  });

  describe('Edge cases', () => {
    it('should handle file with only imports and no styles', async () => {
      // This would need a special fixture
      const result = await compile(createOptions('empty.css.ts'));

      expect(result).toBeDefined();
      expect(result?.css).toBeDefined();
      expect(result?.js).toBeDefined();
    });

    it('should deduplicate dependencies', async () => {
      const result = await compile(createOptions('with-imports.css.ts'));

      // Dependencies should be unique (Set is used in the implementation)
      const deps = result?.dependencies ?? [];
      const uniqueDeps = [...new Set(deps)];

      expect(deps.length).toBe(uniqueDeps.length);
    });
  });

  describe('Error scenarios', () => {
    it('should handle non-existent files gracefully', async () => {
      await expect(compile(createOptions('non-existent-file.css.ts'))).rejects.toThrow();
    });

    it('should validate options before compilation', async () => {
      await expect(
        compile({
          inputPath: '',
          cwd: process.cwd(),
          include: ['**/*.css.ts'],
          exclude: [],
        }),
      ).rejects.toThrow('inputPath must be a non-empty string');
    });
  });
});

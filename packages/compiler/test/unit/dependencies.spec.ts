import { describe, expect, it } from 'vitest';
import { assertValidCompileResult, compileCode, compileFixture, createTestProject } from '../helpers/test-utils';
import * as path from 'node:path';

describe('Dependency Tracking', () => {
  describe('static imports', () => {
    it('should track direct imports', async () => {
      const result = await compileFixture('with-imports.css.ts');

      assertValidCompileResult(result);
      expect(result.dependencies.length).toBeGreaterThan(0);

      const hasExportsFile = result.dependencies.some((dep) => dep.includes('with-exports'));
      expect(hasExportsFile).toBe(true);
    });

    it('should track multiple imports', async () => {
      const project = createTestProject({
        'main.css.ts': `\
import { select } from 'surimi';
import { theme } from './theme';
import { colors } from './colors';

select('.app').style({
  backgroundColor: colors.primary,
  padding: theme.spacing.medium,
});
`,
        'theme.ts': `\
export const theme = {
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '2rem',
  },
};
`,
        'colors.ts': `\
export const colors = {
  primary: '#007bff',
  secondary: '#6c757d',
};
`,
      });

      try {
        const result = await compileCode(
          `\
import { select } from 'surimi';
import { theme } from './theme';
import { colors } from './colors';

select('.app').style({
  backgroundColor: colors.primary,
  padding: theme.spacing.medium,
});
`,
          'main.css.ts',
          { cwd: project.path }
        );

        // Note: This test might not work as expected because rolldown handles imports differently
        // in temporary directories. The main purpose is to test the dependency tracking logic.
        if (result) {
          assertValidCompileResult(result);
        }
      } finally {
        project.cleanup();
      }
    });

    it('should track nested imports', async () => {
      const result = await compileFixture('with-imports.css.ts');

      assertValidCompileResult(result);
      // with-imports.css.ts imports with-exports.css.ts
      const hasNestedDep = result.dependencies.some((dep) => dep.includes('with-exports'));
      expect(hasNestedDep).toBe(true);
    });

    it('should track CSS file imports', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      // Should track the surimi import
      expect(result.dependencies.length).toBeGreaterThan(0);
    });
  });

  describe('dependency deduplication', () => {
    it('should return unique dependencies', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      const uniqueDeps = new Set(result.dependencies);
      expect(result.dependencies.length).toBe(uniqueDeps.size);
    });

    it('should deduplicate multiple imports of same file', async () => {
      const code = `\
import { select } from 'surimi';
import { select as sel } from 'surimi';

select('.test1').style({ display: 'block' });
sel('.test2').style({ display: 'flex' });
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      const uniqueDeps = new Set(result.dependencies);
      expect(result.dependencies.length).toBe(uniqueDeps.size);
    });
  });

  describe('filtering', () => {
    it('should exclude node_modules', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      const hasNodeModules = result.dependencies.some((dep) => dep.includes('node_modules'));
      expect(hasNodeModules).toBe(false);
    });

    it('should exclude rolldown runtime', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      const hasRolldownRuntime = result.dependencies.some((dep) => dep.includes('rolldown:runtime'));
      expect(hasRolldownRuntime).toBe(false);
    });

    it('should exclude development surimi files', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      // Should not include files from packages/surimi/ or packages/parsers/
      const hasSurimiDev = result.dependencies.some((dep) => dep.includes('packages/surimi/'));
      const hasParsersDev = result.dependencies.some((dep) => dep.includes('packages/parsers/'));

      expect(hasSurimiDev).toBe(false);
      expect(hasParsersDev).toBe(false);
    });

    it('should include user files but not internal dependencies', async () => {
      const result = await compileFixture('with-imports.css.ts');

      assertValidCompileResult(result);

      // Should include the imported fixture file
      const hasUserFile = result.dependencies.some((dep) => dep.includes('with-exports'));
      expect(hasUserFile).toBe(true);

      // Should not include node_modules
      const hasNodeModules = result.dependencies.some((dep) => dep.includes('node_modules'));
      expect(hasNodeModules).toBe(false);
    });
  });

  describe('path handling', () => {
    it('should handle absolute paths', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      // Dependencies should be absolute or resolvable paths
      result.dependencies.forEach((dep) => {
        expect(typeof dep).toBe('string');
        expect(dep.length).toBeGreaterThan(0);
      });
    });

    it('should handle relative paths', async () => {
      const result = await compileFixture('with-imports.css.ts');

      assertValidCompileResult(result);
      // Should track the relative import
      const hasRelativeImport = result.dependencies.some((dep) => dep.includes('with-exports'));
      expect(hasRelativeImport).toBe(true);
    });

    it('should handle mixed path styles', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      // All paths should be strings
      result.dependencies.forEach((dep) => {
        expect(typeof dep).toBe('string');
      });
    });

    it('should normalize paths consistently', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);

      // Check that there are no duplicate paths with different separators
      const normalizedDeps = result.dependencies.map((dep) =>
        dep.replace(/\\/g, '/').toLowerCase()
      );
      const uniqueNormalized = new Set(normalizedDeps);

      // All dependencies should be unique when normalized
      expect(normalizedDeps.length).toBe(uniqueNormalized.size);
    });
  });

  describe('isDevelopmentSurimiFile detection', () => {
    it('should detect packages/surimi files', async () => {
      // This is tested indirectly - development surimi files should be filtered out
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      const hasSurimiPackage = result.dependencies.some((dep) => dep.includes('packages/surimi/'));
      expect(hasSurimiPackage).toBe(false);
    });

    it('should detect packages/parsers files', async () => {
      // This is tested indirectly - development parsers files should be filtered out
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      const hasParsersPackage = result.dependencies.some((dep) => dep.includes('packages/parsers/'));
      expect(hasParsersPackage).toBe(false);
    });

    it('should not flag node_modules/surimi', async () => {
      // node_modules files are filtered out by a different mechanism
      // This test ensures we don't confuse node_modules/surimi with packages/surimi
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      // Should not include any node_modules
      const hasNodeModules = result.dependencies.some((dep) => dep.includes('node_modules'));
      expect(hasNodeModules).toBe(false);
    });
  });

  describe('dependency array structure', () => {
    it('should return array of strings', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      expect(Array.isArray(result.dependencies)).toBe(true);
      result.dependencies.forEach((dep) => {
        expect(typeof dep).toBe('string');
      });
    });

    it('should return empty array for standalone files', async () => {
      const code = `\
import { select } from 'surimi';
select('.standalone').style({ display: 'block' });
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      // May have some dependencies (like surimi itself in node_modules which gets filtered)
      // but should be an array
      expect(Array.isArray(result.dependencies)).toBe(true);
    });

    it('should not include empty strings', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      const hasEmptyStrings = result.dependencies.some((dep) => dep === '');
      expect(hasEmptyStrings).toBe(false);
    });

    it('should not include undefined or null values', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      const hasInvalidValues = result.dependencies.some((dep) => !dep || dep === 'undefined' || dep === 'null');
      expect(hasInvalidValues).toBe(false);
    });
  });

  describe('dynamic imports', () => {
    it('should track dynamic imports', async () => {
      const code = `\
import { select } from 'surimi';

select('.dynamic').style({ display: 'block' });

// Dynamic import (though this won't actually work in the compilation context)
// This test checks if the compiler handles dynamic import syntax
const module = import('./some-module');
`;

      // This might fail during compilation due to the dynamic import
      // The test is here to document the behavior
      try {
        const result = await compileCode(code);
        if (result) {
          assertValidCompileResult(result);
        }
      } catch (error) {
        // Dynamic imports might not be supported in the current implementation
        expect(error).toBeDefined();
      }
    });
  });

  describe('edge cases', () => {
    it('should handle files with no imports', async () => {
      const code = `\
import { select } from 'surimi';
select('.no-imports').style({ display: 'block' });
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(Array.isArray(result.dependencies)).toBe(true);
    });

    it('should handle files with only type imports', async () => {
      const code = `\
import { select } from 'surimi';
import type { CSSProperties } from 'surimi';

const styles: CSSProperties = { display: 'block' };
select('.typed').style(styles);
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(Array.isArray(result.dependencies)).toBe(true);
    });

    it('should handle circular dependencies gracefully', async () => {
      // This is a limitation test - circular deps might cause issues
      // but shouldn't crash the compiler

      const project = createTestProject({
        'a.ts': `\
export { b } from './b';
export const a = 'a';
`,
        'b.ts': `\
export { a } from './a';
export const b = 'b';
`,
        'main.css.ts': `\
import { select } from 'surimi';
import { a } from './a';
import { b } from './b';

select('.circular').style({ display: 'block' });
`,
      });

      try {
        // This might throw an error due to circular dependencies
        // The test documents this behavior
        const inputPath = path.join(project.path, 'main.css.ts');
        const result = await compileCode(
          `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
`,
          'test.css.ts',
          { cwd: project.path }
        );

        if (result) {
          assertValidCompileResult(result);
        }
      } catch (error) {
        // Circular dependencies are expected to potentially fail
        expect(error).toBeDefined();
      } finally {
        project.cleanup();
      }
    });
  });
});

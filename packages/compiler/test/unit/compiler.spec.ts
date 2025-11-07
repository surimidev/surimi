import { describe, expect, it } from 'vitest';
import {
  assertValidCompileResult,
  compileCode,
  compileFixture,
  createSimpleCSS,
} from '../helpers/test-utils';

describe('compile()', () => {
  describe('basic compilation', () => {
    it('should compile a simple CSS file', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      expect(result.css).toContain('.container');
      expect(result.css).toContain('display: flex');
      expect(result.css).toContain('#header');
      expect(result.css).toContain('background-color: blue');
    });

    it('should compile TypeScript with type annotations', async () => {
      const code = `\
import { select } from 'surimi';

const styles: Record<string, string> = {
  display: 'flex',
  padding: '1rem',
};

select('.typed').style(styles);
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.css).toContain('.typed');
      expect(result.css).toContain('display: flex');
    });

    it('should handle empty CSS files', async () => {
      const result = await compileFixture('empty.css.ts');

      assertValidCompileResult(result);
      expect(result.css).toBe('');
    });

    it('should compile files with only comments', async () => {
      const code = `\
import { select } from 'surimi';

// This is a comment
/* This is a multi-line
   comment */
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.css).toBe('');
    });

    it('should preserve export order', async () => {
      const result = await compileFixture('with-exports.css.ts');

      assertValidCompileResult(result);
      expect(result.js).toContain('export const theme');
      expect(result.js).toContain('export const className');
      expect(result.js).toContain('export const zIndex');
    });
  });

  describe('CSS generation', () => {
    it('should generate valid CSS', async () => {
      const code = createSimpleCSS('.test', {
        display: 'grid',
        gap: '1rem',
      });

      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.css).toContain('.test');
      expect(result.css).toContain('display: grid');
      expect(result.css).toContain('gap: 1rem');
    });

    it('should handle media queries', async () => {
      const result = await compileFixture('media-queries.css.ts');

      assertValidCompileResult(result);
      expect(result.css).toContain('@media');
      expect(result.css).toContain('(min-width: 768px)');
      expect(result.css).toContain('(min-width: 1024px)');
    });

    it('should handle multiple selectors', async () => {
      const code = `\
import { select } from 'surimi';

select('.a', '.b', '.c').style({
  margin: '0',
});
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.css).toContain('.a, .b, .c');
      expect(result.css).toContain('margin: 0');
    });
  });

  describe('export handling', () => {
    it('should preserve string exports', async () => {
      const result = await compileFixture('with-exports.css.ts');

      assertValidCompileResult(result);
      expect(result.js).toContain('export const className = "my-component"');
    });

    it('should preserve object exports', async () => {
      const result = await compileFixture('with-exports.css.ts');

      assertValidCompileResult(result);
      expect(result.js).toContain('export const theme');
      expect(result.js).toContain('"primary":"#007bff"');
    });

    it('should preserve number exports', async () => {
      const result = await compileFixture('with-exports.css.ts');

      assertValidCompileResult(result);
      expect(result.js).toContain('export const zIndex = 1000');
    });

    it('should preserve array exports', async () => {
      const result = await compileFixture('complex-exports.css.ts');

      assertValidCompileResult(result);
      expect(result.js).toContain('export const breakpoints');
      expect(result.js).toContain('["640px","768px","1024px","1280px"]');
    });

    it('should preserve boolean exports', async () => {
      const result = await compileFixture('complex-exports.css.ts');

      assertValidCompileResult(result);
      expect(result.js).toContain('export const isDarkMode = false');
    });

    it('should preserve nested object exports', async () => {
      const result = await compileFixture('complex-exports.css.ts');

      assertValidCompileResult(result);
      expect(result.js).toContain('export const config');
      expect(result.js).toContain('"theme"');
      expect(result.js).toContain('"features"');
    });

    it('should not export __SURIMI_GENERATED_CSS__', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      expect(result.js).not.toContain('__SURIMI_GENERATED_CSS__');
    });

    it('should generate empty export for files with no exports', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      expect(result.js).toContain('No exports found');
      expect(result.js).toContain('export {};');
    });
  });

  describe('dependency tracking', () => {
    it('should track imported files', async () => {
      const result = await compileFixture('with-imports.css.ts');

      assertValidCompileResult(result);
      expect(result.dependencies.length).toBeGreaterThan(0);

      // Should include the imported file
      const hasExportsFile = result.dependencies.some((dep) =>
        dep.includes('with-exports')
      );
      expect(hasExportsFile).toBe(true);
    });

    it('should return unique dependencies', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      const uniqueDeps = new Set(result.dependencies);
      expect(result.dependencies.length).toBe(uniqueDeps.size);
    });

    it('should not include node_modules in dependencies', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      const hasNodeModules = result.dependencies.some((dep) =>
        dep.includes('node_modules')
      );
      expect(hasNodeModules).toBe(false);
    });
  });

  describe('compilation result structure', () => {
    it('should return valid CompileResult structure', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
    });

    it('should return CSS as string', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      expect(typeof result.css).toBe('string');
    });

    it('should return JS as string', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      expect(typeof result.js).toBe('string');
    });

    it('should return dependencies as array', async () => {
      const result = await compileFixture('simple.css.ts');

      assertValidCompileResult(result);
      expect(Array.isArray(result.dependencies)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw on runtime errors', async () => {
      await expect(compileFixture('with-errors.css.ts')).rejects.toThrow();
    });

    it('should throw on missing files', async () => {
      await expect(compileFixture('non-existent.css.ts')).rejects.toThrow();
    });

    it('should handle syntax errors gracefully', async () => {
      const code = `\
import { select } from 'surimi';

select('.test').style({
  display: 'flex',
  // Missing closing brace
`;
      await expect(compileCode(code)).rejects.toThrow();
    });
  });

  describe('special cases', () => {
    it('should handle files with Unicode characters', async () => {
      const code = `\
import { select } from 'surimi';

select('.unicode').style({
  content: '✨ Hello 世界 🌍',
});
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.css).toContain('unicode');
    });

    it('should handle very long selector names', async () => {
      const longSelector = '.a'.repeat(100);
      const code = createSimpleCSS(longSelector, { display: 'block' });

      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.css).toContain(longSelector);
    });

    it('should handle files with many style rules', async () => {
      let code = `import { select } from 'surimi';\n\n`;

      for (let i = 0; i < 100; i++) {
        code += `select('.class-${i}').style({ display: 'block' });\n`;
      }

      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.css).toContain('.class-0');
      expect(result.css).toContain('.class-99');
    });
  });
});

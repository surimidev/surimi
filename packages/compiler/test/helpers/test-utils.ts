import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { expect } from 'vitest';
import compile, { type CompileOptions, type CompileResult } from '../../src/compiler';

/**
 * Creates a temporary test directory with the given files
 * @returns Object with path to the directory and a cleanup function
 */
export function createTestProject(files: Record<string, string>): {
  path: string;
  cleanup: () => void;
} {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'surimi-test-'));

  // Create all files in the temporary directory
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(tmpDir, filePath);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content, 'utf-8');
  }

  return {
    path: tmpDir,
    cleanup: () => {
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    },
  };
}

/**
 * Compiles a test fixture from the fixtures directory
 */
export async function compileFixture(
  fixtureName: string,
  options?: Partial<CompileOptions>
): Promise<CompileResult | undefined> {
  const fixturesDir = path.join(__dirname, '../fixtures');
  const inputPath = path.join(fixturesDir, fixtureName);

  return await compile({
    inputPath,
    cwd: fixturesDir,
    include: ['**/*.ts', '**/*.tsx'],
    exclude: ['**/*.d.ts', '**/node_modules/**'],
    ...options,
  });
}

/**
 * Compiles code from a temporary file
 */
export async function compileCode(
  code: string,
  filename = 'test.css.ts',
  options?: Partial<CompileOptions>
): Promise<CompileResult | undefined> {
  const project = createTestProject({
    [filename]: code,
  });

  try {
    const inputPath = path.join(project.path, filename);
    // Use the repo root as cwd so module resolution works
    const repoCwd = path.resolve(__dirname, '../../../..');
    return await compile({
      inputPath,
      cwd: repoCwd, // Use repo root instead of temp dir for module resolution
      include: ['**/*.ts', '**/*.tsx'],
      exclude: ['**/*.d.ts', '**/node_modules/**'],
      ...options,
    });
  } finally {
    project.cleanup();
  }
}

/**
 * Normalizes whitespace in CSS for comparison
 */
export function normalizeCSS(css: string): string {
  return css
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*:\s*/g, ':');
}

/**
 * Asserts that two CSS strings are equivalent (ignoring whitespace differences)
 */
export function assertCSSMatches(
  actual: string,
  expected: string,
  options: { ignoreWhitespace?: boolean } = {}
): void {
  if (options.ignoreWhitespace !== false) {
    expect(normalizeCSS(actual)).toBe(normalizeCSS(expected));
  } else {
    expect(actual).toBe(expected);
  }
}

/**
 * Asserts that the result contains the expected CSS
 */
export function assertContainsCSS(result: CompileResult | undefined, expectedCSS: string): void {
  expect(result).toBeDefined();
  expect(result!.css).toContain(expectedCSS);
}

/**
 * Asserts that the result has valid structure
 */
export function assertValidCompileResult(result: CompileResult | undefined): asserts result is CompileResult {
  expect(result).toBeDefined();
  expect(result).toHaveProperty('css');
  expect(result).toHaveProperty('js');
  expect(result).toHaveProperty('dependencies');
  expect(typeof result!.css).toBe('string');
  expect(typeof result!.js).toBe('string');
  expect(Array.isArray(result!.dependencies)).toBe(true);
}

/**
 * Creates a simple CSS file content for testing
 */
export function createSimpleCSS(selector: string, styles: Record<string, string>): string {
  const styleEntries = Object.entries(styles)
    .map(([key, value]) => `  ${key}: '${value}'`)
    .join(',\n');

  return `\
import { select } from 'surimi';

select('${selector}').style({
${styleEntries}
});
`;
}

/**
 * Creates a CSS file with exports for testing
 */
export function createCSSWithExports(selector: string, exports: Record<string, unknown>): string {
  const exportStatements = Object.entries(exports)
    .map(([key, value]) => `export const ${key} = ${JSON.stringify(value)};`)
    .join('\n');

  return `\
import { select } from 'surimi';

select('${selector}').style({
  display: 'flex'
});

${exportStatements}
`;
}

/**
 * Wait for a given amount of time (useful for watch mode tests)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Reads a file from the fixtures directory
 */
export function readFixture(fixtureName: string): string {
  const fixturesDir = path.join(__dirname, '../fixtures');
  const filePath = path.join(fixturesDir, fixtureName);
  return fs.readFileSync(filePath, 'utf-8');
}

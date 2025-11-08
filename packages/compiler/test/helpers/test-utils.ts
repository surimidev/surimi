// Test utilities for compiler tests

import path from 'node:path';
import type { CompileOptions } from '../../src/compiler';

// Creates default compile options for testing
export function createDefaultOptions(inputPath: string): CompileOptions {
  return {
    inputPath,
    cwd: process.cwd(),
    include: ['**/*.css.ts'],
    exclude: ['**/node_modules/**'],
  };
}

// Creates options for a fixture file
export function createFixtureOptions(fixtureName: string): CompileOptions {
  const fixturesDir = path.resolve(__dirname, '../fixtures');
  return createDefaultOptions(path.join(fixturesDir, fixtureName));
}

// Normalizes whitespace in strings for comparison
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

// Checks if a string contains all specified substrings
export function containsAll(str: string, substrings: string[]): boolean {
  return substrings.every((substring) => str.includes(substring));
}

// Extracts all export statements from generated JS
export function extractExports(js: string): string[] {
  const exportRegex = /export\s+const\s+(\w+)/g;
  const exports: string[] = [];
  let match;

  while ((match = exportRegex.exec(js)) !== null) {
    exports.push(match[1]);
  }

  return exports;
}

// Validates CSS syntax (basic check)
export function isValidCSS(css: string): boolean {
  // Basic checks: should have balanced braces
  const openBraces = (css.match(/\{/g) ?? []).length;
  const closeBraces = (css.match(/\}/g) ?? []).length;

  return openBraces === closeBraces;
}

// Creates a temporary test file path
export function getTempFilePath(filename: string): string {
  return path.join(process.cwd(), 'tmp', 'test', filename);
}

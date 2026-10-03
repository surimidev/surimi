import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from '@surimi/compiler';
import { describe, expect, it } from 'vitest';

import { evaluateFromPath } from './helpers/vite.js';

const fixturesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../compiler/test/fixtures');

const fixtureFiles = [
  'simple.css.ts',
  'empty.css.ts',
  'with-exports.css.ts',
  'with-imports.css.ts',
  'complex-exports.css.ts',
  'media-queries.css.ts',
] as const;

describe('vite-plugin-surimi compiler parity', () => {
  for (const fixture of fixtureFiles) {
    it(`matches compiler output for ${fixture}`, async () => {
      const inputPath = path.join(fixturesDir, fixture);
      const compilerResult = await compile({
        input: inputPath,
        cwd: process.cwd(),
        include: ['**/*.css.ts'],
        exclude: ['**/node_modules/**'],
      });

      expect(compilerResult).toBeDefined();

      const pluginResult = await evaluateFromPath(inputPath, {
        include: ['**/*.css.ts'],
        exclude: ['**/node_modules/**'],
      });

      expect(pluginResult.css).toBe(compilerResult?.css);
      expect(pluginResult.js).toBe(compilerResult?.js);
    });
  }
});

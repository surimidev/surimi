import path from 'node:path';
import type { RolldownWatcher } from 'rolldown';
import { afterEach, describe, expect, it } from 'vitest';

import { compileWatch } from '../../src';

const fixturesDir = path.resolve(__dirname, '../fixtures');

describe('Compiler Watch Mode', () => {
  let watcher: RolldownWatcher | null = null;

  afterEach(async () => {
    // Clean up watcher after each test
    if (watcher) {
      await watcher.close();
      watcher = null;
    }
  });

  const createOptions = (fixture: string) => ({
    inputPath: path.join(fixturesDir, fixture),
    cwd: process.cwd(),
    include: ['**/*.css.ts'],
    exclude: ['**/node_modules/**'],
  });

  const createWatchOptions = () => ({
    onChange: () => {
      // No-op for basic tests
    },
  });

  describe('Watcher creation', () => {
    it('should create a watcher instance', () => {
      watcher = compileWatch(createOptions('simple.css.ts'), createWatchOptions());

      expect(watcher).toBeDefined();
      expect(watcher).toHaveProperty('on');
      expect(watcher).toHaveProperty('close');
      expect(typeof watcher.on).toBe('function');
      expect(typeof watcher.close).toBe('function');
    });

    it('should create watcher for file with imports', () => {
      watcher = compileWatch(createOptions('with-imports.css.ts'), createWatchOptions());

      expect(watcher).toBeDefined();
    });

    it('should create watcher for file with media queries', () => {
      watcher = compileWatch(createOptions('media-queries.css.ts'), createWatchOptions());

      expect(watcher).toBeDefined();
    });
  });

  describe('Watcher validation', () => {
    it('should validate options before creating watcher', () => {
      expect(() =>
        compileWatch(
          {
            inputPath: '',
            cwd: process.cwd(),
            include: ['**/*.css.ts'],
            exclude: [],
          },
          createWatchOptions(),
        ),
      ).toThrow('inputPath must be a non-empty string');
    });

    it('should require valid cwd', () => {
      expect(() =>
        compileWatch(
          {
            inputPath: path.join(fixturesDir, 'simple.css.ts'),
            cwd: '',
            include: ['**/*.css.ts'],
            exclude: [],
          },
          createWatchOptions(),
        ),
      ).toThrow('cwd must be a non-empty string');
    });

    it('should require non-empty include array', () => {
      expect(() =>
        compileWatch(
          {
            inputPath: path.join(fixturesDir, 'simple.css.ts'),
            cwd: process.cwd(),
            include: [],
            exclude: [],
          },
          createWatchOptions(),
        ),
      ).toThrow('include array cannot be empty');
    });
  });

  describe('Watcher lifecycle', () => {
    it('should close watcher successfully', async () => {
      watcher = compileWatch(createOptions('simple.css.ts'), createWatchOptions());

      // Should not throw when closing
      await expect(watcher.close()).resolves.not.toThrow();

      watcher = null; // Prevent double cleanup
    });

    it('should handle multiple close calls gracefully', async () => {
      watcher = compileWatch(createOptions('simple.css.ts'), createWatchOptions());

      await watcher.close();
      // Second close should not throw
      await expect(watcher.close()).resolves.not.toThrow();

      watcher = null;
    });
  });
});

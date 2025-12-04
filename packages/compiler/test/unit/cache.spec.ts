import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { CompileResult } from '../../src';
import { BuildCache } from '../../src/cache';

const testDir = path.resolve(__dirname, '../.cache-test');

describe('BuildCache', () => {
  let cache: BuildCache;

  beforeEach(async () => {
    cache = new BuildCache();
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    cache.clear();
    await rm(testDir, { recursive: true, force: true });
  });

  const createTestFile = async (name: string, content: string): Promise<string> => {
    const filePath = path.join(testDir, name);
    await writeFile(filePath, content, 'utf-8');
    return filePath;
  };

  const createMockResult = (css = 'body { color: red; }'): CompileResult => ({
    css,
    js: 'export const test = "value";',
    dependencies: [],
    duration: 10,
  });

  describe('Basic caching', () => {
    it('should return undefined for cache miss', async () => {
      const filePath = await createTestFile('test.css.ts', 'export {}');

      const result = await cache.get(filePath);

      expect(result).toBeUndefined();
    });

    it('should return cached result for cache hit', async () => {
      const filePath = await createTestFile('test.css.ts', 'export {}');
      const mockResult = createMockResult();

      await cache.set(filePath, mockResult);
      const result = await cache.get(filePath);

      expect(result).toEqual(mockResult);
    });

    it('should invalidate cache when file content changes', async () => {
      const filePath = await createTestFile('test.css.ts', 'export const a = 1;');
      const mockResult = createMockResult();

      await cache.set(filePath, mockResult);

      // Change file content
      await writeFile(filePath, 'export const a = 2;', 'utf-8');

      const result = await cache.get(filePath);

      expect(result).toBeUndefined();
    });
  });

  describe('Dependency tracking', () => {
    it('should invalidate cache when dependencies change', async () => {
      const mainFile = await createTestFile('main.css.ts', 'import "./dep";');
      const depFile = await createTestFile('dep.css.ts', 'export const color = "red";');

      const mockResult: CompileResult = {
        ...createMockResult(),
        dependencies: [depFile],
      };

      await cache.set(mainFile, mockResult);

      // Verify cache hit with unchanged dependency
      let result = await cache.get(mainFile);
      expect(result).toEqual(mockResult);

      // Change dependency
      await writeFile(depFile, 'export const color = "blue";', 'utf-8');

      // Should invalidate cache
      result = await cache.get(mainFile);
      expect(result).toBeUndefined();
    });

    it('should handle multiple dependencies', async () => {
      const mainFile = await createTestFile('main.css.ts', 'import "./a"; import "./b";');
      const depA = await createTestFile('a.css.ts', 'export const a = 1;');
      const depB = await createTestFile('b.css.ts', 'export const b = 2;');

      const mockResult: CompileResult = {
        ...createMockResult(),
        dependencies: [depA, depB],
      };

      await cache.set(mainFile, mockResult);

      // Cache hit with all dependencies unchanged
      let result = await cache.get(mainFile);
      expect(result).toEqual(mockResult);

      // Change one dependency
      await writeFile(depB, 'export const b = 3;', 'utf-8');

      // Should invalidate
      result = await cache.get(mainFile);
      expect(result).toBeUndefined();
    });

    it('should invalidate dependents when a file changes', async () => {
      const depFile = await createTestFile('shared.css.ts', 'export const color = "red";');
      const fileA = await createTestFile('a.css.ts', 'import "./shared";');
      const fileB = await createTestFile('b.css.ts', 'import "./shared";');

      const resultA: CompileResult = { ...createMockResult('a'), dependencies: [depFile] };
      const resultB: CompileResult = { ...createMockResult('b'), dependencies: [depFile] };

      await cache.set(fileA, resultA);
      await cache.set(fileB, resultB);

      // Both should be cached
      expect(await cache.get(fileA)).toBeDefined();
      expect(await cache.get(fileB)).toBeDefined();

      // Invalidate dependents of shared file
      cache.invalidateDependents(depFile);

      // Both should be invalidated
      expect(await cache.get(fileA)).toBeUndefined();
      expect(await cache.get(fileB)).toBeUndefined();
    });
  });

  describe('Cache statistics', () => {
    it('should track cache hits and misses', async () => {
      const filePath = await createTestFile('test.css.ts', 'export {}');
      const mockResult = createMockResult();

      // Initial stats
      let stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);

      // Cache miss
      await cache.get(filePath);
      stats = cache.getStats();
      expect(stats.misses).toBe(1);

      // Set cache
      await cache.set(filePath, mockResult);

      // Cache hit
      await cache.get(filePath);
      stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });

    it('should track cache size', async () => {
      const file1 = await createTestFile('test1.css.ts', 'export {}');
      const file2 = await createTestFile('test2.css.ts', 'export {}');

      await cache.set(file1, createMockResult());
      await cache.set(file2, createMockResult());

      const stats = cache.getStats();
      expect(stats.size).toBe(2);
    });

    it('should reset stats on clear', async () => {
      const filePath = await createTestFile('test.css.ts', 'export {}');
      await cache.set(filePath, createMockResult());
      await cache.get(filePath);

      cache.clear();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.size).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle non-existent files gracefully', async () => {
      const nonExistentPath = path.join(testDir, 'does-not-exist.css.ts');

      // Should not throw
      const result = await cache.get(nonExistentPath);
      expect(result).toBeUndefined();
    });

    it('should handle empty dependencies array', async () => {
      const filePath = await createTestFile('test.css.ts', 'export {}');
      const mockResult = createMockResult();

      await cache.set(filePath, mockResult);
      const result = await cache.get(filePath);

      expect(result).toEqual(mockResult);
    });

    it('should handle clearing empty cache', () => {
      expect(() => {
        cache.clear();
      }).not.toThrow();

      const stats = cache.getStats();
      expect(stats.size).toBe(0);
    });
  });
});

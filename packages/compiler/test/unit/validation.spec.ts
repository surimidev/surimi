import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { compile } from '../../src';

describe('Compiler Validation', () => {
  const validOptions = {
    inputPath: path.resolve(__dirname, '../fixtures/simple.css.ts'),
    cwd: process.cwd(),
    include: ['**/*.css.ts'],
    exclude: ['**/node_modules/**'],
  };

  describe('inputPath validation', () => {
    it('should throw error when inputPath is missing', async () => {
      await expect(
        compile({
          ...validOptions,
          inputPath: '',
        }),
      ).rejects.toThrow('inputPath must be a non-empty string');
    });

    it('should throw error when inputPath is not a string', async () => {
      await expect(
        compile({
          ...validOptions,
          inputPath: 123 as unknown as string,
        }),
      ).rejects.toThrow('inputPath must be a non-empty string');
    });
  });

  describe('cwd validation', () => {
    it('should throw error when cwd is missing', async () => {
      await expect(
        compile({
          ...validOptions,
          cwd: '',
        }),
      ).rejects.toThrow('cwd must be a non-empty string');
    });

    it('should throw error when cwd is not a string', async () => {
      await expect(
        compile({
          ...validOptions,
          cwd: null as unknown as string,
        }),
      ).rejects.toThrow('cwd must be a non-empty string');
    });
  });

  describe('include validation', () => {
    it('should throw error when include is not an array', async () => {
      await expect(
        compile({
          ...validOptions,
          include: 'not-an-array' as unknown as string[],
        }),
      ).rejects.toThrow('include must be an array');
    });

    it('should throw error when include array is empty', async () => {
      await expect(
        compile({
          ...validOptions,
          include: [],
        }),
      ).rejects.toThrow('include array cannot be empty');
    });
  });

  describe('exclude validation', () => {
    it('should throw error when exclude is not an array', async () => {
      await expect(
        compile({
          ...validOptions,
          exclude: 'not-an-array' as unknown as string[],
        }),
      ).rejects.toThrow('exclude must be an array');
    });

    it('should accept empty exclude array', async () => {
      // This should not throw - empty exclude is valid
      const result = await compile({
        ...validOptions,
        exclude: [],
      });

      expect(result).toBeDefined();
      expect(result?.css).toBeDefined();
      expect(result?.js).toBeDefined();
    });
  });

  describe('valid options', () => {
    it('should accept valid options without throwing', async () => {
      const result = await compile(validOptions);

      expect(result).toBeDefined();
      expect(result?.css).toBeDefined();
      expect(result?.js).toBeDefined();
      expect(result?.dependencies).toBeInstanceOf(Array);
    });
  });
});

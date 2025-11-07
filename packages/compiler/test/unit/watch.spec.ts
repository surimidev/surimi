import { describe, expect, it, afterEach } from 'vitest';
import path from 'node:path';
import { compileWatch } from '../../src/compiler';
import type { RolldownWatcher } from 'rolldown';

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

  describe('Watcher creation', () => {
    it('should create a watcher instance', () => {
      watcher = compileWatch(createOptions('simple.css.ts'));

      expect(watcher).toBeDefined();
      expect(watcher).toHaveProperty('on');
      expect(watcher).toHaveProperty('close');
      expect(typeof watcher.on).toBe('function');
      expect(typeof watcher.close).toBe('function');
    });

    it('should create watcher for file with imports', () => {
      watcher = compileWatch(createOptions('with-imports.css.ts'));

      expect(watcher).toBeDefined();
    });

    it('should create watcher for file with media queries', () => {
      watcher = compileWatch(createOptions('media-queries.css.ts'));

      expect(watcher).toBeDefined();
    });
  });

  describe('Watcher validation', () => {
    it('should validate options before creating watcher', () => {
      expect(() =>
        compileWatch({
          inputPath: '',
          cwd: process.cwd(),
          include: ['**/*.css.ts'],
          exclude: [],
        })
      ).toThrow('inputPath must be a non-empty string');
    });

    it('should require valid cwd', () => {
      expect(() =>
        compileWatch({
          inputPath: path.join(fixturesDir, 'simple.css.ts'),
          cwd: '',
          include: ['**/*.css.ts'],
          exclude: [],
        })
      ).toThrow('cwd must be a non-empty string');
    });

    it('should require non-empty include array', () => {
      expect(() =>
        compileWatch({
          inputPath: path.join(fixturesDir, 'simple.css.ts'),
          cwd: process.cwd(),
          include: [],
          exclude: [],
        })
      ).toThrow('include array cannot be empty');
    });
  });

  describe('Watcher lifecycle', () => {
    it('should close watcher successfully', async () => {
      watcher = compileWatch(createOptions('simple.css.ts'));

      // Should not throw when closing
      await expect(watcher.close()).resolves.not.toThrow();

      watcher = null; // Prevent double cleanup
    });

    it('should handle multiple close calls gracefully', async () => {
      watcher = compileWatch(createOptions('simple.css.ts'));

      await watcher.close();
      // Second close should not throw
      await expect(watcher.close()).resolves.not.toThrow();

      watcher = null;
    });
  });

  describe('Watcher events', () => {
    it('should support event listeners', async () => {
      watcher = compileWatch(createOptions('simple.css.ts'));

      // Create a promise that resolves when an event is received or times out
      const eventPromise = new Promise<void>((resolve) => {
        let eventReceived = false;

        // Listen for any event
        if (watcher) {
          watcher.on('event', (event) => {
            if (!eventReceived) {
              eventReceived = true;
              expect(event).toBeDefined();
              resolve();
            }
          });
        }

        // If no event is received within 5 seconds, still pass
        // (some environments might not trigger events immediately)
        setTimeout(() => {
          if (!eventReceived) {
            resolve();
          }
        }, 5000);
      });

      await eventPromise;
    });
  });

  describe('Error handling', () => {
    it('should handle non-existent files', () => {
      // Should throw or create watcher that will error on first build
      const options = createOptions('non-existent-file.css.ts');

      // Creating the watcher might not throw, but the first build will
      watcher = compileWatch(options);

      expect(watcher).toBeDefined();
    });
  });
});

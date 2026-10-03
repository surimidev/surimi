import { createServer } from 'vite';
import { describe, expect, it, onTestFinished, vi } from 'vitest';

import { SurimiEvaluator } from '../src/runner.js';
import { baseViteConfig, simpleStylesFixture, writeFixture } from './helpers/vite.js';

describe('owned evaluator lifecycle', () => {
  it('closes the owned evaluator when the dev server closes', async () => {
    const fixture = await writeFixture(simpleStylesFixture);
    onTestFinished(fixture.cleanup);

    const closeSpy = vi.spyOn(SurimiEvaluator.prototype, 'close');
    const server = await createServer(
      baseViteConfig(fixture.root, {}, { server: { middlewareMode: true, ws: false } }),
    );

    try {
      // Transforming a surimi file forces the owned evaluator server to spawn.
      const result = await server.transformRequest('/src/styles.css.ts');
      expect(result?.code).toBeTruthy();
      expect(closeSpy).not.toHaveBeenCalled();

      // Vite fires closeBundle on every environment container during shutdown, which must close
      // the owned evaluation server too.
      await server.close();
      expect(closeSpy).toHaveBeenCalled();
    } finally {
      closeSpy.mockRestore();
      await server.close();
    }
  });
});

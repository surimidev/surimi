import { describe, expect, it } from 'vitest';

import { badStylesFixture, buildApp, serveTransform, simpleStylesFixture } from './helpers/vite.js';

describe('error handling', () => {
  it('surfaces build errors from invalid surimi files', async () => {
    await expect(buildApp(badStylesFixture)).rejects.toThrow();
  });

  it('rejects inlineCss during SSR transform', async () => {
    await expect(
      serveTransform(simpleStylesFixture, 'src/styles.css.ts', { inlineCss: true, ssr: true }),
    ).rejects.toThrow(/inlineCss option is not supported during SSR/i);
  });
});

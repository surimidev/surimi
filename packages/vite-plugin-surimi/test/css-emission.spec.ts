import { describe, expect, it, onTestFinished } from 'vitest';

import { VIRTUAL_CSS_SUFFIX } from '../src/constants.js';
import { buildApp, serveTransform, simpleStylesFixture } from './helpers/vite.js';

describe('css emission', () => {
  it('imports the virtual CSS module from the served transform output', async () => {
    const result = await serveTransform(simpleStylesFixture, 'src/styles.css.ts');
    onTestFinished(() => result.cleanup());

    expect(result.transformedCode).toContain(VIRTUAL_CSS_SUFFIX);
    expect(result.transformedCode).toContain('import.meta.hot');
    expect(result.virtualCss).toContain('.container');
    expect(result.virtualCss).toContain('display');
  });

  it('emits a separate CSS asset on build when inlineCss is false', async () => {
    const result = await buildApp(simpleStylesFixture, { inlineCss: false });
    onTestFinished(() => result.cleanup());

    expect(result.cssAssets.some(css => css.includes('.container'))).toBe(true);
    expect(result.jsAssets.some(js => !js.includes('document.createElement'))).toBe(true);
  });

  it('injects CSS at runtime on build when inlineCss is true', async () => {
    const result = await buildApp(simpleStylesFixture, { inlineCss: true });
    onTestFinished(() => result.cleanup());

    expect(result.cssAssets).toHaveLength(0);
    expect(result.jsAssets.some(js => js.includes('document.createElement'))).toBe(true);
    expect(result.jsAssets.some(js => js.includes('.container'))).toBe(true);
  });

  it('emits CSS via virtual imports on SSR build', async () => {
    const result = await buildApp(simpleStylesFixture, { ssr: true });
    onTestFinished(() => result.cleanup());

    const hasCssOutput =
      result.cssAssets.length > 0 ||
      result.jsAssets.some(js => js.includes(VIRTUAL_CSS_SUFFIX) || js.includes('.container'));
    expect(hasCssOutput).toBe(true);
  });
});

import path from 'node:path';
import { describe, expect, it, onTestFinished } from 'vitest';

import { buildApp, evaluateViaPlugin } from './helpers/vite.js';

describe('module resolution', () => {
  it('imports a plain .css file into a .css.ts file', async () => {
    const result = await buildApp({
      'src/base.css': `.external { color: navy; }`,
      'src/styles.css.ts': `import { select } from 'surimi';
import './base.css';

select('.local').style({ color: 'red' });
`,
      'src/main.ts': `import './styles.css.ts';
export {};
`,
    });
    onTestFinished(() => result.cleanup());

    const allCss = result.cssAssets.join('\n');
    expect(allCss).toContain('.local');
    expect(allCss).toContain('.external');
    expect(allCss).toContain('navy');
  });

  it('imports const values from a .ts file into generated CSS', async () => {
    const result = await evaluateViaPlugin(
      {
        'src/tokens.ts': `export const accent = '#abc123';`,
        'src/styles.css.ts': `import { select } from 'surimi';
import { accent } from './tokens';

select('.tokenized').style({ color: accent });
`,
      },
      'src/styles.css.ts',
    );
    onTestFinished(() => result.cleanup());

    expect(result.css).toContain('#abc123');
    expect(result.css).toContain('.tokenized');
  });

  it('imports const values from a .tsx file into generated CSS', async () => {
    const result = await evaluateViaPlugin(
      {
        'src/theme.tsx': `export const brand = '#654321';`,
        'src/styles.css.ts': `import { select } from 'surimi';
import { brand } from './theme.tsx';

select('.brand').style({ backgroundColor: brand });
`,
      },
      'src/styles.css.ts',
    );
    onTestFinished(() => result.cleanup());

    expect(result.css).toContain('#654321');
    expect(result.css).toContain('.brand');
  });

  it('resolves path aliases into .css.ts files', async () => {
    const result = await evaluateViaPlugin(
      {
        'src/shared/tokens.ts': `export const spacing = '24px';`,
        'src/styles.css.ts': `import { select } from 'surimi';
import { spacing } from '@shared/tokens';

select('.spaced').style({ padding: spacing });
`,
      },
      'src/styles.css.ts',
      {},
      root => ({
        resolve: {
          alias: [{ find: /^@shared\//, replacement: `${path.join(root, 'src/shared')}/` }],
        },
      }),
    );
    onTestFinished(() => result.cleanup());

    expect(result.css).toContain('24px');
  });

  it('supports ?raw imports inside .css.ts', async () => {
    const result = await evaluateViaPlugin(
      {
        'src/snippet.css': `.raw { opacity: 0.5; }`,
        'src/styles.css.ts': `import { select } from 'surimi';
import rawCss from './snippet.css?raw';

select('.probe').style({ color: 'green' });
export const importedRaw = rawCss;
`,
      },
      'src/styles.css.ts',
    );
    onTestFinished(() => result.cleanup());

    expect(result.css).toContain('.probe');
    expect(result.js).toContain('.raw');
    // A ?raw import is a value import: its content is baked into js, never re-emitted as CSS.
    expect(result.sideEffectDependencies ?? []).toHaveLength(0);
  });

  it('does not emit a ?raw css import as bundled CSS', async () => {
    const result = await buildApp({
      'src/snippet.css': `.raw-leak { opacity: 0.5; }`,
      'src/styles.css.ts': `import { select } from 'surimi';
import rawCss from './snippet.css?raw';

select('.probe').style({ color: 'green' });
export const importedRaw = rawCss;
`,
      'src/main.ts': `import { importedRaw } from './styles.css.ts';
console.log(importedRaw);
export {};
`,
    });
    onTestFinished(() => result.cleanup());

    const allCss = result.cssAssets.join('\n');
    expect(allCss).toContain('.probe');
    // The ?raw content must NOT leak into a CSS asset (it's a value, captured in JS).
    expect(allCss).not.toContain('.raw-leak');
    expect(result.jsAssets.join('\n')).toContain('.raw-leak');
  });

  it('resolves `import { x } from "./theme.css"` to the authored theme.css.ts', async () => {
    const result = await buildApp({
      'src/theme.css.ts': `import { select } from 'surimi';
export const accent = '#0ff';
select('.themed').style({ color: accent });
`,
      'src/styles.css.ts': `import { select } from 'surimi';
import { accent } from './theme.css';
select('.consumer').style({ borderColor: accent });
`,
      'src/main.ts': `import './styles.css.ts';
export {};
`,
    });
    onTestFinished(() => result.cleanup());

    const allCss = result.cssAssets.join('\n');
    expect(allCss).toContain('.consumer');
    expect(allCss).toContain('#0ff');
    expect(allCss).toContain('.themed');
  });

  it('supports transitive .css.ts -> .ts -> .css imports', async () => {
    const result = await buildApp({
      'src/layers/base.css': `.deep { font-weight: bold; }`,
      'src/layers/index.ts': `import '../layers/base.css';
export const weight = '700';`,
      'src/styles.css.ts': `import { select } from 'surimi';
import { weight } from './layers/index';

select('.deep-style').style({ fontWeight: weight });
`,
      'src/main.ts': `import './styles.css.ts';
export {};
`,
    });
    onTestFinished(() => result.cleanup());

    const allCss = result.cssAssets.join('\n');
    expect(allCss).toContain('.deep-style');
    expect(allCss).toContain('700');
    expect(allCss).toContain('.deep');
  });

  it('deduplicates dependency paths', async () => {
    const result = await evaluateViaPlugin(
      {
        'src/shared.css.ts': `import { select } from 'surimi';
select('.shared').style({ color: 'blue' });`,
        'src/styles.css.ts': `import { select } from 'surimi';
import './shared.css.ts';
import './shared.css.ts';

select('.main').style({ color: 'red' });
`,
      },
      'src/styles.css.ts',
    );
    onTestFinished(() => result.cleanup());

    const unique = new Set(result.dependencies);
    expect(unique.size).toBe(result.dependencies.length);
  });
});

import path from 'node:path';
import { describe, expect, it, onTestFinished } from 'vitest';
import { normalizePath } from 'vite';

import { mergeTestResolve, writeFixture } from './helpers/vite.js';
import { evaluateSurimiFile, SurimiEvaluator } from '../src/runner.js';

async function evaluateVueBlock(
  files: Record<string, string>,
  blockSource: string,
  vuePath = 'src/App.vue',
  blockIndex = 0,
) {
  const fixture = await writeFixture({
    ...files,
    [vuePath]: '<template><div /></template>',
  });
  const absoluteVuePath = normalizePath(path.join(fixture.root, vuePath));
  const virtualInput = normalizePath(`${absoluteVuePath}.__surimi_${blockIndex}.css.ts`);

  const result = await evaluateSurimiFile(virtualInput, {
    root: fixture.root,
    include: ['**/*.css.{ts,js}'],
    exclude: ['node_modules/**', '**/*.d.ts'],
    resolve: mergeTestResolve(),
    source: blockSource,
  });

  return { ...result, root: fixture.root, virtualInput, cleanup: fixture.cleanup };
}

describe('Vue surimi blocks', () => {
  it('evaluates inline block source via the stable Vue virtual id glob', async () => {
    const result = await evaluateVueBlock(
      {},
      `import { select } from 'surimi';

select('.vue-btn').style({ color: 'white' });
export const btnClass = 'vue-btn';
`,
    );
    onTestFinished(() => result.cleanup());

    expect(result.css).toContain('.vue-btn');
    expect(result.css).toContain('white');
    expect(result.js).toContain('btnClass');
  });

  it('resolves .ts tokens and plain .css from inline block source', async () => {
    const result = await evaluateVueBlock(
      {
        'src/tokens.ts': `export const accent = '#fedcba';`,
        'src/base.css': `.imported { opacity: 0.8; }`,
      },
      `import { select } from 'surimi';
import { accent } from './tokens';
import './base.css';

select('.themed').style({ color: accent });
`,
    );
    onTestFinished(() => result.cleanup());

    expect(result.css).toContain('#fedcba');
    expect(result.css).toContain('.themed');
  });

  it('reuses one owned evaluator server for multiple Vue virtual sources', async () => {
    const fixture = await writeFixture({ 'src/App.vue': '<template><div /></template>' });
    const absoluteVuePath = normalizePath(path.join(fixture.root, 'src/App.vue'));
    const virtual0 = normalizePath(`${absoluteVuePath}.__surimi_0.css.ts`);
    const virtual1 = normalizePath(`${absoluteVuePath}.__surimi_1.css.ts`);

    const evaluator = new SurimiEvaluator({
      root: fixture.root,
      include: ['**/*.css.{ts,js}'],
      exclude: ['node_modules/**', '**/*.d.ts'],
      resolve: mergeTestResolve(),
    });

    try {
      const block0 = await evaluator.evaluate(virtual0, {
        source: `import { select } from 'surimi';
select('.block-a').style({ color: 'red' });`,
      });
      const block1 = await evaluator.evaluate(virtual1, {
        source: `import { select } from 'surimi';
select('.block-b').style({ color: 'blue' });`,
      });

      expect(block0.css).toContain('.block-a');
      expect(block1.css).toContain('.block-b');
    } finally {
      await evaluator.close();
      await fixture.cleanup();
    }
  });
});

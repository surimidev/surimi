import { describe, expect, it, onTestFinished } from 'vitest';

import { evaluateViaPlugin } from './helpers/vite.js';

describe('module exports', () => {
  it('exports class name strings to .ts consumers', async () => {
    const result = await evaluateViaPlugin(
      {
        'src/styles.css.ts': `import { select } from 'surimi';

select('.btn').style({ color: 'white' });
export const btnClass = 'btn';
`,
      },
      'src/styles.css.ts',
    );
    onTestFinished(() => result.cleanup());

    expect(result.js).toContain('export const btnClass = "btn"');
  });

  it('preserves serializable exports and drops non-serializable ones', async () => {
    const result = await evaluateViaPlugin(
      {
        'src/styles.css.ts': `import { select } from 'surimi';

select('.x').style({ color: 'red' });
export const className = 'x';
export function notSerialized() {}
`,
      },
      'src/styles.css.ts',
    );
    onTestFinished(() => result.cleanup());

    expect(result.js).toContain('export const className = "x"');
    expect(result.js).not.toContain('notSerialized');
  });

  it('handles empty .css.ts files', async () => {
    const result = await evaluateViaPlugin(
      {
        'src/empty.css.ts': `// empty`,
      },
      'src/empty.css.ts',
    );
    onTestFinished(() => result.cleanup());

    expect(result.css).toBe('');
    expect(result.js).toBe('');
  });

  it('handles imports-only .css.ts files without styles', async () => {
    const result = await evaluateViaPlugin(
      {
        'src/base.css': `.only-import { color: black; }`,
        'src/styles.css.ts': `import './base.css';
export const marker = 'imports-only';
`,
      },
      'src/styles.css.ts',
    );
    onTestFinished(() => result.cleanup());

    expect(result.css).toBe('');
    expect(result.js).toContain('marker');
  });
});

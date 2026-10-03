import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';
import { describe, expect, it, onTestFinished, vi } from 'vitest';

import { VIRTUAL_CSS_SUFFIX } from '../src/constants.js';
import { normalizeModuleId } from '../src/normalize-module-id.js';
import { baseViteConfig, writeFixture } from './helpers/vite.js';

describe('HMR dependency invalidation', () => {
  it('recompiles dependent surimi files when a depended-on file changes', async () => {
    const fixture = await writeFixture({
      'src/tokens.ts': `export const accent = '#00ff00';`,
      'src/styles.css.ts': `import { select } from 'surimi';
import { accent } from './tokens';

select('.accented').style({ color: accent });
`,
      'src/main.ts': `import './styles.css.ts';
export {};
`,
    });
    onTestFinished(fixture.cleanup);

    const server = await createServer(
      baseViteConfig(fixture.root, {}, { server: { middlewareMode: true, ws: false } }),
    );
    onTestFinished(() => server.close());

    const main = await server.transformRequest('/src/main.ts');
    expect(main?.code).toBeTruthy();

    const virtualCssId = `${normalizeModuleId(path.join(fixture.root, 'src/styles.css.ts'), fixture.root)}${VIRTUAL_CSS_SUFFIX}`;
    const loadVirtualCss = async (): Promise<string> => {
      const result = await server.pluginContainer.load(virtualCssId);
      return typeof result === 'string' ? result : result && 'code' in result ? result.code : '';
    };

    expect(await loadVirtualCss()).toContain('#00ff00');

    await writeFile(path.join(fixture.root, 'src/tokens.ts'), `export const accent = '#ff0000';\n`);

    // The file watcher fires hotUpdate, which must invalidate the compilation cache of every
    // dependent .css.ts file so the virtual CSS regenerates with the new token.
    await vi.waitFor(
      async () => {
        expect(await loadVirtualCss()).toContain('#ff0000');
      },
      { timeout: 15_000, interval: 150 },
    );
  }, 30_000);
});

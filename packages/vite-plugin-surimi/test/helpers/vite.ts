import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CompileResult } from '@surimi/compiler';
import type { InlineConfig, Rollup } from 'vite';
import { build, createServer, normalizePath } from 'vite';
import { VIRTUAL_CSS_SUFFIX } from '../../src/constants.js';
import surimiPlugin from '../../src/index.js';
import { normalizeModuleId } from '../../src/normalize-module-id.js';
import { evaluateSurimiFile } from '../../src/runner.js';
import type { SurimiOptions } from '../../src/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../..');
const surimiPackageRoot = path.resolve(repoRoot, 'packages/surimi');

export function resolveSurimiAlias(): string {
  return path.join(surimiPackageRoot, 'dist/index.js');
}

export function testResolveConfig(): InlineConfig['resolve'] {
  return {
    alias: {
      surimi: resolveSurimiAlias(),
    },
  };
}

/** Merge test surimi alias with extra resolve (evaluateViaPlugin configure callback). */
export function mergeTestResolve(extra?: InlineConfig['resolve']): InlineConfig['resolve'] {
  const surimiEntry = { find: /^surimi$/, replacement: resolveSurimiAlias() };
  const extraAlias = extra?.alias;

  if (Array.isArray(extraAlias)) {
    return { ...extra, alias: [surimiEntry, ...extraAlias] };
  }

  return {
    ...extra,
    alias: {
      surimi: resolveSurimiAlias(),
      ...(typeof extraAlias === 'object' && extraAlias != null && !Array.isArray(extraAlias) ? extraAlias : {}),
    },
  };
}

export interface FixtureApp {
  root: string;
  cleanup: () => Promise<void>;
}

export interface BuildAppResult {
  root: string;
  output: Rollup.RollupOutput;
  jsAssets: string[];
  cssAssets: string[];
  cleanup: () => Promise<void>;
}

export interface ServeTransformResult {
  root: string;
  transformedCode: string;
  virtualCss: string;
  cleanup: () => Promise<void>;
}

export interface PluginEvaluateResult extends CompileResult {
  root: string;
  cleanup: () => Promise<void>;
}

export async function writeFixture(files: Record<string, string>): Promise<FixtureApp> {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'surimi-vite-test-'));
  const root = await realpath(tempRoot);
  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(root, relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content, 'utf8');
  }
  return {
    root,
    cleanup: async () => {
      await rm(root, { recursive: true, force: true });
    },
  };
}

export function baseViteConfig(root: string, options: SurimiOptions = {}, extra: InlineConfig = {}): InlineConfig {
  return {
    configFile: false,
    root,
    logLevel: 'silent',
    optimizeDeps: {
      noDiscovery: true,
    },
    resolve: {
      ...testResolveConfig(),
      ...(extra.resolve ?? {}),
    },
    plugins: [surimiPlugin(options)],
    ...extra,
  };
}

export async function buildApp(
  files: Record<string, string>,
  options: SurimiOptions & { entry?: string; ssr?: boolean } = {},
): Promise<BuildAppResult> {
  const { entry = 'src/main.ts', ssr = false, ...surimiOptions } = options;
  const fixture = await writeFixture(files);
  const input = normalizePath(path.join(fixture.root, entry));

  const output = (await build({
    ...baseViteConfig(fixture.root, surimiOptions, {
      build: {
        write: false,
        ssr,
        ssrEmitAssets: ssr,
        rollupOptions: { input },
      },
    }),
  })) as Rollup.RollupOutput;

  const jsAssets = output.output
    .filter((chunk): chunk is Rollup.OutputChunk => chunk.type === 'chunk')
    .map(chunk => chunk.code);
  const cssAssets = output.output
    .filter((chunk): chunk is Rollup.OutputAsset => chunk.type === 'asset' && chunk.fileName.endsWith('.css'))
    .map(chunk => (typeof chunk.source === 'string' ? chunk.source : ''))
    .filter(Boolean);

  return {
    root: fixture.root,
    output,
    jsAssets,
    cssAssets,
    cleanup: fixture.cleanup,
  };
}

export async function serveTransform(
  files: Record<string, string>,
  moduleId: string,
  options: SurimiOptions & { ssr?: boolean } = {},
): Promise<ServeTransformResult> {
  const { ssr = false, ...surimiOptions } = options;
  const fixture = await writeFixture(files);
  const requestId = `/${moduleId.split(path.sep).join('/')}`;

  const server = await createServer(
    baseViteConfig(fixture.root, surimiOptions, {
      server: { middlewareMode: true, ws: false },
    }),
  );

  try {
    await server.pluginContainer.buildStart({});
    const transformResult = await server.transformRequest(requestId, { ssr });

    if (!transformResult?.code) {
      throw new Error(`transform returned no code for ${requestId}`);
    }

    const absoluteId = normalizeModuleId(path.join(fixture.root, moduleId), fixture.root);
    const virtualCssId = `${absoluteId}${VIRTUAL_CSS_SUFFIX}`;
    const cssLoadResult = await server.pluginContainer.load(virtualCssId);
    const virtualCss =
      typeof cssLoadResult === 'string'
        ? cssLoadResult
        : cssLoadResult && 'code' in cssLoadResult
          ? cssLoadResult.code
          : '';

    return {
      root: fixture.root,
      transformedCode: transformResult.code,
      virtualCss,
      cleanup: async () => {
        await server.close();
        await fixture.cleanup();
      },
    };
  } catch (error) {
    await server.close();
    await fixture.cleanup();
    throw error;
  }
}

/** Evaluate an on-disk .css.ts path (used for compiler fixture parity). */
export async function evaluateFromPath(inputPath: string, options: SurimiOptions = {}): Promise<CompileResult> {
  const absoluteId = normalizePath(inputPath);
  const root = path.dirname(absoluteId);

  return evaluateSurimiFile(absoluteId, {
    root,
    include: options.include ?? ['**/*.css.{ts,js}'],
    exclude: options.exclude ?? ['node_modules/**', '**/*.d.ts'],
    resolve: testResolveConfig(),
  });
}

/** Evaluate a .css.ts file through the plugin's surimi evaluator (runner after migration). */
export async function evaluateViaPlugin(
  files: Record<string, string>,
  moduleId: string,
  options: SurimiOptions = {},
  configure?: (root: string) => { resolve?: InlineConfig['resolve'] },
): Promise<PluginEvaluateResult & { cleanup: () => Promise<void> }> {
  const fixture = await writeFixture(files);
  const absoluteId = normalizePath(path.join(fixture.root, moduleId));
  const extra = configure?.(fixture.root) ?? {};

  const result = await evaluateSurimiFile(absoluteId, {
    root: fixture.root,
    include: options.include ?? ['**/*.css.{ts,js}'],
    exclude: options.exclude ?? ['node_modules/**', '**/*.d.ts'],
    resolve: mergeTestResolve(extra.resolve),
  });

  return {
    ...result,
    root: fixture.root,
    cleanup: fixture.cleanup,
  };
}

export const simpleStylesFixture = {
  'src/styles.css.ts': `import { select } from 'surimi';

select('.container').style({
  display: 'flex',
  padding: '20px',
});

export const buttonClass = 'btn-primary';
`,
  'src/main.ts': `import './styles.css.ts';
export {};
`,
};

export const badStylesFixture = {
  'src/styles.css.ts': `import { select } from 'surimi';
throw new Error('surimi compile error');
select('.bad').style({ color: 'red' });
`,
  'src/main.ts': `import './styles.css.ts';
export {};
`,
};

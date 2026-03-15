import path from 'node:path';
import type { EnvironmentModuleGraph, EnvironmentModuleNode, Plugin } from 'vite';
import { createFilter, normalizePath } from 'vite';

import { compile, type CompileResult } from '@surimi/compiler';

import { VIRTUAL_CSS_SUFFIX } from './constants.js';
import type { SharedPluginContext } from './types.js';
import { addWatchFilesForDeps, createSourceMap, injectCssChunk } from './utils.js';

/**
 * Matches Vue SFC request URLs for `<surimi>` blocks (with or without lang).
 * @see https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-transforming-custom-blocks
 */
export const VUE_SURIMI_BLOCK_RE = /[?&]vue&type=surimi/;

/** Cache key shape for Vue surimi blocks; used for module graph lookup. */
export const VUE_SURIMI_VIRTUAL_PATH_RE = /^(.+\.vue)\.__surimi_(\d+)\.css\.ts$/;

/**
 * Resolve the real Vite module id for a Vue surimi block from the module graph.
 * Vite can register the block as ?vue&type=surimi&index=N&lang.ts, &lang.js, or no lang;
 * we match by file and query fragment so invalidation works regardless.
 */
export function resolveVueSurimiModuleId(
  vueFilePath: string,
  index: string,
  moduleGraph: EnvironmentModuleGraph,
): string | null {
  const normalizedVue = normalizePath(vueFilePath);
  const fragment = `type=surimi&index=${index}`;
  const mods = moduleGraph.getModulesByFile(normalizedVue);
  if (!mods) return null;
  for (const mod of mods) {
    const id = mod.id ?? mod.url;
    if (id.includes(fragment)) return id;
  }
  return null;
}

/**
 * If fileId is a Vue surimi virtual path, return the module(s) to invalidate; otherwise null.
 * Used by the core plugin for HMR so Vue-specific logic stays in vue.ts.
 */
export function collectVueSurimiModulesForInvalidation(
  fileId: string,
  moduleGraph: EnvironmentModuleGraph,
): EnvironmentModuleNode[] | null {
  const vueMatch = VUE_SURIMI_VIRTUAL_PATH_RE.exec(fileId);
  if (!vueMatch) return null;

  const modules: EnvironmentModuleNode[] = [];
  const addModule = (id: string) => {
    const module = moduleGraph.getModuleById(id);
    if (module) modules.push(module);
  };

  const vueFilePath = vueMatch[1] ?? '';
  const idx = vueMatch[2] ?? '0';
  const resolved = resolveVueSurimiModuleId(vueFilePath, idx, moduleGraph);
  addModule(resolved ?? `${vueFilePath}?vue&type=surimi&index=${idx}&lang.ts`);
  return modules;
}

/**
 * Handle hotUpdate when the changed file is a Vue SFC with surimi blocks.
 * Returns the modules to return from hotUpdate, or undefined if not Vue-surimi-related.
 */
export async function handleVueSurimiHotUpdate(
  ctx: { file: string; modules: Array<{ url: string }>; timestamp: number; type: string },
  context: {
    compilationCache: Map<string, unknown>;
    environment: { moduleGraph: EnvironmentModuleGraph; config: { consumer?: string } };
    transformRequest: (url: string) => Promise<unknown>;
  },
): Promise<EnvironmentModuleNode[] | undefined> {
  if (ctx.type !== 'update') return undefined;

  const normalizedFile = normalizePath(ctx.file);
  const surimiModules = ctx.modules.filter(m => VUE_SURIMI_BLOCK_RE.test(m.url));
  if (surimiModules.length === 0) return undefined;

  for (const key of [...context.compilationCache.keys()]) {
    if (key !== normalizedFile && key.startsWith(normalizedFile)) {
      context.compilationCache.delete(key);
    }
  }

  const { moduleGraph } = context.environment;
  const allModsForFile = moduleGraph.getModulesByFile(normalizedFile);
  if (allModsForFile) {
    const mainMod = [...allModsForFile].find(m => !m.url.includes('?'));
    if (mainMod) {
      moduleGraph.invalidateModule(mainMod, new Set(), ctx.timestamp, true);
      await context.transformRequest(mainMod.url);
    }
  }

  const isSSR = context.environment.config.consumer === 'server';
  if (isSSR) {
    const nonSurimi = ctx.modules.filter(m => !VUE_SURIMI_BLOCK_RE.test(m.url));
    return nonSurimi.length > 0 ? (nonSurimi as EnvironmentModuleNode[]) : [];
  }
  return undefined;
}

/**
 * Handles Vue SFC `<surimi>` blocks: compiles block content and injects CSS (or virtual CSS imports).
 * Called by the core plugin with shared context; no-op if no Vue surimi blocks are used.
 */
export function createVuePlugin(ctx: SharedPluginContext): Plugin {
  const tsFileFilter = createFilter(ctx.include, ctx.exclude);
  const filesWatched = new Set<string>();

  return {
    name: 'vite-plugin-surimi:vue',
    transform: {
      filter: {
        id: {
          include: [VUE_SURIMI_BLOCK_RE],
        },
      },
      async handler(code, id, options) {
        const [filePath] = id.split('?');
        if (!filePath) return;

        try {
          const indexMatch = /[?&]index=(\d+)/.exec(id);
          const blockIndex = indexMatch?.[1] ?? '0';

          const virtualInput = normalizePath(`${filePath}.__surimi_${blockIndex}.css.ts`);

          const compileResult = await compile({
            input: virtualInput,
            source: code,
            cwd: ctx.resolvedConfig?.root ?? process.cwd(),
            include: ctx.include,
            exclude: ctx.exclude,
          });

          if (!compileResult) return;

          const normalizer = ctx.normalizeDependencyId;
          const resultToCache: CompileResult = normalizer
            ? {
                ...compileResult,
                dependencies: compileResult.dependencies.map((dep: string): string => normalizer(dep, virtualInput)),
              }
            : compileResult;
          ctx.compilationCache.set(virtualInput, resultToCache);

          if (ctx.isDev && !options?.ssr) {
            const addWatch = this.addWatchFile.bind(this);
            addWatchFilesForDeps(resultToCache.dependencies, filesWatched, addWatch, (p: string) => path.isAbsolute(p));
          }

          const styleDependencies = resultToCache.dependencies.filter(
            (dep: string) => dep !== virtualInput && tsFileFilter(dep),
          );
          const cssImportLines = styleDependencies.map((dep: string) => `import "${dep}${VIRTUAL_CSS_SUFFIX}";`);

          if (options?.ssr) {
            let ssrCode = compileResult.js;
            if (cssImportLines.length > 0) ssrCode += `\n${cssImportLines.join('\n')}`;
            ssrCode += `\nimport "${virtualInput}${VIRTUAL_CSS_SUFFIX}";`;
            ssrCode += `\nexport default () => {};`;
            const lineCount = (ssrCode.match(/\n/g)?.length ?? 0) + 1;
            return {
              code: ssrCode,
              map: createSourceMap(path.basename(id), path.basename(virtualInput), lineCount),
            };
          }

          let jsCode: string;
          const selfCssImport = `import "${virtualInput}${VIRTUAL_CSS_SUFFIX}";`;
          const dependencyImports = cssImportLines.length > 0 ? `\n${cssImportLines.join('\n')}` : '';
          if (ctx.isDev || ctx.inlineCss) {
            jsCode = `${compileResult.js}${dependencyImports}\n${injectCssChunk(compileResult.css, virtualInput, !!ctx.isDev)}`;
          } else {
            jsCode = `${compileResult.js}${dependencyImports}\n${selfCssImport}`;
          }

          if (ctx.isDev) {
            jsCode += `\nif (import.meta.hot) { import.meta.hot.accept(); }`;
          }

          jsCode += `\nexport default () => {};`;

          const lineCount = (jsCode.match(/\n/g)?.length ?? 0) + 1;
          return {
            code: jsCode,
            map: createSourceMap(path.basename(id), path.basename(virtualInput), lineCount),
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.error(`Failed to compile Surimi block in ${id}: ${message}`);
        }
      },
    },
  };
}

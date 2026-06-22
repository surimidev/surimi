import path from 'node:path';
import type { CompileResult } from '@surimi/compiler';
import type { EnvironmentModuleGraph, EnvironmentModuleNode, Plugin } from 'vite';
import { createFilter } from 'vite';

import { VIRTUAL_CSS_REGEX, VIRTUAL_CSS_SUFFIX, VIRTUAL_SURIMI_PATH_REGEX } from './constants.js';
import {
  fromVirtualCssId,
  normalizeModuleId,
  toAbsoluteModuleId,
  toImportPath,
  toVirtualCssId,
  toVirtualCssImportPath,
} from './normalize-module-id.js';
import { SurimiEvaluator } from './runner.js';
import type { SharedPluginContext, SurimiOptions } from './types.js';
import { addWatchFilesForDeps, createSourceMap, injectCssChunk } from './utils.js';
import {
  collectVueSurimiModulesForInvalidation,
  createVuePlugin,
  handleVueSurimiHotUpdate,
  VUE_SURIMI_VIRTUAL_PATH_RE,
} from './vue.js';

/**
 * Vite plugin for Surimi CSS-in-TS: compiles `.css.ts` / `.css.js` and Vue `<surimi>` blocks.
 * Returns [corePlugin, vuePlugin]. Options: {@link SurimiOptions}.
 */
export default function surimiPlugin(options: SurimiOptions = {}): Plugin[] {
  const { include = ['**/*.css.{ts,js}'], exclude = ['node_modules/**', '**/*.d.ts'], inlineCss = false } = options;
  const tsFileFilter = createFilter(include, exclude);

  const ctx: SharedPluginContext = {
    compilationCache: new Map<string, CompileResult>(),
    include,
    exclude,
    inlineCss,
    resolvedConfig: undefined,
    isDev: undefined,
    evaluator: undefined,
  };

  const filesWatched = new Set<string>();

  const normalizeDependencyId = (dependencyId: string, ownerId: string): string => {
    const cleanId = dependencyId.split('?')[0] ?? dependencyId;

    if (cleanId.startsWith('\0')) return cleanId;
    if (path.isAbsolute(cleanId)) {
      return normalizeModuleId(cleanId, ctx.resolvedConfig?.root);
    }
    if (ctx.resolvedConfig) {
      return toAbsoluteModuleId(cleanId, ctx.resolvedConfig.root);
    }

    return normalizeModuleId(path.resolve(path.dirname(ownerId), cleanId));
  };

  ctx.normalizeDependencyId = normalizeDependencyId;

  const ensureEvaluator = (): SurimiEvaluator => {
    if (!ctx.resolvedConfig) {
      throw new Error('Surimi evaluator accessed before config was resolved');
    }

    if (!ctx.evaluator) {
      ctx.evaluator = new SurimiEvaluator({
        root: ctx.resolvedConfig.root,
        include,
        exclude,
        resolvedConfig: ctx.resolvedConfig,
        userPlugins: ctx.resolvedConfig.plugins.flat(),
      });
    }

    return ctx.evaluator;
  };

  const getCompilationResult = async (
    id: string,
    options: { source?: string } = {},
  ): Promise<CompileResult> => {
    const normalizedId = normalizeModuleId(id, ctx.resolvedConfig?.root);

    if (!ctx.compilationCache.has(normalizedId)) {
      const evaluator = ensureEvaluator();
      const compileResult = await evaluator.evaluate(normalizedId, options);

      const normalizedResult: CompileResult = {
        ...compileResult,
        dependencies: compileResult.dependencies.map((dependencyId: string) =>
          normalizeDependencyId(dependencyId, normalizedId),
        ),
        ...(compileResult.sideEffectDependencies
          ? {
              sideEffectDependencies: compileResult.sideEffectDependencies.map((dependencyId: string) =>
                normalizeDependencyId(dependencyId, normalizedId),
              ),
            }
          : {}),
      };

      ctx.compilationCache.set(normalizedId, normalizedResult);
    }

    const cacheEntry = ctx.compilationCache.get(normalizedId);
    if (!cacheEntry) throw new Error('Unexpected missing cache entry');
    return cacheEntry;
  };

  ctx.getCompilationResult = getCompilationResult;

  const collectDependentModules = (
    changedFile: string,
    moduleGraph: EnvironmentModuleGraph,
  ): EnvironmentModuleNode[] => {
    const modules: EnvironmentModuleNode[] = [];
    const normalizedChangedFile = normalizeModuleId(changedFile, ctx.resolvedConfig?.root);

    for (const [cachedFile] of ctx.compilationCache) {
      const isRelevant = tsFileFilter(cachedFile) || VUE_SURIMI_VIRTUAL_PATH_RE.test(cachedFile);
      if (!isRelevant) continue;

      const cacheEntry = ctx.compilationCache.get(cachedFile);
      if (cacheEntry?.dependencies.includes(normalizedChangedFile)) {
        ctx.compilationCache.delete(cachedFile);
        ctx.evaluator?.invalidate(cachedFile);
        modules.push(...collectModulesForInvalidation(cachedFile, moduleGraph, inlineCss));
      }
    }

    return modules;
  };

  const generateJsWithHmr = (
    js: string,
    css: string,
    id: string,
    styleDependencies: string[],
    sideEffectDependencies: string[],
  ): string => {
    const root = ctx.resolvedConfig?.root;
    const sideEffectImports = sideEffectDependencies.map(
      dependencyId => `import "${toImportPath(dependencyId, id, root)}";`,
    );

    let jsCode: string;

    if (inlineCss) {
      const inliningSnippet = injectCssChunk(css, id, ctx.isDev ?? false);
      jsCode = `${js}\n${Array.from(new Set(sideEffectImports)).join('\n')}\n${inliningSnippet}`.trim();
    } else {
      const cssImports = new Set<string>(sideEffectImports);

      for (const dependency of styleDependencies) {
        if (dependency === id) continue;
        cssImports.add(`import "${toVirtualCssImportPath(dependency, id, root)}";`);
      }

      cssImports.add(`import "${toVirtualCssImportPath(id, id, root)}";`);

      jsCode = `${js}\n${Array.from(cssImports).join('\n')}`;
    }

    if (ctx.isDev) {
      jsCode += `\nif (import.meta.hot) { import.meta.hot.accept(); }`;
    }

    return jsCode;
  };

  const corePlugin: Plugin = {
    name: 'vite-plugin-surimi',
    config(config) {
      if (config.build?.ssr) {
        return {
          build: {
            ssrEmitAssets: true,
          },
        };
      }
    },
    configResolved(config) {
      ctx.resolvedConfig = config;
      ctx.isDev = config.command === 'serve';
    },
    buildStart() {
      this.warn(
        'Surimi is still in early development. Please report any issues you encounter at https://github.com/surimidev/surimi\n',
      );
    },
    async buildEnd() {
      await ctx.evaluator?.close();
      ctx.evaluator = undefined;
    },
    async closeBundle() {
      await ctx.evaluator?.close();
      ctx.evaluator = undefined;
    },
    async hotUpdate({ file, modules, timestamp, type }) {
      if (type !== 'update') return;

      const vueResult = await handleVueSurimiHotUpdate(
        { file, modules, timestamp, type },
        {
          compilationCache: ctx.compilationCache as Map<string, unknown>,
          environment: this.environment,
          transformRequest: (url: string) => this.environment.transformRequest(url),
        },
      );
      if (vueResult !== undefined) return vueResult;

      const normalizedFile = normalizeModuleId(file, ctx.resolvedConfig?.root);

      if (tsFileFilter(file)) {
        ctx.compilationCache.delete(normalizedFile);
        ctx.evaluator?.invalidate(normalizedFile);
        const additionalModules = [
          ...collectModulesForInvalidation(normalizedFile, this.environment.moduleGraph, inlineCss),
          ...collectDependentModules(normalizedFile, this.environment.moduleGraph),
        ];
        if (additionalModules.length > 0) {
          return [...modules, ...additionalModules];
        }
      } else {
        ctx.evaluator?.invalidate(normalizedFile);
        const additionalModules = collectDependentModules(normalizedFile, this.environment.moduleGraph);
        if (additionalModules.length > 0) {
          return [...modules, ...additionalModules];
        }
      }
    },
    resolveId: {
      filter: {
        id: {
          include: [VIRTUAL_CSS_REGEX, VIRTUAL_SURIMI_PATH_REGEX],
        },
      },
      handler(source, importer) {
        if (!ctx.resolvedConfig) throw new Error('resolveId called before config was resolved');
        const { root } = ctx.resolvedConfig;

        const [validId, query] = source.split('?');
        const withQuery = (resolved: string) => (query ? `${resolved}?${query}` : resolved);

        // Relative virtual imports (e.g. "./styles.css.ts.surimi.css") resolve against the importer.
        const resolveRelativeToImporter = (relativeId: string): string =>
          normalizeModuleId(path.join(path.dirname(importer?.split('?')[0] ?? importer ?? ''), relativeId), root);

        if (validId?.endsWith(VIRTUAL_CSS_SUFFIX)) {
          const absoluteId =
            importer && !path.isAbsolute(validId) ? resolveRelativeToImporter(validId) : toAbsoluteModuleId(validId, root);
          return withQuery(absoluteId);
        }

        const absoluteId = toAbsoluteModuleId(validId ?? '', root);
        if (VIRTUAL_SURIMI_PATH_REGEX.test(validId ?? '') && ctx.compilationCache.has(absoluteId)) {
          const virtualCssId =
            importer && !path.isAbsolute(validId ?? '')
              ? resolveRelativeToImporter(`${validId}${VIRTUAL_CSS_SUFFIX}`)
              : toVirtualCssId(absoluteId);
          return withQuery(virtualCssId);
        }
        return null;
      },
    },
    load: {
      filter: {
        id: {
          include: [VIRTUAL_CSS_REGEX],
        },
      },
      async handler(id) {
        if (!ctx.resolvedConfig) throw new Error('load handler called before config was resolved');

        const [validId] = id.split('?');
        if (validId?.endsWith(VIRTUAL_CSS_SUFFIX)) {
          const absoluteId = normalizeModuleId(fromVirtualCssId(validId), ctx.resolvedConfig.root);

          let cacheEntry = ctx.compilationCache.get(absoluteId);

          if (!cacheEntry && tsFileFilter(absoluteId)) {
            this.debug(`Regenerating cache for: ${absoluteId}`);
            cacheEntry = await getCompilationResult(absoluteId);
          }

          if (cacheEntry) {
            const cssLineCount = (cacheEntry.css.match(/\n/g)?.length ?? 0) + 1;
            return {
              code: cacheEntry.css,
              map: createSourceMap(path.basename(validId), path.basename(absoluteId), cssLineCount),
            };
          }
          this.error(`Missing build cache entry for virtual CSS file: ${id}`);
        }
        return null;
      },
    },
    transform: {
      filter: {
        id: {
          include,
          exclude,
        },
      },
      async handler(_, id, options) {
        if (options?.ssr && inlineCss) {
          this.error('The inlineCss option is not supported during SSR builds.');
        }

        // Normalize once: the cached `dependencies` are normalized, so comparing them against a
        // raw `id` (e.g. a symlink path under resolve.preserveSymlinks) would break self-exclusion.
        const normalizedId = normalizeModuleId(id, ctx.resolvedConfig?.root);

        try {
          const { css, js, dependencies, sideEffectDependencies } = await getCompilationResult(normalizedId);

          const styleDependencies = dependencies.filter(
            dependencyId => dependencyId !== normalizedId && tsFileFilter(dependencyId),
          );

          for (const dependencyId of styleDependencies) {
            await getCompilationResult(dependencyId);
          }

          const jsCode = generateJsWithHmr(js, css, normalizedId, styleDependencies, sideEffectDependencies ?? []);

          if (ctx.isDev && !options?.ssr) {
            const addWatch = this.addWatchFile.bind(this);
            addWatchFilesForDeps(dependencies, filesWatched, addWatch, (p: string) => path.isAbsolute(p));
          }

          const lineCount = (jsCode.match(/\n/g)?.length ?? 0) + 1;
          return {
            code: jsCode,
            map: createSourceMap(path.basename(normalizedId), path.basename(normalizedId), lineCount),
            moduleSideEffects: 'no-treeshake',
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.error(`Failed to compile Surimi file ${id}: ${message}`);
        }
      },
    },
  };

  return [corePlugin, createVuePlugin(ctx)];
}

function collectModulesForInvalidation(
  fileId: string,
  moduleGraph: EnvironmentModuleGraph,
  inlineCss: boolean,
): EnvironmentModuleNode[] {
  const vueModules = collectVueSurimiModulesForInvalidation(fileId, moduleGraph);
  if (vueModules !== null) return vueModules;

  const modules: EnvironmentModuleNode[] = [];
  const addModule = (id: string) => {
    const module = moduleGraph.getModuleById(id);
    if (module) modules.push(module);
  };

  addModule(fileId);
  if (!inlineCss) {
    addModule(toVirtualCssId(fileId));
  }
  return modules;
}

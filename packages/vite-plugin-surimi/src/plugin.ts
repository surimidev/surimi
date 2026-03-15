import { createHash } from 'node:crypto';
import path from 'node:path';
import type {
  EnvironmentModuleGraph,
  EnvironmentModuleNode,
  Plugin,
  ResolvedConfig,
} from 'vite';
import { createFilter, normalizePath } from 'vite';

import { compile } from '@surimi/compiler';
import type { CompileResult } from '@surimi/compiler';

import { VIRTUAL_CSS_REGEX, VIRTUAL_CSS_SUFFIX } from './constants.js';
import type { SharedPluginContext, SurimiOptions } from './types.js';
import { createSourceMap } from './utils.js';
import { createVuePlugin, VUE_SURIMI_BLOCK_RE } from './vue.js';

/**
 * Vite plugin for Surimi CSS-in-TS: compiles `.css.ts` / `.css.js` and Vue `<surimi>` blocks.
 * Returns [corePlugin, vuePlugin]. Options: {@link SurimiOptions}.
 */
export default function surimiPlugin(options: SurimiOptions = {}): Plugin[] {
  const { include = ['**/*.css.{ts,js}'], exclude = ['node_modules/**', '**/*.d.ts'], inlineCss = false } = options;
  const tsFileFilter = createFilter(include, exclude);

  // Shared state accessible by framework-specific plugins (Vue, etc.)
  const ctx: SharedPluginContext = {
    compilationCache: new Map<string, CompileResult>(),
    include,
    exclude,
    inlineCss,
    resolvedConfig: undefined,
    isDev: undefined,
  };

  // Track files we've already added to watch list to avoid duplicates
  const filesWatched = new Set<string>();

  const normalizeDependencyId = (dependencyId: string, ownerId: string): string => {
    // Rolldown mixes relative, absolute, and virtual ("\0") ids. Normalizing avoids cache misses when Vite
    // requests the same file under a different shape (e.g. absolute path during SSR versus relative in dev).
    const cleanId = dependencyId.split('?')[0] ?? dependencyId;

    if (cleanId.startsWith('\0')) return cleanId;
    if (path.isAbsolute(cleanId)) return normalizePath(cleanId);
    if (ctx.resolvedConfig) return getAbsoluteId(cleanId, ctx.resolvedConfig);

    return normalizePath(path.resolve(path.dirname(ownerId), cleanId));
  };

  ctx.normalizeDependencyId = normalizeDependencyId;

  const getCompilationResult = async (id: string): Promise<CompileResult> => {
    if (!ctx.compilationCache.has(id)) {
      const compileResult = await compile({
        input: normalizePath(id),
        cwd: ctx.resolvedConfig?.root ?? process.cwd(),
        include,
        exclude,
      });

      if (compileResult) {
        const normalizedResult: CompileResult = {
          ...compileResult,
          dependencies: compileResult.dependencies.map((dependencyId: string) =>
            normalizeDependencyId(dependencyId, id),
          ),
        };

        // Storing the normalized graph ensures follow-up builds (virtual CSS loads, HMR invalidations)
        // can reuse work instead of recompiling the same module under multiple cache keys.
        ctx.compilationCache.set(id, normalizedResult);
      }
    }

    const cacheEntry = ctx.compilationCache.get(id);
    if (!cacheEntry) throw new Error('Unexpected missing cache entry');
    return cacheEntry;
  };

  const collectDependentModules = (
    changedFile: string,
    moduleGraph: EnvironmentModuleGraph,
  ): EnvironmentModuleNode[] => {
    const modules: EnvironmentModuleNode[] = [];
    const normalizedChangedFile = normalizePath(changedFile);

    for (const [cachedFile] of ctx.compilationCache) {
      if (!tsFileFilter(cachedFile)) continue;

      const cacheEntry = ctx.compilationCache.get(cachedFile);
      if (cacheEntry?.dependencies.includes(normalizedChangedFile)) {
        ctx.compilationCache.delete(cachedFile);
        modules.push(...collectModulesForInvalidation(cachedFile, moduleGraph, inlineCss));
      }
    }

    return modules;
  };

  const generateJsWithHmr = (js: string, css: string, id: string, styleDependencies: string[]): string => {
    let jsCode: string;

    if (inlineCss) {
      const inliningSnippet = injectCssChunk(css, id, ctx.isDev);
      jsCode = `${js}\n${inliningSnippet}`;
    } else {
      const cssImports = new Set<string>();

      for (const dependency of styleDependencies) {
        if (dependency === id) continue;
        cssImports.add(`import "${getVirtualCssId(dependency)}";`);
      }

      cssImports.add(`import "${getVirtualCssId(id)}";`);

      // Importing every dependent virtual CSS module lets Vite handle deduplication while ensuring shared
      // style files (like theme definitions) still emit their own chunks once per entry.
      jsCode = `${js}\n${Array.from(cssImports).join('\n')}`;
    }

    if (ctx.isDev) {
      jsCode += `\nif (import.meta.hot) { import.meta.hot.accept(); }`;
    }

    return jsCode;
  };

  const corePlugin: Plugin = {
    name: 'vite-plugin-surimi',
    configResolved(config) {
      ctx.resolvedConfig = config;
      ctx.isDev = config.command === 'serve';
    },
    buildStart() {
      this.warn(
        'Surimi is still in early development. Please report any issues you encounter at https://github.com/surimidev/surimi\n',
      );
    },
    async hotUpdate({ file, modules, timestamp, type }) {
      if (type !== 'update') return;

      const normalizedFile = normalizePath(file);
      const isSSR = this.environment.config.consumer === 'server';
      const surimiModules = modules.filter(m => VUE_SURIMI_BLOCK_RE.test(m.url));

      for (const key of [...ctx.compilationCache.keys()]) {
        if (key !== normalizedFile && key.startsWith(normalizedFile)) {
          ctx.compilationCache.delete(key);
        }
      }

      if (surimiModules.length > 0) {
        const allModsForFile = this.environment.moduleGraph.getModulesByFile(normalizedFile);
        if (allModsForFile) {
          const mainMod = [...allModsForFile].find(m => !m.url.includes('?'));
          if (mainMod) {
            this.environment.moduleGraph.invalidateModule(mainMod, new Set(), timestamp, true);
            await this.environment.transformRequest(mainMod.url);
          }
        }
        // SSR: suppress the HMR event (return []) to avoid a full page reload during dev.
        // The transformRequest above already updated the SSR bundle for the next refresh.
        if (isSSR) {
          const nonSurimi = modules.filter(m => !VUE_SURIMI_BLOCK_RE.test(m.url));
          return nonSurimi.length > 0 ? nonSurimi : [];
        }
        return;
      }

      if (tsFileFilter(file)) {
        ctx.compilationCache.delete(normalizedFile);
        const additionalModules = [
          ...collectModulesForInvalidation(normalizedFile, this.environment.moduleGraph, inlineCss),
          ...collectDependentModules(normalizedFile, this.environment.moduleGraph),
        ];
        if (additionalModules.length > 0) {
          return [...modules, ...additionalModules];
        }
      } else {
        const additionalModules = collectDependentModules(
          normalizedFile,
          this.environment.moduleGraph,
        );
        if (additionalModules.length > 0) {
          return [...modules, ...additionalModules];
        }
      }
    },
    resolveId: {
      filter: {
        id: {
          include: [VIRTUAL_CSS_REGEX],
        },
      },
      handler(source) {
        if (!ctx.resolvedConfig) throw new Error('resolveId called before config was resolved');

        const [validId, query] = source.split('?');

        if (validId?.endsWith(VIRTUAL_CSS_SUFFIX)) {
          // In SSR Mode, we can end up with paths like /src/styles.css.ts
          const absoluteId = getAbsoluteId(validId, ctx.resolvedConfig);

          return query ? `${absoluteId}?${query}` : absoluteId;
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
        // Load virtual CSS files. Surimi TS files are handled in transform()
        if (validId?.endsWith(VIRTUAL_CSS_SUFFIX)) {
          const originalId = getSourceIdFromVirtual(validId);
          // In SSR Mode, we can end up with paths like /src/styles.css.ts
          const absoluteId = getAbsoluteId(originalId, ctx.resolvedConfig);
          let cacheEntry = ctx.compilationCache.get(absoluteId);

          // If cache entry is missing (e.g., during HMR), regenerate it
          if (!cacheEntry && tsFileFilter(absoluteId)) {
            this.debug(`Regenerating cache for: ${absoluteId}`);
            cacheEntry = await getCompilationResult(absoluteId);
          }

          if (cacheEntry) {
            return {
              code: cacheEntry.css,
              map: createSourceMap(path.basename(validId), path.basename(absoluteId)),
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

        try {
          const { css, js, dependencies } = await getCompilationResult(id);

          const styleDependencies = dependencies.filter(
            dependencyId => dependencyId !== id && tsFileFilter(dependencyId),
          );

          // Pre-building nested style files guarantees their virtual CSS modules exist before Vite tries to
          // load them, avoiding waterfalls where parents compile successfully but dependants 404.
          for (const dependencyId of styleDependencies) {
            await getCompilationResult(dependencyId);
          }

          const jsCode = generateJsWithHmr(js, css, id, styleDependencies);

          // Add file dependencies for proper HMR
          if (ctx.isDev && !options?.ssr) {
            dependencies.forEach((dep: string) => {
              // Watch only real filesystem entries; virtual ids ("\0" prefixed) cannot be monitored and would
              // trigger noise in Vite's watcher set.
              if (!path.isAbsolute(dep)) return;
              if (!filesWatched.has(dep)) {
                filesWatched.add(dep);
                this.addWatchFile(dep);
              }
            });
          }

          return {
            code: jsCode,
            map: createSourceMap(path.basename(id), path.basename(id)),
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

export function injectCssChunk(css: string, id: string, isDev = false): string {
  const identifier = path.basename(id);
  const chunkHash = createHash('md5').update(id).digest('hex').slice(0, 8);
  const styleId = `surimi-style_${identifier}_${chunkHash}`;

  let hmrCode = '';

  if (isDev) {
    hmrCode = `
if (import.meta.hot) {
  import.meta.hot.dispose(() => { document.getElementById(styleId)?.remove(); });
  import.meta.hot.accept(() => {});
}`;
  }

  return `
const css = ${JSON.stringify(css)};
const styleId = '${styleId}';

const existingStyle = document.getElementById(styleId);

// Create and inject new style element
const styleElement = document.createElement('style');
styleElement.id = styleId;
styleElement.textContent = css;
document.head.appendChild(styleElement);

if (existingStyle) {
  existingStyle.remove();
}${hmrCode}
`;
}

/** Normalize to absolute path; handles root-relative paths used in some SSR setups (e.g. Astro). */
function getAbsoluteId(filePath: string, config: ResolvedConfig): string {
  const alreadyAbsolute =
    filePath.startsWith(config.root) ||
    (path.isAbsolute(filePath) &&
      filePath.split(path.posix.sep)[1] === config.root.split(path.posix.sep)[1]);
  return normalizePath(alreadyAbsolute ? filePath : path.join(config.root, filePath));
}

const getVirtualCssId = (sourceId: string): string => `${sourceId}${VIRTUAL_CSS_SUFFIX}`;
const getSourceIdFromVirtual = (virtualId: string): string =>
  virtualId.replace(VIRTUAL_CSS_SUFFIX, '');

/** Cache key shape for Vue surimi blocks; Vite uses SFC query URL, so we map for module graph lookup. */
const VUE_SURIMI_VIRTUAL_PATH_RE = /^(.+\.vue)\.__surimi_(\d+)\.css\.ts$/;

/**
 * Map a Vue surimi virtual path (our cache key) to the module id Vite uses.
 * Vite registers the module under the SFC query URL, not the virtual path.
 */
function vueSurimiVirtualPathToModuleId(virtualPath: string): string | null {
  const m = VUE_SURIMI_VIRTUAL_PATH_RE.exec(virtualPath);
  if (!m) return null;
  const [, vueFilePath, index] = m;
  return `${vueFilePath}?vue&type=surimi&index=${index}&lang.ts`;
}

const collectModulesForInvalidation = (
  fileId: string,
  moduleGraph: EnvironmentModuleGraph,
  inlineCss: boolean,
): EnvironmentModuleNode[] => {
  const modules: EnvironmentModuleNode[] = [];

  const addModule = (id: string) => {
    const module = moduleGraph.getModuleById(id);
    if (module) modules.push(module);
  };

  // Vue surimi blocks are cached under a virtual path (App.vue.__surimi_0.css.ts) but
  // Vite registers the module under the SFC query id (App.vue?vue&type=surimi&index=0&lang.ts).
  const surrogateId = vueSurimiVirtualPathToModuleId(fileId);
  if (surrogateId) {
    addModule(surrogateId);
    return modules;
  }

  addModule(fileId);

  if (!inlineCss) {
    addModule(getVirtualCssId(fileId));
  }

  return modules;
};

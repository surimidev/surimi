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

import type { SharedPluginContext, SurimiOptions } from './types.js';
import { createVuePlugin, VUE_SURIMI_BLOCK_RE } from './vue.js';

// Constants
const VIRTUAL_CSS_SUFFIX = '.surimi.css';
// any exact match for .surimi.css files, possibly with vite 'query params' like `?inline`
const VIRTUAL_CSS_REGEX = new RegExp(`\\${VIRTUAL_CSS_SUFFIX}(?:\\?.*)?$`);

/**
 * Vite plugin to integrate Surimi CSS-in-TS compilation.
 * Supports both development (with HMR) and production build modes.
 *
 * Returns an array of plugins: the core compilation plugin and a Vue SFC
 * custom block handler (no-op for non-Vue projects).
 *
 * for plugin options, see {@link SurimiOptions}
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

  /**
   * Generates JavaScript code with HMR support for development builds
   */
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

    // Add HMR acceptance for development builds
    if (ctx.isDev) {
      jsCode += `\n// HMR support for Surimi
if (import.meta.hot) {
  import.meta.hot.accept();
}`;
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

      // Clear our compilation cache for entries derived from this file
      for (const key of [...ctx.compilationCache.keys()]) {
        if (key !== normalizedFile && key.startsWith(normalizedFile)) {
          ctx.compilationCache.delete(key);
        }
      }

      // When surimi custom blocks change: force @vitejs/plugin-vue to update its descriptor
      // cache (and our compilation cache) so the next load/transform gets fresh content.
      // Do this for both client and SSR so HMR shows new styles and full-page refresh does too.
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

      // Handle .css.ts file changes (non-Vue)
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

        // Handle virtual CSS imports
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
              map: {
                version: 3,
                file: path.basename(validId),
                sources: [path.basename(absoluteId)],
                names: [],
                mappings: '',
              },
            };
          } else {
            this.error(`Missing build cache entry for virtual CSS file: ${id}`);
          }
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
            map: {
              version: 3,
              file: path.basename(id),
              sources: [path.basename(id)],
              names: [],
              mappings: '',
            },
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
    hmrCode = `\n\n// HMR support
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    // The module will be re-executed with new CSS
  });
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

// Used to convert file paths like /src/styles.css.ts to absolute paths.
// This is introduced to make SSR scenarios (like Astro) work correctly.
// There, the initial vite loading / resolution steps use absolute paths, but astro might not.
const getAbsoluteId = (filePath: string, config: ResolvedConfig) => {
  let resolvedId = filePath;

  if (
    filePath.startsWith(config.root) ||
    // In monorepos the absolute path will be outside of config.root, so we check that they have the same root on the file system
    // Paths from vite are always normalized, so we have to use the posix path separator
    (path.isAbsolute(filePath) && filePath.split(path.posix.sep)[1] === config.root.split(path.posix.sep)[1])
  ) {
    resolvedId = filePath;
  } else {
    // In SSR mode we can have paths like /app/styles.css.ts
    resolvedId = path.join(config.root, filePath);
  }

  return normalizePath(resolvedId);
};

const getVirtualCssId = (sourceId: string): string => `${sourceId}${VIRTUAL_CSS_SUFFIX}`;
const getSourceIdFromVirtual = (virtualId: string): string => virtualId.replace(VIRTUAL_CSS_SUFFIX, '');

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

  addModule(fileId);

  if (!inlineCss) {
    addModule(getVirtualCssId(fileId));
  }

  return modules;
};

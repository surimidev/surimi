import { createHash } from 'node:crypto';
import path from 'node:path';
import { createFilter } from '@rollup/pluginutils';
import compile from '@surimi/compiler';
import type { CompileResult } from '@surimi/compiler';
import type { ModuleNode, Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { normalizePath } from 'vite';

import type { SurimiOptions } from './types.js';

// Constants
const VIRTUAL_CSS_SUFFIX = '.surimi.css';

/**
 * Vite plugin to integrate Surimi CSS-in-JS compilation
 * Supports both development (with HMR) and production build modes
 *
 * for plugin options, see {@link SurimiOptions}
 */
export default function surimiPlugin(options: SurimiOptions = {}): Plugin[] {
  const { include = ['**/*.css.{ts,js}'], exclude = ['node_modules/**', '**/*.d.ts'], inlineCss = false } = options;
  const filter = createFilter(include, exclude);

  let resolvedConfig: ResolvedConfig | undefined;
  let isDev: boolean | undefined;

  // Compilation cache - cleared during HMR for affected files
  const compilationCache = new Map<string, CompileResult>();

  const getCompilationResult = async (id: string): Promise<CompileResult> => {
    if (!compilationCache.has(id)) {
      const compileResult = await compile({
        inputPath: normalizePath(id),
        cwd: resolvedConfig?.root ?? process.cwd(),
        include,
        exclude,
      });
      compilationCache.set(id, compileResult);
    }

    const cacheEntry = compilationCache.get(id);
    if (!cacheEntry) throw new Error('Unexpected missing cache entry');
    return cacheEntry;
  };

  // Used to convert file paths like /src/styles.css.ts to absolute paths.
  // This is introduced to make SSR scenarios (like Astro) work correctly.
  // There, the initial vite loading / resolution steps use absolute paths, but astro might not.
  const getAbsoluteId = (filePath: string) => {
    let resolvedId = filePath;

    if (!resolvedConfig) throw new Error('getAbsoluteId called before config was resolved');

    if (
      filePath.startsWith(resolvedConfig.root) ||
      // In monorepos the absolute path will be outside of config.root, so we check that they have the same root on the file system
      // Paths from vite are always normalized, so we have to use the posix path separator
      (path.isAbsolute(filePath) && filePath.split(path.posix.sep)[1] === resolvedConfig.root.split(path.posix.sep)[1])
    ) {
      resolvedId = filePath;
    } else {
      // In SSR mode we can have paths like /app/styles.css.ts
      resolvedId = path.join(resolvedConfig.root, filePath);
    }

    return normalizePath(resolvedId);
  };

  const getVirtualCssId = (sourceId: string): string => `${sourceId}${VIRTUAL_CSS_SUFFIX}`;
  const getSourceIdFromVirtual = (virtualId: string): string => virtualId.replace(VIRTUAL_CSS_SUFFIX, '');

  const collectModulesForInvalidation = (fileId: string, server: ViteDevServer): ModuleNode[] => {
    const modules: ModuleNode[] = [];

    const addModule = (id: string) => {
      const module = server.moduleGraph.getModuleById(id);
      if (module) modules.push(module);
    };

    addModule(fileId);

    if (!inlineCss) {
      addModule(getVirtualCssId(fileId));
    }

    return modules;
  };

  const collectDependentModules = (changedFile: string, server: ViteDevServer): ModuleNode[] => {
    const modules: ModuleNode[] = [];

    for (const [cachedFile] of compilationCache) {
      if (filter(cachedFile)) {
        const cacheEntry = compilationCache.get(cachedFile);
        if (cacheEntry?.dependencies.includes(changedFile)) {
          compilationCache.delete(cachedFile);
          modules.push(...collectModulesForInvalidation(cachedFile, server));
        }
      }
    }

    return modules;
  };

  /**
   * Generates JavaScript code with HMR support for development builds
   */
  const generateJsWithHmr = (js: string, css: string, id: string): string => {
    let jsCode: string;

    if (inlineCss) {
      const inliningSnippet = injectCssChunk(css, id, isDev);
      jsCode = `${js}\n${inliningSnippet}`;
    } else {
      jsCode = `${js}\nimport "${getVirtualCssId(id)}";`;
    }

    // Add HMR acceptance for development builds
    if (isDev) {
      jsCode += `\n// HMR support for Surimi
if (import.meta.hot) {
  import.meta.hot.accept();
}`;
    }

    return jsCode;
  };

  return [
    {
      name: 'vite-plugin-surimi',
      configResolved(config) {
        resolvedConfig = config;
        isDev = config.command !== 'build' && !config.build.watch;
      },

      handleHotUpdate({ file, server }) {
        const modules = [];

        if (filter(file)) {
          // Direct change to a .css.ts file
          compilationCache.delete(file);
          modules.push(...collectModulesForInvalidation(file, server));
        } else {
          // Check if any .css.ts files depend on this changed file
          modules.push(...collectDependentModules(file, server));
        }

        return modules;
      },
      resolveId(source) {
        const [validId, query] = source.split('?');

        // Handle virtual CSS imports
        if (validId?.endsWith(VIRTUAL_CSS_SUFFIX)) {
          // In SSR Mode, we can end up with paths like /src/styles.css.ts
          const absoluteId = getAbsoluteId(validId);

          return query ? `${absoluteId}?${query}` : absoluteId;
        }
        return null;
      },
      async load(id) {
        const [validId] = id.split('?');
        // Load virtual CSS files. Surimi TS files are handled in transform()
        if (validId?.endsWith(VIRTUAL_CSS_SUFFIX)) {
          const originalId = getSourceIdFromVirtual(validId);
          // In SSR Mode, we can end up with paths like /src/styles.css.ts
          const absoluteId = getAbsoluteId(originalId);
          let cacheEntry = compilationCache.get(absoluteId);

          // If cache entry is missing (e.g., during HMR), regenerate it
          if (!cacheEntry && filter(absoluteId)) {
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
      async transform(_, id, options) {
        if (filter(id)) {
          if (options?.ssr && inlineCss) {
            this.error('The inlineCss option is not supported during SSR builds.');
          }

          try {
            const { css, js, dependencies } = await getCompilationResult(id);
            const jsCode = generateJsWithHmr(js, css, id);

            // Add file dependencies for proper HMR
            if (isDev && !options?.ssr) {
              dependencies.forEach((dep: string) => {
                this.addWatchFile(dep);
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
        }

        return null;
      },
    },
  ];
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
// Auto-generated by vite-plugin-surimi (${isDev ? 'dev' : 'build'} mode - inline)
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

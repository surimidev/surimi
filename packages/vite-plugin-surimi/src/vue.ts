import { createHash } from 'node:crypto';
import path from 'node:path';
import type { Plugin } from 'vite';
import { createFilter, normalizePath } from 'vite';

import { compile, type CompileResult } from '@surimi/compiler';

import { VIRTUAL_CSS_SUFFIX } from './constants.js';
import type { SharedPluginContext } from './types.js';
import { createSourceMap } from './utils.js';

/**
 * Matches Vue SFC request URLs for `<surimi>` blocks (with or without lang).
 * @see https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-transforming-custom-blocks
 */
export const VUE_SURIMI_BLOCK_RE = /[?&]vue&type=surimi/;

/**
 * Handles Vue SFC `<surimi>` blocks: compiles block content and injects CSS (or virtual CSS imports).
 * Called by the core plugin with shared context; no-op if no Vue surimi blocks are used.
 */
export function createVuePlugin(ctx: SharedPluginContext): Plugin {
  const tsFileFilter = createFilter(ctx.include, ctx.exclude);

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
              dependencies: compileResult.dependencies.map(
                (dep: string): string => normalizer(dep, virtualInput),
              ),
            }
          : compileResult;
        ctx.compilationCache.set(virtualInput, resultToCache);

        // Same as core plugin: pull in virtual CSS for any .css.ts/.css.js dependency so their
        // styles are included (e.g. theme.css.ts imported by the block). Without this, nested
        // surimi imports only run JS and never load the dependency's CSS chunk.
        const styleDependencies = resultToCache.dependencies.filter(
          (dep: string) => dep !== virtualInput && tsFileFilter(dep),
        );
        const cssImportLines = styleDependencies.map(
          (dep: string) => `import "${dep}${VIRTUAL_CSS_SUFFIX}";`,
        );

        if (options?.ssr) {
          let ssrCode = compileResult.js;
          if (cssImportLines.length > 0) ssrCode += `\n${cssImportLines.join('\n')}`;
          ssrCode += `\nimport "${virtualInput}${VIRTUAL_CSS_SUFFIX}";`;
          ssrCode += `\nexport default () => {};`;
          return { code: ssrCode, map: createSourceMap(path.basename(id)) };
        }

        let jsCode: string;
        const selfCssImport = `import "${virtualInput}${VIRTUAL_CSS_SUFFIX}";`;
        const dependencyImports =
          cssImportLines.length > 0 ? `\n${cssImportLines.join('\n')}` : '';
        if (ctx.isDev || ctx.inlineCss) {
          jsCode = `${compileResult.js}${dependencyImports}\n${injectCssChunkForVue(compileResult.css, virtualInput)}`;
        } else {
          jsCode = `${compileResult.js}${dependencyImports}\n${selfCssImport}`;
        }

        if (ctx.isDev) {
          jsCode += `\nif (import.meta.hot) { import.meta.hot.accept(); }`;
        }

        jsCode += `\nexport default () => {};`;

        return { code: jsCode, map: createSourceMap(path.basename(id)) };
      },
    },
  };
}

function injectCssChunkForVue(css: string, id: string): string {
  const identifier = path.basename(id);
  const chunkHash = createHash('md5').update(id).digest('hex').slice(0, 8);
  const styleId = `surimi-style_${identifier}_${chunkHash}`;

  return `
const css = ${JSON.stringify(css)};
const styleId = '${styleId}';
const existingStyle = document.getElementById(styleId);
const styleElement = document.createElement('style');
styleElement.id = styleId;
styleElement.textContent = css;
document.head.appendChild(styleElement);
if (existingStyle) { existingStyle.remove(); }
if (import.meta.hot) {
  import.meta.hot.dispose(() => { document.getElementById(styleId)?.remove(); });
}`;
}

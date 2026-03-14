import { createHash } from 'node:crypto';
import path from 'node:path';
import type { Plugin } from 'vite';
import { normalizePath } from 'vite';

import { compile } from '@surimi/compiler';

import type { SharedPluginContext } from './types.js';

/**
 * Regex matching Vue SFC custom block requests for `<surimi>` blocks.
 * Works with or without a `lang` attribute: `<surimi>`, `<surimi lang="ts">`, `<surimi lang="js">`.
 *
 * @see https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-transforming-custom-blocks
 * @see https://vuejs.org/guide/scaling-up/tooling.html#sfc-custom-block-integrations
 */
const VUE_SURIMI_BLOCK_RE = /[?&]vue&type=surimi/;
const VIRTUAL_CSS_SUFFIX = '.surimi.css';

/**
 * Vite plugin that handles `<surimi>` custom blocks in Vue Single-File Components.
 *
 * When `@vitejs/plugin-vue` encounters a `<surimi>` block, it extracts the block content
 * and emits a request like `App.vue?vue&type=surimi&index=0&lang.ts`. This plugin intercepts
 * that request, compiles the inline surimi code to CSS, and injects it via virtual CSS modules.
 *
 * All three forms are supported:
 * - `<surimi>` (no lang)
 * - `<surimi lang="ts">`
 * - `<surimi lang="js">`
 *
 * @see https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-transforming-custom-blocks
 * @see https://vuejs.org/guide/scaling-up/tooling.html#sfc-custom-block-integrations
 */
export function createVuePlugin(ctx: SharedPluginContext): Plugin {
  return {
    name: 'vite-plugin-surimi:vue',
    transform: {
      filter: {
        id: {
          include: [VUE_SURIMI_BLOCK_RE],
        },
      },
      async handler(code, id) {
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

        ctx.compilationCache.set(virtualInput, compileResult);

        const cssImport = `import "${virtualInput}${VIRTUAL_CSS_SUFFIX}";`;
        let jsCode = `${compileResult.js}\n${cssImport}`;

        if (ctx.inlineCss) {
          jsCode = `${compileResult.js}\n${injectCssChunkForVue(compileResult.css, virtualInput)}`;
        }

        if (ctx.isDev) {
          jsCode += `\nif (import.meta.hot) { import.meta.hot.accept(); }`;
        }

        // Custom blocks must export a default function that receives the component.
        // We use a no-op since surimi only needs CSS injection, not component modification.
        jsCode += `\nexport default () => {};`;

        return {
          code: jsCode,
          map: { version: 3, file: path.basename(id), sources: [], names: [], mappings: '' },
        };
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
if (existingStyle) { existingStyle.remove(); }`;
}

import { pathToFileURL } from 'url';
import { createFilter } from '@rollup/pluginutils';
import fastGlob from 'fast-glob';
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { normalizePath } from 'vite';

import type { SurimiOptions } from './types.js';

function isSurimiCSSFile(id: string, filter: (id: string) => boolean): boolean {
  // Check if this is a generated CSS file from a surimi file
  // We use a specific suffix to identify our generated CSS files
  if (id.includes('.surimi.css')) {
    // Get the original file path by removing our specific suffix and query parameters
    const originalPath = id.replace(/\.surimi\.css(\?.*)?$/, '').split('?')[0];
    if (!originalPath) return false;
    return filter(normalizePath(originalPath));
  }
  return false;
}

export function surimi(options: SurimiOptions = {}): Plugin {
  const {
    autoExternal = true,
    mode = 'manual',
    manualMode,
    virtualMode,
    include = ['**/*.css.{ts,js}'],
    exclude = ['node_modules/**', '**/*.d.ts'],
  } = options;

  const virtualModeConfig = {
    moduleId: 'virtual:surimi.css',
    ...virtualMode,
  };

  const manualModeConfig = {
    output: 'chunk',
    ...manualMode,
  };

  const VIRTUAL_MODULE_ID = virtualModeConfig.moduleId;
  const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

  const filter = createFilter(include, exclude);
  let root: string;
  let lastCSS = '';

  // Store extracted CSS for virtual modules
  const cssCache = new Map<string, string>();

  return {
    name: 'vite-plugin-surimi',

    config(config, { command }) {
      // Automatically externalize surimi and postcss in build mode
      if (command === 'build' && autoExternal) {
        config.build = config.build ?? {};
        config.build.rollupOptions = config.build.rollupOptions ?? {};

        const existingExternal = config.build.rollupOptions.external ?? [];

        // Handle different types of external configuration
        let externalArray: string[] = [];
        if (Array.isArray(existingExternal)) {
          externalArray = [...existingExternal.filter((ext): ext is string => typeof ext === 'string')];
        } else if (typeof existingExternal === 'string') {
          externalArray = [existingExternal];
        }

        // Add surimi and postcss to externals if not already present
        const surimiExternals = ['surimi', 'postcss'];
        for (const ext of surimiExternals) {
          if (!externalArray.includes(ext)) {
            externalArray.push(ext);
          }
        }

        config.build.rollupOptions.external = externalArray;
      }
    },

    configResolved(config: ResolvedConfig) {
      root = config.root;
    },

    resolveId(id: string) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }

      // Resolve CSS imports from manual mode
      if (isSurimiCSSFile(id, filter)) {
        // Return the id as-is so our load hook can handle it
        return id;
      }
    },

    async load(id: string) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        if (mode === 'virtual') {
          const css = await generateCSS(include, root, filter);
          lastCSS = css;
          return css;
        }
        return '';
      }

      // Handle CSS chunks for manual mode
      // Check if this is a CSS file we generated
      if (isSurimiCSSFile(id, filter)) {
        // Remove query parameters to get the base CSS id
        const baseId = id.split('?')[0];
        if (!baseId) return;

        const cachedCss = cssCache.get(baseId);

        if (cachedCss) {
          // Return raw CSS - Vite will process it through its CSS pipeline
          // Whether it's ?inline or regular import, Vite handles the processing
          return cachedCss;
        } else {
          // Debug: log what we're looking for vs what we have
          console.log('Missing CSS cache for:', baseId);
          console.log('Available keys:', Array.from(cssCache.keys()));
        }
      }
    },

    async transform(_code: string, id: string) {
      const normalizedId = normalizePath(id);

      // Only process files that match our include/exclude patterns in manual mode
      if (mode !== 'manual' || !filter(normalizedId)) return null;

      // Extract CSS at build time
      const css = await extractCssFromFile(id);

      if (css) {
        // Generate a unique CSS file ID for this module with our specific suffix
        const cssId = id + '.surimi.css';

        // Store CSS for later retrieval via load hook
        cssCache.set(cssId, css);

        if (manualModeConfig.output === 'chunk') {
          // Regular CSS chunk - Vite will process and emit as separate CSS file
          return {
            code: `// CSS extracted from ${normalizedId} at build time
import '${cssId}';`,
            map: null,
          };
        } else {
          // Inline mode - inject CSS directly as JavaScript that creates style tags
          const escapedCSS = css.replace(/`/g, '\\`').replace(/\$/g, '\\$');
          return {
            code: `// CSS extracted from ${normalizedId} at build time
const css = \`${escapedCSS}\`;
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);`,
            map: null,
          };
        }
      }

      // If no CSS was extracted, return empty module
      return {
        code: '// Surimi file processed at build time - no runtime needed',
        map: null,
      };
    },

    async handleHotUpdate({ file, server }: { file: string; server: ViteDevServer }) {
      // Only handle HMR in virtual mode and for files that match our filter
      if (mode !== 'virtual' || !filter(file)) {
        return;
      }

      // Regenerate CSS when files change
      const newCSS = await generateCSS(include, root, filter);

      if (newCSS !== lastCSS) {
        lastCSS = newCSS;

        // Update the virtual module
        const module = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);
        if (module) {
          await server.reloadModule(module);
        }
      }

      return [];
    },
  };
}

async function generateCSS(
  includePattern: string | string[],
  root: string,
  filter: (id: string) => boolean,
): Promise<string> {
  // Find all CSS files matching our patterns
  const files = await fastGlob(includePattern, {
    cwd: root,
    absolute: true,
  });

  const filteredFiles = files.filter((file: string) => filter(normalizePath(file)));
  let allCss = '';

  for (const file of filteredFiles) {
    try {
      // All .css.ts/.css.js files are considered surimi files
      const css = await extractCssFromFile(file);
      if (css) {
        allCss += css + '\n';
      }
    } catch (error) {
      console.warn(`Failed to process file ${file}:`, error);
    }
  }

  return allCss.trim();
}

async function extractCssFromFile(filePath: string): Promise<string> {
  try {
    // Convert file path to file URL for dynamic import
    const fileUrl = pathToFileURL(filePath).href;

    // Clear any existing Surimi styles before importing
    const { default: s } = await import('surimi');
    s.clear();

    // Import and execute the file
    await import(`${fileUrl}?t=${Date.now().toString()}`);

    // Get the generated CSS
    const css = s.build();

    // Clear again to avoid contamination between files
    s.clear();

    return css;
  } catch (error) {
    console.warn(`Failed to extract CSS from ${filePath}:`, error);
    return '';
  }
}

// Export the plugin as default
export default surimi;

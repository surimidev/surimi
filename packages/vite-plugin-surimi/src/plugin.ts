import { pathToFileURL } from 'url';
import { createFilter } from '@rollup/pluginutils';
import fastGlob from 'fast-glob';
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { normalizePath } from 'vite';

import type { SurimiPluginOptions } from './types.js';

function isSurimiFile(filePath: string): boolean {
  return /\.css\.(ts|js)$/.test(filePath);
}

export function surimiPlugin(options: SurimiPluginOptions = {}): Plugin {
  const {
    include = ['**/*.css.{ts,js}'],
    exclude = ['node_modules/**', '**/*.d.ts'],
    autoExternal = true,
    mode = 'manual',
    manualMode = { output: 'inline' },
    virtualModuleId = 'virtual:surimi.css',
  } = options;

  const VIRTUAL_MODULE_ID = virtualModuleId;
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
      if (id.includes('.css.ts.css') || id.includes('.css.js.css')) {
        // Return the id as-is so our load hook can handle it
        return id;
      }
    },

    async load(id: string) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        if (mode === 'virtual') {
          const css = await generateCSS(root, filter);
          lastCSS = css;
          return css;
        }
        return '';
      }

      // Handle CSS chunks for manual mode
      // Check if this is a CSS file we generated
      if (id.includes('.css.ts.css') || id.includes('.css.js.css')) {
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

      // Only process .css.ts/.css.js files in manual mode
      if (mode !== 'manual' || !isSurimiFile(normalizedId)) return null;

      // Extract CSS at build time
      const css = await extractCssFromFile(id);

      if (css) {
        if (manualMode.output === 'chunk') {
          // Generate CSS chunk that Vite will process
          const cssId = id + '.css';

          // Store CSS for later retrieval via load hook
          cssCache.set(cssId, css);

          // Let Vite handle the CSS file by returning an import
          // Vite will process this CSS through its pipeline (minification, PostCSS, etc.)
          return {
            code: `// CSS extracted from ${normalizedId} at build time
import '${cssId}';`,
            map: null,
          };
        } else {
          // Inline mode - create a CSS import with ?inline query
          // This tells Vite to process the CSS and return it as a string
          const virtualCssId = id + '.css?inline';

          // Store CSS for the virtual module
          cssCache.set(id + '.css', css);

          return {
            code: `// CSS extracted from ${normalizedId} at build time  
import css from '${virtualCssId}';
if (typeof document !== 'undefined') {
  const styleId = 'surimi-${id.replace(/[^a-zA-Z0-9]/g, '-')}';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
  }
}`,
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
      const newCSS = await generateCSS(root, filter);

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

async function generateCSS(root: string, filter: (id: string) => boolean): Promise<string> {
  // Find all CSS files matching our patterns
  const files = await fastGlob(['**/*.css.{ts,js}'], {
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
export default surimiPlugin;

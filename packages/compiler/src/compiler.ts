import type { CompileOptions, CompileResult } from './types';

/** Minimal rolldown input shape; compatible with both 'rolldown' and '@rolldown/browser'. */
export interface RolldownInput {
  input: string;
  cwd: string;
  plugins: unknown[];
}

/** Base64-encode UTF-8 string; works in Node (Buffer) and browser (TextEncoder + btoa). */
function toBase64Utf8(str: string): string {
  if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
    return Buffer.from(str, 'utf8').toString('base64');
  }
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export const SURIMI_CSS_EXPORT_NAME = '__SURIMI_GENERATED_CSS__';
export const COMPILER_PLUGIN_NAME = 'surimi:compiler-transform';

const DEV_SURIMI_PACKAGES = [
  '/packages/surimi',
  '/packages/common',
  '/packages/parsers',
  '/packages/core',
  '/packages/conditional',
];

interface SurimiModule extends Record<string, unknown> {
  default?: unknown;
  [SURIMI_CSS_EXPORT_NAME]?: unknown;
}

function createSurimiTransformPlugin(include: CompileOptions['include'], exclude: CompileOptions['exclude']) {
  return {
    name: COMPILER_PLUGIN_NAME,
    transform: {
      filter: { id: { include, exclude } },
      handler(code: string) {
        return `\
import { Surimi as __surimi__instance__ } from 'surimi';
__surimi__instance__.clear();
${code}
export const ${SURIMI_CSS_EXPORT_NAME} = __surimi__instance__.build();
`;
      },
    },
  };
}

function createVirtualSourcePlugin(input: string, source: string) {
  return {
    name: 'surimi:virtual-source',
    resolveId(id: string) {
      if (id === input) return id;
    },
    load(id: string) {
      if (id === input) return source;
    },
  };
}

export function getRolldownInput(options: CompileOptions) {
  validateCompileOptions(options);

  const { input, cwd, source } = options;

  // When compiling inline source, the entry path may not match the user's include globs
  // (e.g. a Vue SFC virtual path vs '**/*.css.ts'). Adding it ensures the surimi wrapper is applied.
  const effectiveInclude = source != null ? [...options.include, input] : options.include;
  const virtualSourcePlugin = source != null ? [createVirtualSourcePlugin(input, source)] : [];

  return {
    input,
    cwd,
    plugins: [...virtualSourcePlugin, createSurimiTransformPlugin(effectiveInclude, options.exclude)],
  };
}

/** Matches data: URLs in error messages and stack traces so we can replace with source path. */
const DATA_URL_PATTERN = /data:text\/javascript;base64,[A-Za-z0-9+/=]+/g;

function rewriteDataUrlInError(error: Error, sourcePath: string): Error {
  const message = error.message.replace(DATA_URL_PATTERN, sourcePath);
  const stack = error.stack?.replace(DATA_URL_PATTERN, sourcePath);
  const rewritten = new Error(message);
  rewritten.name = error.name;
  if (stack) rewritten.stack = stack;
  if (error.cause)
    rewritten.cause = error.cause instanceof Error ? rewriteDataUrlInError(error.cause, sourcePath) : error.cause;
  return rewritten;
}

/**
 * Execute the compiled Surimi code and extract the CSS and preserved exports.
 *
 * Code, imports etc. are passed individually to support `BindingOutput` chunks from Rolldown watch mode
 */
export async function getCompileResult(
  code: string,
  imports: string[],
  dynamicImports: string[],
  moduleIds: string[],
  sourcePath?: string,
): Promise<CompileResult | undefined> {
  const { css, js } = await execute(code, sourcePath);

  // Extract all imported modules as watch files
  const watchFiles = getModuleDependencies(imports, dynamicImports, moduleIds);

  return {
    css,
    js,
    dependencies: [...new Set(watchFiles)],
    duration: 0,
  };
}

/**
 * Executes the compiled Surimi code in a data URL module context
 * and extracts the generated CSS and preserved exports.
 * When sourcePath is provided, errors are rewritten to show it instead of the data: URL.
 */
export async function execute(code: string, sourcePath?: string) {
  try {
    // Dynamic import with variable URL so Vite (and other bundlers) don't try to pre-bundle this data URL
    const dataUrl = `data:text/javascript;base64,${toBase64Utf8(code)}`;
    const module = (await import(
      // TODO: Fix this. We need to preserve the vite-ignore comment so this import isn't flagged
      // by vite, as it cannot be analyzed. @preserve doesn't work for some reason.
      //! @vite-ignore
      dataUrl
    )) as SurimiModule;

    // Get the generated CSS
    const cssValue = module[SURIMI_CSS_EXPORT_NAME] ?? '';
    const css = typeof cssValue === 'string' ? cssValue : '';

    // Collect all exports except the special CSS export and default.
    // We only re-export values that can be JSON-serialized (so they can be inlined in the output).
    const exports: string[] = [];
    for (const [key, value] of Object.entries(module)) {
      if (key !== 'default' && key !== SURIMI_CSS_EXPORT_NAME) {
        if (!isSerializable(value)) {
          continue;
        }
        let serialized: string;
        try {
          serialized = JSON.stringify(value);
          exports.push(`export const ${key} = ${serialized};`);
        } catch {
          // Potentially unserializable value, skip
          continue;
        }
      }
    }

    // Generate the transformed JS
    const js = exports.length > 0 ? exports.join('\n') : '';

    return { css, js };
  } catch (error) {
    if (error instanceof Error) {
      if (sourcePath) {
        throw rewriteDataUrlInError(error, sourcePath);
      }
      const message = error.message || String(error);
      if (message.includes('data:') || message.includes('from "data:')) {
        const strippedMessage = message
          .replace(DATA_URL_PATTERN, '<surimi-module>')
          .replace(/("data:[^"]*")/g, '<surimi-module>');
        throw new Error(
          strippedMessage.includes('Failed to build')
            ? strippedMessage
            : `Failed to build surimi output: ${strippedMessage}`,
        );
      }
      throw error;
    }
    throw error;
  }
}

// Type guard to check if a value is serializable to JSON
function isSerializable(value: unknown): value is string | number | boolean | null | object {
  const type = typeof value;
  return type === 'string' || type === 'number' || type === 'boolean' || value === null || type === 'object';
}

// Validates compilation options - throws Error if options are invalid
function validateCompileOptions(options: CompileOptions): void {
  if (!options.input || typeof options.input !== 'string') {
    throw new Error('input must be a non-empty string');
  }
  if (!options.cwd || typeof options.cwd !== 'string') {
    throw new Error('cwd must be a non-empty string');
  }

  if (!Array.isArray(options.include)) {
    throw new Error('include must be an array');
  }
  if (options.include.length === 0) {
    throw new Error('include array cannot be empty');
  }
  if (!Array.isArray(options.exclude)) {
    throw new Error('exclude must be an array');
  }
}

/**
 * Extracts module dependencies from the Rolldown output chunk.
 *
 * Will exclude dependencies from `node_modules`, rolldown runtime modules
 * and development Surimi packages (only relevant in development).
 */
function getModuleDependencies(imports: string[], dynamicImports: string[], moduleIds: string[]): string[] {
  const watchFiles: string[] = [];

  // Add all imports from the rolldown output
  if (imports.length > 0) {
    watchFiles.push(...imports);
  }

  // Add dynamic imports if any
  if (dynamicImports.length > 0) {
    watchFiles.push(...dynamicImports);
  }

  if (moduleIds.length > 0) {
    for (const moduleId of moduleIds) {
      if (!moduleId.includes('node_modules') && !isDevelopmentSurimiFile(moduleId)) {
        if (moduleId.includes('rolldown:runtime')) continue;

        watchFiles.push(moduleId);
      }
    }
  }

  return watchFiles;
}

// Checks if a module ID is from the development surimi or parsers packages
// Development files are not tracked in watch mode as they're part of the library itself
function isDevelopmentSurimiFile(id: string): boolean {
  return DEV_SURIMI_PACKAGES.some(pkgPath => id.includes(pkgPath));
}

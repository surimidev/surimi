import type { InputOptions } from 'rolldown';
import { rolldown } from 'rolldown';

import type { CompileOptions, CompileResult } from '.';

export const SURIMI_CSS_EXPORT_NAME = '__SURIMI_GENERATED_CSS__';
export const COMPILER_PLUGIN_NAME = 'surimi:compiler-transform';

export const DEV_SURIMI_PACKAGES = ['packages/surimi/', 'packages/parsers/'] as const;

interface SurimiModule extends Record<string, unknown> {
  default?: unknown;
  [SURIMI_CSS_EXPORT_NAME]?: unknown;
}

export function getRolldownInput(options: CompileOptions) {
  validateCompileOptions(options);

  const { inputPath, cwd, include, exclude } = options;

  return {
    input: inputPath,
    cwd,
    plugins: [
      {
        name: COMPILER_PLUGIN_NAME,
        transform: {
          filter: {
            id: {
              include,
              exclude,
            },
          },
          handler(code) {
            const finalCode = `\
import { Surimi as __surimi__instance__ } from 'surimi';
__surimi__instance__.clear();
${code}
export const ${SURIMI_CSS_EXPORT_NAME} = __surimi__instance__.build();
`;
            return finalCode;
          },
        },
      },
    ],
  } satisfies InputOptions;
}

export async function getRolldownInstance(input: InputOptions) {
  return rolldown(input);
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
): Promise<CompileResult | undefined> {
  const { css, js } = await execute(code);

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
 */
export async function execute(code: string) {
  try {
    const dataUrl = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
    const module = (await import(dataUrl)) as SurimiModule;

    // Get the generated CSS
    const cssValue = module[SURIMI_CSS_EXPORT_NAME] ?? '';
    const css = typeof cssValue === 'string' ? cssValue : '';

    // Collect all exports except the special CSS export and default
    const exports: string[] = [];
    for (const [key, value] of Object.entries(module)) {
      if (key !== 'default' && key !== SURIMI_CSS_EXPORT_NAME) {
        if (!isSerializable(value)) {
          // Skip non-serializable values (functions, symbols, etc.)
          continue;
        }

        if (typeof value === 'string') {
          // Regular string export
          exports.push(`export const ${key} = ${JSON.stringify(value)};`);
        } else if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
          // Primitive types
          exports.push(`export const ${key} = ${JSON.stringify(value)};`);
        } else if (typeof value === 'object') {
          // Other object exports (like theme objects, arrays)
          exports.push(`export const ${key} = ${JSON.stringify(value)};`);
        } else {
          // Fallback for other types (should not reach here due to isSerializable check)
          exports.push(`export const ${key} = ${JSON.stringify(String(value))};`);
        }
      }
    }

    // Generate the transformed JS
    const js = exports.length > 0 ? exports.join('\n') : '';

    return { css, js };
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message || String(error);
      if (message.includes('from "data:')) {
        // We suppress the ugly data URL in the error message
        const strippedMessage = message.replace(/("data:[^ ]+)/g, '<surimi-module>');
        throw new Error(`Failed to build surimi output: ${strippedMessage}`);
      }
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
  if (!options.inputPath || typeof options.inputPath !== 'string') {
    throw new Error('inputPath must be a non-empty string');
  }

  if (!options.cwd || typeof options.cwd !== 'string') {
    throw new Error('cwd must be a non-empty string');
  }

  if (!Array.isArray(options.include)) {
    throw new Error('include must be an array');
  }

  if (!Array.isArray(options.exclude)) {
    throw new Error('exclude must be an array');
  }

  if (options.include.length === 0) {
    throw new Error('include array cannot be empty');
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

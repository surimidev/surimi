import type { OutputChunk, RolldownWatcher } from 'rolldown';
import { rolldown, watch } from 'rolldown';
import {
  COMPILER_PLUGIN_NAME,
  DATA_URL_ERROR_PATTERN,
  DATA_URL_ERROR_REPLACEMENT,
  DATA_URL_PREFIX,
  DEFAULT_EXPORT_KEY,
  DEV_PARSERS_PACKAGE_PATTERN,
  DEV_SURIMI_PACKAGE_PATTERN,
  ERROR_BUILD_FAILED,
  JS_HEADER_WITH_EXPORTS,
  JS_NO_EXPORTS,
  NODE_MODULES_PATTERN,
  ROLLDOWN_RUNTIME_PATTERN,
  SURIMI_CSS_EXPORT_NAME,
  SURIMI_INSTANCE_VAR,
  SURIMI_PACKAGE_NAME,
} from './constants';

/** Options for compiling Surimi CSS files */
export interface CompileOptions {
  /** Absolute path to the input file to compile */
  inputPath: string;
  /** Working directory for resolving imports */
  cwd: string;
  /** Glob patterns for files to include in compilation */
  include: string[];
  /** Glob patterns for files to exclude from compilation */
  exclude: string[];
}

/** Result of a successful compilation */
export interface CompileResult {
  /** The generated CSS output */
  css: string;
  /** The transformed JavaScript with preserved exports (Surimi runtime removed) */
  js: string;
  /** List of file dependencies for watch mode */
  dependencies: string[];
}

/** Result of executing compiled code */
export interface ExecuteResult {
  /** The generated CSS */
  css: string;
  /** The transformed JavaScript with preserved exports */
  js: string;
}

/** Module interface for dynamically imported code */
interface SurimiModule extends Record<string, unknown> {
  /** Default export (ignored) */
  default?: unknown;
}

/** Type guard to check if a value is serializable to JSON */
function isSerializable(value: unknown): value is string | number | boolean | null | object {
  const type = typeof value;
  return (
    type === 'string' ||
    type === 'number' ||
    type === 'boolean' ||
    value === null ||
    type === 'object'
  );
}

/** Validates compilation options - throws {Error} if options are invalid */
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

/** Compiles a Surimi CSS file into pure CSS and JavaScript - Transforms `.css.ts` files by bundling, executing, and extracting CSS + exports - throws {Error} if validation or compilation fails */
export default async function compile(options: CompileOptions): Promise<CompileResult | undefined> {
  // Validate input options
  validateCompileOptions(options);

  const { inputPath, cwd, include, exclude } = options;

  // Rolldown nicely provides an `asyncDispose` symbol.
  await using rolldownCompiler = await rolldown({
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
import { Surimi as ${SURIMI_INSTANCE_VAR} } from '${SURIMI_PACKAGE_NAME}';
${SURIMI_INSTANCE_VAR}.clear();
${code}
export const ${SURIMI_CSS_EXPORT_NAME} = ${SURIMI_INSTANCE_VAR}.build();
`;
            return finalCode;
          },
        },
      },
    ],
  });

  const buildRes = await rolldownCompiler.generate({ exports: 'named' });
  await rolldownCompiler.close();

  const output = buildRes.output[0];
  const { css, js } = await execute(output.code);

  // Extract all imported modules as watch files
  const watchFiles = getModuleDependencies(output);

  return {
    css,
    js,
    dependencies: [...new Set(watchFiles)],
  };
}

/** Executes compiled code and extracts CSS and user exports - throws {Error} if execution fails or imports cannot be resolved */
export async function execute(code: string): Promise<ExecuteResult> {
  try {
    const dataUrl = `${DATA_URL_PREFIX}${Buffer.from(code).toString('base64')}`;
    const module = (await import(dataUrl)) as SurimiModule;

    // Get the generated CSS
    const cssValue = module[SURIMI_CSS_EXPORT_NAME] ?? '';
    const css = typeof cssValue === 'string' ? cssValue : '';

    // Collect all exports except the special CSS export and default
    const exports: string[] = [];
    for (const [key, value] of Object.entries(module)) {
      if (key !== DEFAULT_EXPORT_KEY && key !== SURIMI_CSS_EXPORT_NAME) {
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
    const js =
      exports.length > 0
        ? `${JS_HEADER_WITH_EXPORTS}${exports.join('\n')}\n`
        : JS_NO_EXPORTS;

    return { css, js };
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message || String(error);
      if (message.includes(DATA_URL_ERROR_PATTERN)) {
        // We suppress the ugly data URL in the error message
        const strippedMessage = message.replace(/("data:[^ ]+)/g, DATA_URL_ERROR_REPLACEMENT);
        throw new Error(`${ERROR_BUILD_FAILED} ${strippedMessage}`);
      }
    }

    throw error;
  }
}

/** Extracts module dependencies from compiled output for watch mode - filters out node_modules, development surimi/parsers files, and Rolldown runtime modules */
function getModuleDependencies(module: OutputChunk): string[] {
  const watchFiles: string[] = [];

  // Add the main input file
  // watchFiles.push(module.fileName);

  // Add all imports from the rolldown output
  if (module.imports.length > 0) {
    watchFiles.push(...module.imports);
  }

  // Add dynamic imports if any
  if (module.dynamicImports.length > 0) {
    watchFiles.push(...module.dynamicImports);
  }

  if ('modules' in module && Object.keys(module.modules).length > 0) {
    for (const moduleId of Object.keys(module.modules)) {
      if (!moduleId.includes(NODE_MODULES_PATTERN) && !isDevelopmentSurimiFile(moduleId)) {
        if (moduleId.includes(ROLLDOWN_RUNTIME_PATTERN)) continue;

        watchFiles.push(moduleId);
      }
    }
  }

  return watchFiles;
}

/** Checks if a module ID is from the development surimi or parsers packages - development files are not tracked in watch mode as they're part of the library itself */
function isDevelopmentSurimiFile(id: string): boolean {
  return id.includes(DEV_SURIMI_PACKAGE_PATTERN) || id.includes(DEV_PARSERS_PACKAGE_PATTERN);
}

/** Creates a Rolldown watcher for watch mode - returns watcher instance that emits events for build lifecycle */
export function compileWatch(options: CompileOptions): RolldownWatcher {
  // Validate input options
  validateCompileOptions(options);

  const { inputPath, cwd, include, exclude } = options;

  // Create watcher with Rolldown's native watch API
  const watcher = watch({
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
import { Surimi as ${SURIMI_INSTANCE_VAR} } from '${SURIMI_PACKAGE_NAME}';
${SURIMI_INSTANCE_VAR}.clear();
${code}
export const ${SURIMI_CSS_EXPORT_NAME} = ${SURIMI_INSTANCE_VAR}.build();
`;
            return finalCode;
          },
        },
      },
    ],
  });

  return watcher;
}

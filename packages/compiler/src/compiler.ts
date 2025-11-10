import type { InputOptions } from 'rolldown';
import { rolldown } from 'rolldown';

import type { CompileOptions, CompileResult } from '.';
import type { ModuleBuildCache } from '#module-cache';

export const SURIMI_CSS_EXPORT_NAME = '__SURIMI_GENERATED_CSS__';
export const COMPILER_PLUGIN_NAME = 'surimi:compiler-transform';

export const DEV_SURIMI_PACKAGES = ['packages/surimi/', 'packages/parsers/'] as const;

interface SurimiModule extends Record<string, unknown> {
  default?: unknown;
  [SURIMI_CSS_EXPORT_NAME]?: unknown;
}

export function getRolldownInput(options: CompileOptions, moduleCache?: ModuleBuildCache) {
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
          handler(code, id) {
            // Check module cache if enabled
            if (moduleCache) {
              const cached = moduleCache.get(id, code);
              if (cached) {
                return cached;
              }
            }

            // Transform the code
            const finalCode = `\
import { Surimi as __surimi__instance__ } from 'surimi';
__surimi__instance__.clear();
${code}
export const ${SURIMI_CSS_EXPORT_NAME} = __surimi__instance__.build();
`;

            // Cache the transformed code
            if (moduleCache) {
              moduleCache.set(id, code, finalCode);
            }

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

export async function getCompileResult(
  code: string,
  imports: string[],
  dynamicImports: string[],
  moduleIds: string[],
): Promise<CompileResult | undefined> {
  const { css, js } = await execute(code);
  const watchFiles = getModuleDependencies(imports, dynamicImports, moduleIds);

  return {
    css,
    js,
    dependencies: [...new Set(watchFiles)],
    duration: 0,
  };
}

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
      if (key !== 'default' && key !== SURIMI_CSS_EXPORT_NAME && isSerializable(value)) {
        exports.push(`export const ${key} = ${JSON.stringify(value)};`);
      }
    }

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

function isSerializable(value: unknown): value is string | number | boolean | null | object {
  const type = typeof value;
  return type === 'string' || type === 'number' || type === 'boolean' || value === null || type === 'object';
}

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

function isDevelopmentSurimiFile(id: string): boolean {
  return DEV_SURIMI_PACKAGES.some(pkgPath => id.includes(pkgPath));
}

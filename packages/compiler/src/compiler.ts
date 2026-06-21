import { COMPILER_PLUGIN_NAME, SURIMI_CSS_EXPORT_NAME } from './constants';
import { extractSurimiResult, type SurimiModule } from './extract';
import type { CompileOptions } from './types';

export { COMPILER_PLUGIN_NAME, SURIMI_CSS_EXPORT_NAME } from './constants';
export { extractSurimiResult, isSerializable, type SurimiModule } from './extract';

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

const DEV_SURIMI_PACKAGES = [
  '/packages/surimi',
  '/packages/common',
  '/packages/parsers',
  '/packages/core',
  '/packages/conditional',
];

export function createSurimiTransformPlugin(include: CompileOptions['include'], exclude: CompileOptions['exclude']) {
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

export function createVirtualSourcePlugin(input: string, source: string) {
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

export async function getCompileResult(
  code: string,
  imports: string[],
  dynamicImports: string[],
  moduleIds: string[],
  sourcePath?: string,
) {
  const { css, js } = await execute(code, sourcePath);
  const watchFiles = getModuleDependencies(imports, dynamicImports, moduleIds);

  return {
    css,
    js,
    dependencies: [...new Set(watchFiles)],
    duration: 0,
  };
}

export async function execute(code: string, sourcePath?: string) {
  try {
    const dataUrl = `data:text/javascript;base64,${toBase64Utf8(code)}`;
    const module = (await import(
      //! @vite-ignore
      dataUrl
    )) as SurimiModule;

    return extractSurimiResult(module);
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

function getModuleDependencies(imports: string[], dynamicImports: string[], moduleIds: string[]): string[] {
  const watchFiles: string[] = [];

  if (imports.length > 0) {
    watchFiles.push(...imports);
  }

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

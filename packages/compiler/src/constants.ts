export const SURIMI_CSS_EXPORT_NAME = '__SURIMI_GENERATED_CSS__';
export const COMPILER_PLUGIN_NAME = 'surimi:compiler-transform';

/**
 * Path fragments of the surimi workspace packages (monorepo development only).
 * Files under these paths are the library itself, not user code, so evaluators exclude them from
 * dependency tracking / watch lists. Single source of truth shared by the compiler and the
 * vite plugin's evaluator.
 */
export const DEV_SURIMI_PACKAGES = [
  '/packages/surimi',
  '/packages/common',
  '/packages/parsers',
  '/packages/core',
  '/packages/conditional',
  '/packages/theme',
];

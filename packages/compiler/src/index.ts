/**
 * Default entry: Node (uses native `rolldown` for CLI and watch).
 * For browser/WASM use the "browser" export: @surimi/compiler/browser
 */
export {
  COMPILER_PLUGIN_NAME,
  createSurimiTransformPlugin,
  createVirtualSourcePlugin,
  extractSurimiResult,
  isSerializable,
  SURIMI_CSS_EXPORT_NAME,
  type SurimiModule,
} from './compiler';
export {
  type CompileOptions,
  type CompileResult,
  compile,
  compileWatch,
  type RolldownWatcher,
  type RolldownWatcherEvent,
  type WatchOptions,
} from './index.node';

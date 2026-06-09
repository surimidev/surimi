/**
 * Default entry: Node (uses native `rolldown` for CLI and watch).
 * For browser/WASM use the "browser" export: @surimi/compiler/browser
 */
export {
  type CompileOptions,
  type CompileResult,
  compile,
  compileWatch,
  type RolldownWatcher,
  type RolldownWatcherEvent,
  type WatchOptions,
} from './index.node';

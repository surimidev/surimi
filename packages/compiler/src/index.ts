/**
 * Default entry: Node (uses native `rolldown` for CLI and watch).
 * For browser/WASM use the "browser" export: @surimi/compiler/browser
 */
export {
  compile,
  compileWatch,
  type CompileOptions,
  type CompileResult,
  type WatchOptions,
  type RolldownWatcher,
  type RolldownWatcherEvent,
} from './index.node';

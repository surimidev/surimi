import type { RolldownWatcher } from 'rolldown';
import { watch } from 'rolldown';

import { getRolldownInput, getRolldownInstance, performCompile } from '#compiler';

export interface CompileOptions {
  /** Absolute path to the input file to compile */
  inputPath: string;
  /** Working directory for resolving modules */
  cwd: string;
  /** Glob patterns for files to include in compilation */
  include: string[];
  /** Glob patterns for files to exclude from compilation */
  exclude: string[];
}

export interface WatchOptions {
  /**
   * Callback invoked when a file changes
   * Receives the changed file ID, the type of event, and the latest compile result
   * The compileResult can be undefined if the compilation failed, or if there is no output (file was deleted etc.)
   */
  onChange: (id: string, event: 'create' | 'update' | 'delete', compileResult: CompileResult | undefined) => void;
}

export interface CompileResult {
  /** The generated CSS output */
  css: string;
  /** The transformed JavaScript with preserved, JSON-serialized exports (Surimi runtime removed) */
  js: string;
  /** List of file dependencies. Can be used for HMR, watch mode etc. */
  dependencies: string[];
  /** Duration of the compilation in milliseconds */
  duration: number;
}

export async function compile(options: CompileOptions): Promise<CompileResult | undefined> {
  const rolldownInput = getRolldownInput(options);
  // Rolldown nicely provides an `asyncDispose` symbol.
  await using rolldownCompiler = await getRolldownInstance(rolldownInput);

  return await performCompile(rolldownCompiler);
}

/**
 * Performs the compilation and sets up a file watcher to recompile on changes.
 *
 * `watchOptions.onChange` is called whenever a file changes, with the new compilation result.
 *
 * @returns The Rolldown watcher instance for further handling.
 */
export function compileWatch(options: CompileOptions, watchOptions: WatchOptions): RolldownWatcher {
  const rolldownInput = getRolldownInput(options);
  const watcher = watch(rolldownInput);

  getRolldownInstance(rolldownInput)
    .then(rolldownCompiler => {
      watcher.on('change', async (id, { event }) => {
        const compileResult = await performCompile(rolldownCompiler);
        watchOptions.onChange(id, event, compileResult);
      });
    })
    .catch((error: unknown) => {
      throw new Error(`Failed to initialize watcher: ${error instanceof Error ? error.message : String(error)}`);
    });

  return watcher;
}

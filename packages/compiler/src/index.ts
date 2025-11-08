import type { RolldownWatcher, RolldownWatcherEvent } from 'rolldown';
import { watch } from 'rolldown';

import { getCompileResult, getRolldownInput, getRolldownInstance } from '#compiler';

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
  onChange: (compileResult: CompileResult | undefined, event: RolldownWatcherEvent) => void;
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
  const startTime = Date.now();
  const rolldownInput = getRolldownInput(options);
  // Rolldown nicely provides an `asyncDispose` symbol.
  await using rolldownCompiler = await getRolldownInstance(rolldownInput);
  const rolldownOutput = await rolldownCompiler.generate();
  const chunk = rolldownOutput.output[0];

  const result = await getCompileResult(chunk.code, chunk.imports, chunk.dynamicImports, chunk.moduleIds);
  const duration = Date.now() - startTime;

  return result ? { ...result, duration } : undefined;
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
  const watcher = watch({
    ...rolldownInput,
    watch: {
      skipWrite: true,
      include: options.include,
      exclude: options.exclude,
    },
  });

  watcher.on('event', async event => {
    if (event.code === 'BUNDLE_END') {
      const startTime = Date.now();
      const output = await event.result.generate();

      if ('errors' in output) {
        watchOptions.onChange(undefined, event);
        return;
      }

      const chunk = output.chunks[0];

      if (!chunk) {
        watchOptions.onChange(undefined, event);
        return;
      }

      const result = await getCompileResult(
        chunk.getCode(),
        chunk.getImports(),
        chunk.getDynamicImports(),
        chunk.getModuleIds(),
      );

      if (!result) {
        watchOptions.onChange(undefined, event);
        return;
      }

      const duration = Date.now() - startTime;

      void event.result.close();

      watchOptions.onChange(
        {
          ...result,
          duration: duration + event.duration,
        },
        event,
      );
    }
  });

  return watcher;
}

import type { RolldownWatcher, RolldownWatcherEvent } from 'rolldown';
import { watch } from 'rolldown';

import { BuildCache } from '#cache';
import { getCompileResult, getRolldownInput, getRolldownInstance } from '#compiler';

export interface CompileOptions {
  inputPath: string;
  cwd: string;
  include: string[];
  exclude: string[];
}

export interface WatchOptions {
  onChange: (compileResult: CompileResult | undefined, event: RolldownWatcherEvent) => void;
}

export interface CompileResult {
  css: string;
  js: string;
  dependencies: string[];
  duration: number;
}

export async function compile(options: CompileOptions): Promise<CompileResult | undefined> {
  const startTime = Date.now();
  const rolldownInput = getRolldownInput(options);
  await using rolldownCompiler = await getRolldownInstance(rolldownInput);
  const rolldownOutput = await rolldownCompiler.generate();
  const chunk = rolldownOutput.output[0];

  const result = await getCompileResult(chunk.code, chunk.imports, chunk.dynamicImports, chunk.moduleIds);
  const duration = Date.now() - startTime;

  return result ? { ...result, duration } : undefined;
}

// Compiles and watches for file changes with incremental caching
export function compileWatch(options: CompileOptions, watchOptions: WatchOptions): RolldownWatcher {
  const rolldownInput = getRolldownInput(options);
  const buildCache = new BuildCache();

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

      // Get module information for cache checking
      const moduleIds = chunk.getModuleIds();
      const imports = chunk.getImports();
      const dynamicImports = chunk.getDynamicImports();

      // Try to get cached result first
      const cachedResult = await buildCache.get(options.inputPath);

      if (cachedResult) {
        // Cache hit - use cached result
        const duration = Date.now() - startTime;

        void event.result.close();

        watchOptions.onChange(
          {
            ...cachedResult,
            duration: duration + event.duration,
          },
          event,
        );
        return;
      }

      // Cache miss - perform compilation
      const result = await getCompileResult(chunk.getCode(), imports, dynamicImports, moduleIds);

      if (!result) {
        watchOptions.onChange(undefined, event);
        return;
      }

      // Store result in cache
      await buildCache.set(options.inputPath, result);

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

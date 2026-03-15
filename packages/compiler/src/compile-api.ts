import { getCompileResult, getRolldownInput } from './compiler';
import type { CompileOptions, CompileResult, RolldownWatcherEvent, WatchOptions } from './types';

/**
 * Minimal rolldown API used by compile/compileWatch.
 * Callers pass { rolldown, watch } from 'rolldown' or '@rolldown/browser'; we type as unknown to avoid pulling in package-specific types.
 */
export interface RolldownApi {
  rolldown: (input: unknown) => Promise<{
    generate(): Promise<{
      output: Array<{ code: string; imports: string[]; dynamicImports: string[]; moduleIds: string[] }>;
    }>;
  }>;
  watch: (opts: unknown) => {
    on(event: string, listener: (e: RolldownWatcherEvent) => void | Promise<void>): unknown;
    close(): Promise<void>;
  };
}

export function createCompile(api: RolldownApi) {
  async function compile(options: CompileOptions): Promise<CompileResult | undefined> {
    const startTime = Date.now();
    const input = getRolldownInput(options);
    const rolldownCompiler = await api.rolldown(input);
    const rolldownOutput = await rolldownCompiler.generate();
    const chunk = rolldownOutput.output[0];
    if (!chunk || !('code' in chunk)) return undefined;

    const result = await getCompileResult(
      chunk.code,
      chunk.imports,
      chunk.dynamicImports,
      chunk.moduleIds,
      options.input,
    );
    const duration = Date.now() - startTime;

    return result ? { ...result, duration } : undefined;
  }

  function compileWatch(options: CompileOptions, watchOptions: WatchOptions): ReturnType<RolldownApi['watch']> {
    const rolldownInput = getRolldownInput(options);
    const watcher = api.watch({
      ...rolldownInput,
      watch: {
        skipWrite: true,
        include: options.include,
        exclude: options.exclude,
      },
    });

    watcher.on('event', (event: RolldownWatcherEvent) => {
      void (async () => {
        if (event.code === 'ERROR') {
          watchOptions.onChange(undefined, event, event.error);
          return;
        }

        if (event.code !== 'BUNDLE_END') return;

        const startTime = Date.now();
        const bundle = event.result as
          | {
              generate?(): Promise<{
                output: Array<{ code: string; imports: string[]; dynamicImports: string[]; moduleIds: string[] }>;
              }>;
              close(): Promise<void>;
            }
          | undefined;

        try {
          let result: CompileResult | undefined;
          if (bundle && typeof bundle.generate === 'function') {
            const output = await bundle.generate();
            const chunk = output.output[0];
            await bundle.close();
            if (chunk && 'code' in chunk) {
              result = await getCompileResult(
                chunk.code,
                chunk.imports,
                chunk.dynamicImports,
                chunk.moduleIds,
                options.input,
              );
            }
          } else {
            if (bundle) await bundle.close();
            result = await compile(options);
          }

          if (!result) {
            watchOptions.onChange(undefined, event);
            return;
          }

          watchOptions.onChange(
            {
              ...result,
              duration: Date.now() - startTime + (event.duration ?? 0),
            },
            event,
          );
        } catch (err) {
          if (bundle && typeof (bundle as { close?: () => Promise<void> }).close === 'function') {
            await (bundle as { close(): Promise<void> }).close().catch(() => {
              /* noop */
            });
          }
          watchOptions.onChange(undefined, event, err);
        }
      })();
    });

    return watcher;
  }

  return { compile, compileWatch };
}

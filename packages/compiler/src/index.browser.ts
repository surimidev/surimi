import type { RolldownWatcher, RolldownWatcherEvent } from '@rolldown/browser';
import { rolldown, watch } from '@rolldown/browser';

import { createCompile, type RolldownApi } from './compile-api';
import type { CompileOptions, CompileResult, WatchOptions } from './types';

const { compile, compileWatch } = createCompile({ rolldown, watch } as RolldownApi);

export type { CompileOptions, CompileResult, RolldownWatcher, RolldownWatcherEvent, WatchOptions };

export { compile, compileWatch };

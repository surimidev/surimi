import type { RolldownWatcher, RolldownWatcherEvent } from 'rolldown';
import { rolldown, watch } from 'rolldown';

import { createCompile, type RolldownApi } from './compile-api';
import type { CompileOptions, CompileResult, WatchOptions } from './types';

const { compile, compileWatch } = createCompile({ rolldown, watch } as RolldownApi);

export type { CompileOptions, CompileResult, WatchOptions };
export type { RolldownWatcher, RolldownWatcherEvent };

export { compile, compileWatch };

import type { RolldownWatcher, RolldownWatcherEvent } from 'rolldown';
import { rolldown, watch } from 'rolldown';

import { createCompile, type RolldownApi } from './compile-api';
import {
  COMPILER_PLUGIN_NAME,
  createSurimiTransformPlugin,
  createVirtualSourcePlugin,
  extractSurimiResult,
  isSerializable,
  SURIMI_CSS_EXPORT_NAME,
  type SurimiModule,
} from './compiler';
import type { CompileOptions, CompileResult, WatchOptions } from './types';

const { compile, compileWatch } = createCompile({ rolldown, watch } as RolldownApi);

export type { CompileOptions, CompileResult, RolldownWatcher, RolldownWatcherEvent, WatchOptions };

export {
  COMPILER_PLUGIN_NAME,
  compile,
  compileWatch,
  createSurimiTransformPlugin,
  createVirtualSourcePlugin,
  extractSurimiResult,
  isSerializable,
  SURIMI_CSS_EXPORT_NAME,
  type SurimiModule,
};

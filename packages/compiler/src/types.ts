/** Minimal watch event shape; compatible with both rolldown and @rolldown/browser. */
export interface RolldownWatcherEvent {
  code: string;
  result?: unknown;
  duration?: number;
  error?: Error;
}

export interface CompileOptions {
  /** Absolute path to the input file (or virtual entry path when `source` is provided). */
  input: string;
  /** Working directory for resolving modules. */
  cwd: string;
  /** Glob patterns for files to include in compilation */
  include: string[];
  /** Glob patterns for files to exclude from compilation */
  exclude: string[];
  /**
   * Inline source code to compile instead of reading `input` from disk.
   * When provided, `input` is used as the virtual module ID for resolving relative imports.
   */
  source?: string;
}

export interface WatchOptions {
  /**
   * Callback invoked when a file changes
   * Receives the compile result (undefined on failure), the event, and optionally the error when compilation failed.
   */
  onChange: (compileResult: CompileResult | undefined, event: RolldownWatcherEvent, error?: unknown) => void;
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

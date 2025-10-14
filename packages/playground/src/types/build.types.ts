export interface CompilerState {
  state: 'idle' | 'compiling' | 'success' | 'error';
  error: string | null;
  outputFilePath: string | null;
  duration: number | null;
}

/** Build a minimal source map for transformed output. */
export function createSourceMap(
  fileBasename: string,
  sourceBasename?: string,
): { version: number; file: string; sources: string[]; names: string[]; mappings: string } {
  return {
    version: 3,
    file: fileBasename,
    sources: sourceBasename !== undefined ? [sourceBasename] : [],
    names: [],
    mappings: '',
  };
}

import { createHash } from 'node:crypto';
import path from 'node:path';

/** Build a minimal source map for transformed output. */
export function createSourceMap(
  fileBasename: string,
  sourceBasename?: string,
  outputLineCount?: number,
): { version: number; file: string; sources: string[]; names: string[]; mappings: string } {
  const mappings =
    sourceBasename !== undefined && outputLineCount !== undefined && outputLineCount > 0
      ? buildOneToOneMappings(outputLineCount)
      : '';
  return {
    version: 3,
    file: fileBasename,
    sources: sourceBasename !== undefined ? [sourceBasename] : [],
    names: [],
    mappings,
  };
}

/** VLQ base64 encoding table (RFC 2045). */
const VLQ_BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function vlqEncode(n: number): string {
  let encoded = '';
  n = n < 0 ? (-n << 1) | 1 : n << 1;
  do {
    let digit = n & 31;
    n >>>= 5;
    if (n > 0) digit |= 32;
    encoded += VLQ_BASE64[digit] ?? '';
  } while (n > 0);
  return encoded;
}

/** Build mappings string for 1:1 line mapping (output line i -> source line i). Segments use relative deltas. */
function buildOneToOneMappings(lineCount: number): string {
  const segments: string[] = [];
  for (let i = 0; i < lineCount; i++) {
    // generatedColumn=0, sourceIndex=0, sourceLine=delta (0 then +1 each line), sourceColumn=0
    const sourceLineDelta = i === 0 ? 0 : 1;
    segments.push(vlqEncode(0) + vlqEncode(0) + vlqEncode(sourceLineDelta) + vlqEncode(0));
  }
  return segments.join(';');
}

/**
 * Inject CSS into the page at runtime (for inlineCss or Vue surimi blocks in dev).
 * When isDev is true, adds HMR dispose/accept so styles update on change.
 */
export function injectCssChunk(css: string, id: string, isDev = false): string {
  const identifier = path.basename(id);
  const chunkHash = createHash('md5').update(id).digest('hex').slice(0, 8);
  const styleId = `surimi-style_${identifier}_${chunkHash}`;

  let hmrCode = '';
  if (isDev) {
    hmrCode = `
if (import.meta.hot) {
  import.meta.hot.dispose(() => { document.getElementById(styleId)?.remove(); });
  import.meta.hot.accept(() => {});
}`;
  }

  return `
const css = ${JSON.stringify(css)};
const styleId = '${styleId}';
const existingStyle = document.getElementById(styleId);
if (existingStyle) { existingStyle.remove(); }
const styleElement = document.createElement('style');
styleElement.id = styleId;
styleElement.textContent = css;
document.head.appendChild(styleElement);${hmrCode}
`;
}

/**
 * Register absolute dependency paths with Vite's watcher. Skips non-absolute and already-watched paths.
 */
export function addWatchFilesForDeps(
  dependencies: string[],
  filesWatched: Set<string>,
  addWatchFile: (file: string) => void,
  isAbsolute: (p: string) => boolean,
): void {
  for (const dep of dependencies) {
    if (!isAbsolute(dep)) continue;
    if (filesWatched.has(dep)) continue;
    filesWatched.add(dep);
    addWatchFile(dep);
  }
}

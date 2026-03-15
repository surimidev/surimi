import { SourceMapConsumer } from 'source-map';
import { describe, expect, it } from 'vitest';

import { createSourceMap } from '#utils';

describe('createSourceMap', () => {
  it('produces valid sourcemap that parses and maps 1:1 lines', async () => {
    const outFile = 'output.css';
    const sourceFile = 'foo.css.ts';
    const lineCount = 5;

    const map = createSourceMap(outFile, sourceFile, lineCount);

    expect(map.version).toBe(3);
    expect(map.file).toBe(outFile);
    expect(map.sources).toEqual([sourceFile]);
    expect(map.names).toEqual([]);
    expect(map.mappings).toBeTruthy();

    const consumer = await new SourceMapConsumer(map);

    // Each generated line i (1-based) should map to source line i, column 0
    for (let line = 1; line <= lineCount; line++) {
      const pos = consumer.originalPositionFor({ line, column: 0 });
      expect(pos.source).toBe(sourceFile);
      expect(pos.line).toBe(line);
      expect(pos.column).toBe(0);
    }

    consumer.destroy();
  });

  it('handles zero output lines (empty mappings)', () => {
    const map = createSourceMap('out.css', 'src.css.ts', 0);
    expect(map.mappings).toBe('');
  });

  it('handles missing outputLineCount (no mappings)', () => {
    const map = createSourceMap('out.css');
    expect(map.mappings).toBe('');
    expect(map.sources).toEqual([]);
  });

  it('handles missing sourceBasename', () => {
    const map = createSourceMap('out.css', undefined, 3);
    expect(map.sources).toEqual([]);
    expect(map.mappings).toBe('');
  });
});

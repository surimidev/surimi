import { memfs } from '@rolldown/browser/experimental';
import type { IFs, Volume } from 'memfs';
import { useEffect, useState } from 'react';
import surimiCode from 'surimi?bundle';

import { compile, type CompileResult } from '@surimi/compiler';

const FS = memfs as { fs: IFs; volume: Volume };

const ENTRY_PATH = '/index.css.ts';
export default function Test() {
  const [result, setResult] = useState<CompileResult | undefined>(undefined);
  const [file, setFile] = useState<string>('const test = "test";');

  useEffect(() => {
    FS.volume.reset();
    FS.volume.fromJSON({
      '/node_modules/surimi/package.json': JSON.stringify({
        name: 'surimi',
        version: '1.0.0',
        main: 'index.js',
        module: 'index.js',
      }),
      '/node_modules/surimi/index.js': surimiCode,
    });
  }, []);

  const handleCompile = async () => {
    const vol = (memfs as { fs: IFs; volume: Volume }).volume;
    vol.writeFileSync(ENTRY_PATH, file);
    console.log(vol.toJSON());
    const res = await compile({
      input: 'index.css.ts',
      cwd: '/',
      include: ['**/*.css.ts'],
      exclude: ['**/node_modules/**'],
    });
    setResult(res);
  };

  return (
    <div>
      <textarea
        value={file}
        onChange={e => {
          setFile(e.target.value);
        }}
      />
      <button onClick={() => void handleCompile()}>Compile</button>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}

import type { Terminal as XTerm } from '@xterm/xterm';
import { useState } from 'react';

import * as Editor from '#components/Editor';
import { Runtime } from '#core';
import type { FileSystemTree, TerminalDimensions } from '#types';

import './playground.css';

const files = {
  'index.ts': {
    file: {
      contents: `
import { select } from "surimi";

select('html').style({ backgroundColor: 'red' });
`,
    },
  },
  'package.json': {
    file: {
      contents: `
{
  "name": "surimi-playground-app",
  "type": "module",
  "dependencies": {
    "surimi": "latest",
    "@surimi/compiler": "latest"
  },
  "scripts": {
    "build": "surimi compile index.ts --out-dir=./dist --no-js --watch"
  }
}`,
    },
  },
} satisfies FileSystemTree;

export default function Playgroun() {
  const [runtime, setRuntime] = useState<Runtime | undefined>();

  const handleTerminalMount = async (xterm: XTerm) => {
    const _runtime = new Runtime();
    await _runtime.init('surimi');
    await _runtime.initTerminal(xterm);
    await _runtime.mount(files);

    setRuntime(_runtime);

    xterm.input('pnpm install && pnpm run build\n');
  };

  const handleWriteFile = async (filepath: string, content: string | undefined) => {
    if (content == undefined) return;
    await runtime?.writeFile(filepath, content);
  };

  const handleReadFile = async (filepath: string): Promise<string> => {
    try {
      if (!runtime) throw new Error('Runtime not yet initialized');

      const file = await runtime.readFile(filepath);
      return file;
    } catch (err) {
      throw new Error(`unable to read file ${filepath}: ${err}`);
    }
  };

  const handleTerminalResize = (meta: TerminalDimensions) => {
    runtime?.terminal?.setMetadata(meta);
  };

  return (
    <Editor.Provider>
      <Editor.Root
        tree={files}
        selectedFile="index.ts"
        runtimeReady={!!runtime}
        writeFile={handleWriteFile}
        readFile={handleReadFile}
      >
        <Editor.View />
        <Editor.Panel
          resizable
          defaultSize={{ width: '40%' }}
          enable={false}
          maxWidth="80%"
          minWidth="20%"
          className="surimi-editor__right"
          as="div"
        >
          <Editor.Output />
          <Editor.Terminal onMount={handleTerminalMount} onResize={handleTerminalResize} />
        </Editor.Panel>
      </Editor.Root>
    </Editor.Provider>
  );
}

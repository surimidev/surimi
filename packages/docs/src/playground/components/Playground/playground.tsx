import type { Terminal as XTerm } from '@xterm/xterm';
import { useState } from 'react';

import * as Editor from '#playground/components/Editor';
import { Runtime } from '#playground/core';
import type { TerminalDimensions, WatchCallback, WatchOptions } from '#playground/types';

import { files } from './filetree';

import './playground.css';

export default function Playgroun() {
  const [runtime, setRuntime] = useState<Runtime | undefined>();
  const [status, setStatus] = useState<string | null>('Loading...');
  const [outputFilePath, setOutputFilePath] = useState<string | undefined>();

  const handleTerminalMount = async (xterm: XTerm) => {
    const _runtime = new Runtime();
    setStatus('Initializing web container...');
    await _runtime.init('surimi');
    setStatus('Initializing terminal...');
    await _runtime.initTerminal(xterm);
    setStatus('Mounting files...');
    await _runtime.mount(files);

    setStatus('Installing dependencies...');
    await _runtime.terminal?.command('pnpm', ['install', '--prefer-offline']);

    setRuntime(_runtime);
    setOutputFilePath('/dist/index.css');

    setStatus('Starting build in watch mode...');
    await _runtime.terminal?.command('export', ['NODE_NO_WARNINGS=1']);
    await _runtime.terminal?.command('clear');
    void _runtime.terminal?.command('pnpm', ['run', 'build']);

    await new Promise(resolve => setTimeout(resolve, 2000));

    setStatus('Done! Enabling editors and terminal...');
    await new Promise(resolve => setTimeout(resolve, 500));

    setStatus(null);
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
      throw new Error(`unable to read file ${filepath}: ${String(err)}`);
    }
  };

  const handleWatchFile = (filepath: string, options: WatchOptions, callback: WatchCallback): (() => void) => {
    if (!runtime) throw new Error('Runtime not yet initialized');

    const watcher = runtime.watch(filepath, options, callback);

    return () => {
      console.log('Stopping watch on file:', filepath);
      watcher.close();
    };
  };

  const handleTerminalResize = (meta: TerminalDimensions) => {
    runtime?.terminal?.setMetadata(meta);
  };

  const handleEditorMount: Editor.OnMount = (_, monaco) => {
    if (!runtime) return;

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
      strict: true,
      alwaysStrict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      noImplicitAny: true,
      strictNullChecks: true,
      allowSyntheticDefaultImports: true,
      isolatedModules: false,
      noUncheckedIndexedAccess: true,
      lib: ['ES2024', 'DOM', 'DOM.Iterable'],
      module: monaco.languages.typescript.ModuleKind.ESNext,
    });

    runtime
      .getTypescriptDefinitions()
      .then(defs => {
        for (const [filename, content] of Object.entries(defs)) {
          const packageName = runtime.getPackageNameFromPath(filename);
          const typeDefs = `declare module '${packageName}' {
            ${content}
          }`;
          monaco.languages.typescript.typescriptDefaults.addExtraLib(typeDefs, filename);
        }
      })
      .catch((err: unknown) => {
        console.error('Failed to get TypeScript definitions from runtime', err);
      });
  };

  const handleRestartCompiler = () => {
    runtime?.terminal
      ?.write('\x03')
      .then(async () => {
        await runtime.terminal?.command('clear');
        void runtime.terminal?.command('pnpm', ['run', 'build']);
      })
      .catch((err: unknown) => {
        console.log(err);
      });
  };

  const handleDownloadProject = () => {
    if (!runtime) return;

    runtime
      .downloadProject()
      .then(zipArray => {
        const blob = new Blob([zipArray], { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'surimi-playground-project.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch((err: unknown) => {
        console.error('Failed to download project', err);
      });
  };

  return (
    <div className="surimi-playground">
      <Editor.Provider>
        <Editor.Header
          disabled={status !== null}
          onRestartCompiler={handleRestartCompiler}
          onDownloadProject={handleDownloadProject}
        />

        <Editor.Root
          tree={files}
          selectedFile={runtime ? 'index.ts' : undefined}
          status={status ?? 'Done'}
          ready={status === null}
          outputFilePath={outputFilePath}
          writeFile={handleWriteFile}
          readFile={handleReadFile}
          watchFile={handleWatchFile}
        >
          <Editor.View onMount={handleEditorMount} />
          <Editor.Panel
            resizable
            hideOverlay
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
    </div>
  );
}

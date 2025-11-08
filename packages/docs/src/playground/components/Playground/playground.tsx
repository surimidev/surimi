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
  const [iframeSrc, setIframeSrc] = useState<string | undefined>();

  const handleTerminalMount = async (xterm: XTerm) => {
    const startTimer = Date.now();
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
    setOutputFilePath('build/index.css.css');

    setStatus('Starting build in watch mode...');
    await _runtime.terminal?.command('export', ['NODE_NO_WARNINGS=1']);
    await _runtime.terminal?.command('clear');

    // Spawning a build watch process in the background, to watch the "actual" output
    await _runtime.spawn('pnpm', ['run', 'build']);

    void _runtime.terminal?.command('pnpm', ['run', 'dev']);

    _runtime.onServerReady((port, url) => {
      console.log(port, url);
      setIframeSrc(url);
    });

    const endTimer = Date.now();
    await new Promise(resolve => setTimeout(resolve, 2000));

    const duration = (endTimer - startTimer) / 1000;
    setStatus(`Ready (initialized in ${duration.toFixed(1)}s)`);
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
        void runtime.terminal?.command('pnpm', ['run', 'dev']);
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
          selectedFile={runtime ? '/src/index.css.ts' : undefined}
          status={status ?? 'Done'}
          ready={status === null}
          outputFilePath={outputFilePath}
          writeFile={handleWriteFile}
          readFile={handleReadFile}
          watchFile={handleWatchFile}
        >
          <Editor.Panel
            resizable
            hideOverlay
            defaultSize={{ width: '50%' }}
            enable={{
              right: true,
            }}
            maxWidth="80%"
            minWidth="20%"
            handleStyles={{ right: { width: '3px' } }}
            handleClasses={{ right: 'resizable-handle-right' }}
            className="surimi-editor__left"
            as="div"
          >
            <Editor.Input onMount={handleEditorMount} />
            <Editor.Terminal onMount={handleTerminalMount} onResize={handleTerminalResize} />
          </Editor.Panel>
          <Editor.Panel
            resizable
            hideOverlay
            defaultSize={{ width: '50%' }}
            enable={false}
            maxWidth="80%"
            minWidth="20%"
            className="surimi-editor__right"
            as="div"
          >
            <Editor.View src={iframeSrc} />
            <Editor.Output />
          </Editor.Panel>
        </Editor.Root>
      </Editor.Provider>
    </div>
  );
}

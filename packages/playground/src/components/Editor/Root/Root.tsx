import { useEffect } from 'react';

import { useEditor } from '#context/editor.context';
import type { CompilerState, FileSystemTree, ReadFileHandler, WatchFileHandler, WriteFileHandler } from '#types';

export interface RootProps extends React.PropsWithChildren {
  tree: FileSystemTree;
  selectedFile: string;
  runtimeReady: boolean;
  compiler: CompilerState;
  readFile: ReadFileHandler;
  watchFile: WatchFileHandler;
  writeFile: WriteFileHandler;
}

export default function Root({
  children,
  tree,
  selectedFile,
  runtimeReady,
  compiler,
  readFile,
  writeFile,
  watchFile,
}: RootProps) {
  const { dispatch } = useEditor();

  useEffect(() => {
    dispatch({ type: 'setCompilerState', data: { state: compiler } });
  }, [compiler]);

  useEffect(() => {
    dispatch({ type: 'setReadFileHandler', data: { handler: readFile } });
  }, [readFile]);

  useEffect(() => {
    dispatch({ type: 'setWriteFileHandler', data: { handler: writeFile } });
  }, [writeFile]);

  useEffect(() => {
    dispatch({ type: 'setWatchFileHandler', data: { handler: watchFile } });
  }, [watchFile]);

  useEffect(() => {
    dispatch({ type: 'setFileTree', data: { tree: tree } });
  }, [tree]);

  useEffect(() => {
    if (runtimeReady) {
      dispatch({ type: 'setActiveFile', data: { filepath: selectedFile } });
    }
  }, [runtimeReady, selectedFile]);

  return <div className="surimi-editor">{children}</div>;
}

import { useEffect } from 'react';

import { useEditor } from '#playground/context/editor.context';
import type { FileSystemTree, ReadFileHandler, WatchFileHandler, WriteFileHandler } from '#playground/types';

export interface RootProps extends React.PropsWithChildren {
  tree: FileSystemTree;
  selectedFile: string | undefined;
  ready: boolean;
  status: string;
  outputFilePath: string | undefined;
  readFile: ReadFileHandler;
  watchFile: WatchFileHandler;
  writeFile: WriteFileHandler;
}

export default function Root({
  children,
  tree,
  status,
  selectedFile,
  ready,
  outputFilePath,
  readFile,
  writeFile,
  watchFile,
}: RootProps) {
  const { dispatch } = useEditor();

  useEffect(() => {
    dispatch({ type: 'setStatus', data: { status } });
  }, [status]);

  useEffect(() => {
    dispatch({ type: 'setOutputFilePath', data: { path: outputFilePath } });
  }, [outputFilePath]);

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
    dispatch({ type: 'setReady', data: { ready } });
  }, [ready]);

  useEffect(() => {
    dispatch({ type: 'setActiveFile', data: { filepath: selectedFile } });
  }, [selectedFile]);

  return <div className="surimi-editor">{children}</div>;
}

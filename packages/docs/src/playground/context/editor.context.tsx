import * as React from 'react';

import type { FileSystemTree, ReadFileHandler, WatchFileHandler, WriteFileHandler } from '#playground/types';

type Action =
  | {
      type: 'setReady';
      data: { ready: boolean };
    }
  | {
      type: 'setStatus';
      data: { status: string };
    }
  | {
      type: 'setActiveFile';
      data: { filepath: string | undefined };
    }
  | {
      type: 'setOutputFilePath';
      data: { path: string | undefined };
    }
  | { type: 'setReadFileHandler'; data: { handler: ReadFileHandler } }
  | { type: 'setWriteFileHandler'; data: { handler: WriteFileHandler } }
  | { type: 'setWatchFileHandler'; data: { handler: WatchFileHandler } }
  | { type: 'setFileTree'; data: { tree: FileSystemTree } };

type Dispatch = (action: Action) => void;
interface EditorProviderProps {
  children: React.ReactNode;
}

interface State {
  ready: boolean;
  status: string;
  activeFile: string | undefined;
  outputFilePath: string | undefined;
  openFiles: Array<{ filepath: string; pendingChanges: boolean }>;
  fileTree: FileSystemTree;
  readFileHandler: ReadFileHandler | undefined;
  writeFileHandler: WriteFileHandler | undefined;
  watchFileHandler: WatchFileHandler | undefined;
}

const DEFAULT_STATE = {
  ready: false,
  status: 'Loading...',
  activeFile: undefined,
  outputFilePath: undefined,
  fileTree: {},
  openFiles: [],
  readFileHandler: undefined,
  writeFileHandler: undefined,
  watchFileHandler: undefined,
} satisfies State;

const EditorStateContext = React.createContext<{ state: State; dispatch: Dispatch } | undefined>(undefined);

function editorReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setReady': {
      return { ...state, ready: action.data.ready };
    }
    case 'setStatus': {
      return { ...state, status: action.data.status };
    }
    case 'setActiveFile': {
      return { ...state, activeFile: action.data.filepath };
    }
    case 'setOutputFilePath': {
      return { ...state, outputFilePath: action.data.path };
    }
    case 'setReadFileHandler': {
      return { ...state, readFileHandler: action.data.handler };
    }
    case 'setWriteFileHandler': {
      return { ...state, writeFileHandler: action.data.handler };
    }
    case 'setWatchFileHandler': {
      return { ...state, watchFileHandler: action.data.handler };
    }
    case 'setFileTree': {
      return { ...state, fileTree: action.data.tree };
    }
    default: {
      throw new Error(`Unhandled action type: ${(action as { type: string }).type}`);
    }
  }
}

function EditorProvider({ children }: EditorProviderProps) {
  const [state, dispatch] = React.useReducer(editorReducer, DEFAULT_STATE);

  const value = { state, dispatch };
  return <EditorStateContext.Provider value={value}>{children}</EditorStateContext.Provider>;
}

function useEditor() {
  const context = React.useContext(EditorStateContext);
  if (context === undefined) {
    throw new Error('useCount must be used within a CountProvider');
  }
  return context;
}

export { EditorProvider, useEditor };

import * as React from 'react';

import type { CompilerState, FileSystemTree, ReadFileHandler, WatchFileHandler, WriteFileHandler } from '#types';

type Action =
  | {
      type: 'setActiveFile';
      data: { filepath: string };
    }
  | {
      type: 'setCompilerState';
      data: { state: CompilerState };
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
  activeFile: string | undefined;
  compiler: CompilerState;
  openFiles: Array<{ filepath: string; pendingChanges: boolean }>;
  fileTree: FileSystemTree;
  readFileHandler: ReadFileHandler | undefined;
  writeFileHandler: WriteFileHandler | undefined;
  watchFileHandler: WatchFileHandler | undefined;
}

const DEFAULT_STATE = {
  activeFile: undefined,
  compiler: {
    state: 'idle',
    error: null,
    outputFilePath: undefined,
    duration: null,
  },
  fileTree: {},
  openFiles: [],
  readFileHandler: undefined,
  writeFileHandler: undefined,
  watchFileHandler: undefined,
} satisfies State;

const EditorStateContext = React.createContext<{ state: State; dispatch: Dispatch } | undefined>(undefined);

function editorReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setActiveFile': {
      return { ...state, activeFile: action.data.filepath };
    }
    case 'setCompilerState': {
      return { ...state, compiler: action.data.state };
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

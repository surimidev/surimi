import type { OnChange, OnMount } from '@monaco-editor/react';
import MonacoEditor from '@monaco-editor/react';
import type { ComponentProps } from 'react';

type MonacoEditorOptions = ComponentProps<typeof MonacoEditor>['options'];

const defaultEditorOptions = {
  minimap: { enabled: false },
  readOnly: false,
  glyphMargin: false,
  lineNumbersMinChars: 1,
  folding: false,
} as const satisfies MonacoEditorOptions;

export interface CodeProps {
  value: string;
  filepath: string | undefined;
  options?: MonacoEditorOptions;
  onChange?: OnChange | undefined;
  onMount?: OnMount | undefined;
}

export default function Code({ value, filepath, options, onChange, onMount }: CodeProps) {
  const handleMount: OnMount = (editor, monaco) => {
    onMount?.(editor, monaco);
  };

  const editorOptions = { ...defaultEditorOptions, ...options };

  if (!filepath) {
    return <div className="surimi-editor__code--no-file"></div>;
  }

  return (
    <MonacoEditor
      className="surimi-editor__code"
      path={filepath}
      value={value}
      options={editorOptions}
      onMount={handleMount}
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      onChange={onChange!}
    />
  );
}

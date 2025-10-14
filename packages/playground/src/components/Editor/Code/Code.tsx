import type { OnChange, OnMount } from '@monaco-editor/react';
import MonacoEditor from '@monaco-editor/react';
import type { ComponentProps } from 'react';

const defaultEditorOptions = {
  minimap: { enabled: false },
} as const satisfies ComponentProps<typeof MonacoEditor>['options'];

export interface CodeProps {
  value: string;
  filepath: string;
  onChange: OnChange;
  onMount: OnMount;
}

export default function Code({ value, filepath, onChange, onMount }: CodeProps) {
  const handleMount: OnMount = (editor, monaco) => {
    onMount(editor, monaco);
  };

  return (
    <MonacoEditor
      className="surimi-editor__code"
      theme="vs-dark"
      path={filepath}
      value={value}
      options={defaultEditorOptions}
      onMount={handleMount}
      onChange={onChange}
    />
  );
}

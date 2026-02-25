import Editor from '@monaco-editor/react';
import type mnco from 'monaco-editor';
import { AutoTypings, LocalStorageCache } from 'monaco-editor-auto-typings/custom-editor';
import { useRef } from 'react';

function setTypeScriptCompilerOptions(monaco: typeof mnco) {
  const ts = monaco.typescript;
  ts.typescriptDefaults.setCompilerOptions({
    strict: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    allowNonTsExtensions: true,
    noEmit: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    allowJs: true,
    checkJs: false,
    jsx: ts.JsxEmit.React,
    resolveJsonModule: true,
    isolatedModules: true,
    skipLibCheck: true,
  });
  ts.javascriptDefaults.setCompilerOptions(ts.typescriptDefaults.getCompilerOptions());
}

export interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  language?: string;
  height?: string;
}

const TYPED_LANGUAGES = new Set(['typescript', 'javascript']);

export default function CodeEditor({
  value,
  onChange,
  readOnly = false,
  language = 'typescript',
  height = '100%',
}: CodeEditorProps) {
  const autoTypingsRef = useRef<Awaited<ReturnType<typeof AutoTypings.create>> | null>(null);

  const handleMount = (editor: mnco.editor.IStandaloneCodeEditor, monaco: typeof mnco) => {
    if (readOnly || !TYPED_LANGUAGES.has(language)) return;
    AutoTypings.create(editor, {
      monaco,
      sourceCache: new LocalStorageCache(),
      debounceDuration: 500,
    })
      .then(instance => {
        autoTypingsRef.current = instance;
      })
      .catch((err: unknown) => {
        console.warn('AutoTypings init failed:', err);
      });
  };

  return (
    <Editor
      height={height}
      language={language}
      options={{
        theme: 'vs-light',
        readOnly,
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
      }}
      value={value}
      onChange={v => onChange?.(v ?? '')}
      beforeMount={setTypeScriptCompilerOptions}
      onMount={handleMount}
    />
  );
}

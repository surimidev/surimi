import Editor from '@monaco-editor/react';
import type mnco from 'monaco-editor';
import { AutoTypings, LocalStorageCache } from 'monaco-editor-auto-typings/custom-editor';
import { useEffect, useRef, useState } from 'react';

import { getMonacoThemeName, registerMonacoThemes } from './monaco-theme';

function beforeMount(monaco: typeof mnco) {
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
  registerMonacoThemes(monaco);
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
  const monacoRef = useRef<typeof mnco | null>(null);
  const [theme, setTheme] = useState<'surimi-light' | 'surimi-dark'>(getMonacoThemeName);

  useEffect(() => {
    setTheme(getMonacoThemeName());
    const el = document.documentElement;
    const observer = new MutationObserver(() => {
      setTheme(getMonacoThemeName());
    });
    observer.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    monacoRef.current?.editor.setTheme(theme);
  }, [theme]);

  const handleBeforeMount = (monaco: typeof mnco) => {
    monacoRef.current = monaco;
    beforeMount(monaco);
  };

  const handleMount = (editor: mnco.editor.IStandaloneCodeEditor, monaco: typeof mnco) => {
    monaco.editor.setTheme(theme);
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
        theme,
        readOnly,
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
      }}
      value={value}
      onChange={v => onChange?.(v ?? '')}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
    />
  );
}

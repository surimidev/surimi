import type { OnMount } from '@monaco-editor/react';
import { useEffect, useState } from 'react';

import Loader from '#playground/components/Loader/Loader';
import { useEditor } from '#playground/context/editor.context';
import { debounce } from '#playground/utils/debounce';

import Code from '../Code/Code';
import Panel from '../Panel/Panel';

import './Input.css';

const FILE_SAVE_DEBOUNCE_MS = 0;

export interface InputProps {
  onMount?: OnMount;
}

export default function Input({ onMount }: InputProps) {
  const { state } = useEditor();
  const [editorValue, setEditorValue] = useState<string>('');

  useEffect(() => {
    const getFileContent = async () => {
      if (!state.activeFile) return undefined;
      console.log('Loading content for file:', state.activeFile);

      const content = await state.readFileHandler?.(state.activeFile);
      setEditorValue(content ?? '');
    };

    void getFileContent();
  }, [state.activeFile, state.readFileHandler]);

  const handleCodeEditorChange = (value: string | undefined) => {
    if (!state.activeFile) {
      throw new Error('A file edit was done but no file is active. Are you a wizard?');
    }

    if (!value) {
      void state.writeFileHandler?.(state.activeFile, '');
    } else {
      void state.writeFileHandler?.(state.activeFile, value);
    }
  };

  const debounceHandleCodeEditorChange = debounce(handleCodeEditorChange, FILE_SAVE_DEBOUNCE_MS);

  return (
    <Panel
      resizable
      enable={{
        bottom: true,
      }}
      defaultSize={{
        height: '60%',
      }}
      handleStyles={{ bottom: { height: '3px' } }}
      handleClasses={{ bottom: 'resizable-handle-bottom' }}
      // Should be 80, but we're leaving some room to not "squeeze" the terminal
      maxHeight="75%"
      minHeight="50%"
      className="surimi-editor__input"
      as="div"
    >
      <Code
        value={editorValue}
        filepath={state.activeFile}
        onChange={debounceHandleCodeEditorChange}
        onMount={onMount}
      />

      {!state.ready && state.status && (
        <div className="surimi-editor__input-overlay">
          <Loader />
          <div className="surimi-editor__input-status">{state.status}</div>
        </div>
      )}
    </Panel>
  );
}

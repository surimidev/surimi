import { useEffect, useState } from 'react';

import Loader from '#components/Loader/Loader';
import { useEditor } from '#context/editor.context';
import { debounce } from '#utils/debounce';

import Code from '../Code/Code';
import Panel from '../Panel/Panel';

import './View.css';

export default function EditorView() {
  const { state } = useEditor();
  const [editorValue, setEditorValue] = useState<string>('');

  useEffect(() => {
    const getFileContent = async () => {
      if (!state.activeFile) return undefined;

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

  const debounceHandleCodeEditorChange = debounce(handleCodeEditorChange, 200);

  return (
    <Panel
      resizable
      enable={{
        right: true,
      }}
      defaultSize={{
        width: '60%',
      }}
      handleStyles={{ right: { width: '3px' } }}
      handleClasses={{ right: 'resizable-handle-right' }}
      maxWidth="80%"
      minWidth="20%"
      className="surimi-editor__view"
      as="div"
    >
      <Code
        value={editorValue}
        filepath={state.activeFile ?? ''}
        onChange={debounceHandleCodeEditorChange}
        onMount={() => {
          /* unused */
        }}
      />

      {!state.ready && state.status && (
        <div className="surimi-editor__view-overlay">
          <Loader />
          <div className="surimi-editor__view-status">{state.status}</div>
        </div>
      )}
    </Panel>
  );
}

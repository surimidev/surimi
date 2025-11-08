import { useEffect, useState } from 'react';

import { useEditor } from '#playground/context/editor.context';

import Code from '../Code/Code';
import Panel from '../Panel/Panel';

import './Output.css';

export default function EditorOutput() {
  const { state } = useEditor();
  const [outputValue, setOutputValue] = useState<string>('');
  const [outputFilePath, setOutputFilePath] = useState<string | undefined>();

  useEffect(() => {
    if (!state.outputFilePath) return undefined;

    const unwatch = state.watchFileHandler?.(state.outputFilePath, { persistent: false }, event => {
      if (event === 'change') {
        console.log('Loading content for file:', state.outputFilePath);

        state
          .readFileHandler?.(state.outputFilePath ?? '/dist/index.css')
          .then(content => {
            setOutputValue(content);
          })
          .catch((err: unknown) => {
            console.error(`Failed to read output file: ${String(err)}`);
          });
      } else {
        setOutputValue('');
        console.warn(`Output file was removed: ${state.outputFilePath}`);
      }
    });

    setOutputFilePath(state.outputFilePath);

    return () => {
      unwatch?.();
    };
  }, [state.outputFilePath, state.readFileHandler]);

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
      maxHeight="90%"
      minHeight="50%"
      className="surimi-editor__output"
      as="div"
    >
      <Code value={outputValue} filepath={outputFilePath} options={{ readOnly: true }} />
    </Panel>
  );
}

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

    const readFile = () => {
      state
        .readFileHandler?.(state.outputFilePath ?? 'build/index.css.css')
        .then(content => {
          setOutputValue(content);
        })
        .catch((err: unknown) => {
          console.error(`Failed to read output file: ${String(err)}`);
        });
    };

    readFile();

    const unwatch = state.watchFileHandler?.(state.outputFilePath, { persistent: false }, event => {
      if (event === 'change') {
        readFile();
      } else {
        setOutputValue('');
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
      enable={{ top: false }}
      defaultSize={{ height: '40%' }}
      maxHeight="50%"
      minHeight="10%"
      className="surimi-editor__output"
      as="div"
    >
      <Code value={outputValue} filepath={outputFilePath} options={{ readOnly: true }} />
    </Panel>
  );
}

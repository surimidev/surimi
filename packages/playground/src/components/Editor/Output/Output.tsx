import { useEffect, useState } from 'react';

import { useEditor } from '#context/editor.context';

import Code from '../Code/Code';
import Panel from '../Panel/Panel';

import './Output.css';

export default function EditorOutput() {
  const { state } = useEditor();
  const [outputValue, setOutputValue] = useState<string>('');
  const [outputFilePath, setOutputFilePath] = useState<string>('dist/index.css');

  useEffect(() => {
    if (!state.compiler.outputFilePath) return undefined;

    const unwatch = state.watchFileHandler?.(
      state.compiler.outputFilePath,
      { persistent: false },
      (event, filename) => {
        console.log(`Output file event: ${event}`, filename);
        const finalFilepath = typeof filename === 'string' ? filename : filename.toString();

        if (event === 'change') {
          state
            .readFileHandler?.(finalFilepath)
            .then(content => {
              setOutputValue(content);
            })
            .catch((err: unknown) => {
              console.error(`Failed to read output file: ${err}`);
            });
        } else {
          setOutputValue('');
          console.warn(`Output file was removed: ${finalFilepath}`);
        }
      },
    );

    setOutputFilePath(state.compiler.outputFilePath);

    return unwatch;
  }, [state.compiler.outputFilePath, state.readFileHandler]);

  return (
    <Panel
      resizable
      enable={{
        bottom: true,
      }}
      defaultSize={{
        height: '70%',
      }}
      maxHeight="90%"
      minHeight="50%"
      className="surimi-editor__output"
      as="div"
    >
      <Code
        value={outputValue}
        filepath={outputFilePath}
        onChange={() => {
          /* unused */
        }}
        onMount={() => {
          /* unused */
        }}
      />
    </Panel>
  );
}

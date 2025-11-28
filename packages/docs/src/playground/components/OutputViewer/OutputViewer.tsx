import { Editor, useContainerkit } from '@containerkit/react';
import { useEffect, useState } from 'react';

import './OutputViewer.css';

export interface OutputViewerProps {
  outputFilePath: string;
}

export default function OutputViewer({ outputFilePath }: OutputViewerProps) {
  const containerkit = useContainerkit();
  const [outputContent, setOutputContent] = useState<string>('');

  useEffect(() => {
    if (!containerkit || !outputFilePath) return;

    const readOutputFile = async () => {
      try {
        const content = await containerkit.readFile(outputFilePath);
        setOutputContent(content ?? '');
      } catch (error) {
        console.error('Failed to read output file:', error);
        setOutputContent('// Output file not found');
      }
    };

    void readOutputFile();

    // Watch for changes to the output file
    const watcher = containerkit.watch(outputFilePath, { persistent: false }, event => {
      if (event === 'change') {
        void readOutputFile();
      }
    });

    return () => {
      watcher?.close();
    };
  }, [containerkit, outputFilePath]);

  return (
    <div className="surimi-playground__output">
      <div className="surimi-playground__output-header">
        <h3>Output</h3>
        <span className="surimi-playground__output-path">{outputFilePath}</span>
      </div>
      <div className="surimi-playground__output-content">
        <Editor value={outputContent} monacoOptions={{ theme: 'vs-light', readOnly: true }} />
      </div>
    </div>
  );
}

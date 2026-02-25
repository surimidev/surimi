import { AnsiHtml } from 'fancy-ansi/react';

import type { CompileResult } from '@surimi/compiler';

import CodeEditor from '#playground/components/Editor/CodeEditor';

import './OutputViewer.css';

export interface OutputViewerProps {
  /** Compiled result to display. */
  result: CompileResult | undefined;
  error: string | undefined;
}

export default function OutputViewer({ result, error }: OutputViewerProps) {
  return (
    <div className="surimi-playground__output">
      <div className="surimi-playground__output-header">
        <h3>Output</h3>
        <span className="surimi-playground__output-path">
          output.css
          {result && ` (compiled in ${result.duration}ms)`}
        </span>
      </div>
      <div className="surimi-playground__output-content">
        {error && (
          <div className="surimi-playground__output-error">
            <AnsiHtml text={error} />
          </div>
        )}
        {!error && result && <CodeEditor value={result.css} readOnly language="css" />}
      </div>
    </div>
  );
}

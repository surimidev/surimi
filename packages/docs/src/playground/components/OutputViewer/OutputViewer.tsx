import CodeEditor from '#playground/components/Editor/CodeEditor';

import './OutputViewer.css';

export interface OutputViewerProps {
  /** Compiled CSS output to display. */
  css: string;
}

export default function OutputViewer({ css }: OutputViewerProps) {
  return (
    <div className="surimi-playground__output">
      <div className="surimi-playground__output-header">
        <h3>Output</h3>
        <span className="surimi-playground__output-path">index.css</span>
      </div>
      <div className="surimi-playground__output-content">
        <CodeEditor value={css} readOnly language="css" />
      </div>
    </div>
  );
}

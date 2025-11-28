import './PreviewPanel.css';

export interface PreviewPanelProps {
  src?: string | undefined;
}

export default function PreviewPanel({ src }: PreviewPanelProps) {
  return (
    <div className="surimi-playground__preview">
      <div className="surimi-playground__preview-header">
        <h3>Preview</h3>
        {src && <span className="surimi-playground__preview-url">{src}</span>}
      </div>
      <div className="surimi-playground__preview-content">
        {src ? (
          <iframe className="surimi-playground__preview-iframe" src={src} title="Preview" />
        ) : (
          <div className="surimi-playground__preview-empty">Waiting for development server...</div>
        )}
      </div>
    </div>
  );
}

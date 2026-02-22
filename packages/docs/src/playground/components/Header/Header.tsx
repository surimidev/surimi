import './Header.css';

export interface HeaderProps {
  disabled?: boolean;
  onRestartCompiler?: () => void;
  onDownloadProject?: () => void;
}

export default function Header({ disabled, onRestartCompiler, onDownloadProject }: HeaderProps) {
  return (
    <div className="surimi-playground__header">
      <h1>🍣 Surimi Playground</h1>
      <a href="/">home</a>
      <div className="surimi-playground__header-actions">
        <button disabled={disabled} onClick={onRestartCompiler} type="button">
          Restart Server
        </button>
        <button disabled={disabled} onClick={onDownloadProject} className="button-secondary" type="button">
          Download Project
        </button>
      </div>
    </div>
  );
}

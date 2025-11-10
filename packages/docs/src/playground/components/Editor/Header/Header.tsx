import './Header.css';

export interface HeaderProps {
  disabled?: boolean;
  onRestartCompiler?: () => void;
  onDownloadProject?: () => void;
}

export default function Header({ disabled, onRestartCompiler, onDownloadProject }: HeaderProps) {
  return (
    <div className="surimi-editor__header">
      <h1>Surimi playground</h1>
      <div className="surimi-editor__header-right">
        <button disabled={disabled} onClick={onRestartCompiler}>
          Restart server
        </button>
        <button disabled={disabled} onClick={onDownloadProject} className="button-secondary">
          Download Project
        </button>
      </div>
    </div>
  );
}

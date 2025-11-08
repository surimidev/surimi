import Panel from '../Panel/Panel';

import './View.css';

export interface ViewProps {
  src?: string | undefined;
}

export default function View({ src }: ViewProps) {
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
      className="surimi-editor__view"
      as="div"
    >
      <iframe className="surimi-editor__view__iframe" src={src} />
    </Panel>
  );
}

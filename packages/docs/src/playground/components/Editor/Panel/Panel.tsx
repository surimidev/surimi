import clsx from 'clsx';
import type { ResizableProps } from 're-resizable';
import { Resizable } from 're-resizable';

import { useEditor } from '#playground/context/editor.context';

import './Panel.css';

interface PanelBaseProps {
  hideOverlay?: boolean;
}

export type PanelProps = (
  | ({
      resizable: true;
    } & ResizableProps & { as: keyof React.JSX.IntrinsicElements })
  | ({ resizable: false } & React.ComponentProps<'div'>)
) &
  PanelBaseProps;

export default function Panel({ className, children, hideOverlay, ...props }: PanelProps) {
  const { state } = useEditor();
  const { resizable, ...rest } = props;

  const ContainerElement = resizable ? Resizable : 'div';

  return (
    <ContainerElement className={clsx('surimi-editor__panel', className)} {...rest}>
      {children}
      {!state.ready && !hideOverlay && <div className="surimi-editor__panel-overlay" />}
    </ContainerElement>
  );
}

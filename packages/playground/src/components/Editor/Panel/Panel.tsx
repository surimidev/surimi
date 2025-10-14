import clsx from 'clsx';
import type { ResizableProps } from 're-resizable';
import { Resizable } from 're-resizable';

export type PanelProps =
  | ({
      resizable: true;
    } & ResizableProps & { as: keyof React.JSX.IntrinsicElements })
  | ({ resizable: false } & React.ComponentProps<'div'>);

export default function Panel({ className, children, ...props }: PanelProps) {
  if (props.resizable) {
    const { resizable, ...rest } = props;
    return (
      <Resizable className={clsx('surimi-editor__panel', className)} {...rest}>
        {children}
      </Resizable>
    );
  } else {
    const { resizable, ...rest } = props;

    return (
      <div className={clsx('surimi-editor__panel', className)} {...rest}>
        {children}
      </div>
    );
  }
}

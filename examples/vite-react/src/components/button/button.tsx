import clsx from 'clsx';

import { button } from './button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  kind: 'primary' | 'secondary';
}

export default function Button({ children, kind, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(button, {
        'button--primary': kind === 'primary',
        'button--secondary': kind === 'secondary',
      })}
      {...props}
    >
      {children}
    </button>
  );
}

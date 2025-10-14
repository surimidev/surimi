import type { Terminal as XTerm } from '@xterm/xterm';
import { useEffect, useRef } from 'react';

import type { TerminalDimensions } from '#types/terminal.types.js';

import Panel from '../Panel/Panel';

import '@xterm/xterm/css/xterm.css';
import './Terminal.css';

export interface TerminalProps {
  onMount: (xterm: XTerm) => void | Promise<void>;
  onResize?: (terminalMeta: TerminalDimensions) => void | Promise<void>;
}

export default function Terminal({ onMount, onResize }: TerminalProps) {
  const terminalElementRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm>(null);

  useEffect(() => {
    const initializeXterm = async () => {
      const { Terminal: XTerm } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');
      const { WebLinksAddon } = await import('@xterm/addon-web-links');

      const element = terminalElementRef.current;

      if (!element) {
        throw new Error('Terminal element not found');
      }

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      const terminal = new XTerm({
        cursorBlink: true,
        convertEol: true,
        fontFamily: 'IBM Plex Mono, courier-new, courier, monospace',
        theme: {
          background: '#1e1e1e',
        },
      });

      terminalRef.current = terminal;

      terminal.loadAddon(fitAddon);
      terminal.loadAddon(webLinksAddon);
      terminal.open(element);

      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
        void onResize?.({ rows: terminal.rows, cols: terminal.cols });
      });

      resizeObserver.observe(element);

      void onMount(terminal);

      return [terminal, resizeObserver] as const;
    };

    const res = initializeXterm();

    return () => {
      void res.then(([terminal, resizeObserver]) => {
        terminal.dispose();
        resizeObserver.disconnect();
      });
    };
  }, []);

  return (
    <Panel
      resizable
      enable={{ top: false }}
      defaultSize={{ height: '30%' }}
      maxHeight="50%"
      minHeight="10%"
      className="surimi-editor__terminal"
      as="div"
    >
      <div className="surimi-editor__terminal__instance" ref={terminalElementRef} />
    </Panel>
  );
}

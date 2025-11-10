import type { Terminal as XTerm } from '@xterm/xterm';
import { useEffect, useRef } from 'react';

import type { TerminalDimensions } from '#playground/types/terminal.types.js';

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
          foreground: '#383a42',
          background: '#ffffff',
          cursor: '#bfceff',
          black: '#383a42',
          red: '#e45649',
          green: '#50a14f',
          yellow: '#c18401',
          blue: '#4078f2',
          magenta: '#a626a4',
          cyan: '#0184bc',
          white: '#a0a1a7',
          brightBlack: '#696c77',
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
      defaultSize={{ height: '40%' }}
      maxHeight="50%"
      minHeight="20%"
      className="surimi-editor__terminal"
      as="div"
    >
      <div className="surimi-editor__terminal__instance" ref={terminalElementRef} />
    </Panel>
  );
}

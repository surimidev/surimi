import type { WebContainer, WebContainerProcess } from '@webcontainer/api';

import type { TerminalDimensions } from '#playground/types';

export default class Terminal {
  private _instance: WebContainer | undefined;
  private _shellProcess: WebContainerProcess | undefined;
  private _shellProcessWriter: WritableStreamDefaultWriter<string> | undefined;
  private _pendingReadyResolvers: Array<() => void> = [];
  private _outputStream: WritableStream<string> | undefined;

  constructor(webContainerInstance: WebContainer) {
    this._instance = webContainerInstance;
  }

  public async init(terminalMetadata: TerminalDimensions) {
    if (!this._instance) throw new Error('Instance not initialized');

    this._shellProcess = await this._instance.spawn('/bin/jsh', ['--osc'], {
      terminal: {
        cols: terminalMetadata.cols,
        rows: terminalMetadata.rows,
      },
    });
  }

  public registerTerminalStreams(outputStream: WritableStream<string>, inputStream: ReadableStream<string>) {
    if (!this._instance) throw new Error('Instance not initialized');
    if (!this._shellProcess) throw new Error('Shell process not initialized');

    // Create an intercepting output stream that monitors for interactive OSC
    this._outputStream = new WritableStream<string>({
      write: data => {
        // Check for prompt OSC code (terminal ready for input)
        // eslint-disable-next-line no-control-regex
        const [, osc] = /\x1b\]654;([^\x07]+)/.exec(data) ?? [];

        if (osc === 'prompt') {
          // Resolve all pending waitForReady promises
          const resolvers = [...this._pendingReadyResolvers];
          this._pendingReadyResolvers.length = 0; // Clear the array
          resolvers.forEach(resolve => {
            resolve();
          });
        }

        // Forward the data to the original output stream
        const writer = outputStream.getWriter();
        void writer.write(data).finally(() => {
          writer.releaseLock();
        });
      },
    });

    void this._shellProcess.output.pipeTo(this._outputStream);

    this._shellProcessWriter = this._shellProcess.input.getWriter();
    void inputStream.pipeTo(
      new WritableStream({
        write: chunk => {
          if (this._shellProcessWriter) {
            void this._shellProcessWriter.write(chunk);
          }
        },
      }),
    );
  }

  public setMetadata(terminalMetadata: TerminalDimensions) {
    this._shellProcess?.resize(terminalMetadata);
  }

  public async write(content: string) {
    if (!this._instance) throw new Error('Instance not initialized');
    if (!this._shellProcessWriter) throw new Error('Shell process not initialized');

    await this._shellProcessWriter.write(content);
    await this.waitForReady();
  }

  public async command(command: string, args: string[] = []) {
    if (!this._instance) throw new Error('Instance not initialized');
    if (!this._shellProcessWriter) throw new Error('Shell process not initialized');

    const fullCommand = [command, ...args].join(' ') + '\n';
    await this.write(fullCommand);
  }

  /**
   * Wait for the terminal to be ready for the next interaction.
   * This resolves when the terminal emits the 'interactive' OSC code.
   * Can be called multiple times - each call waits for the NEXT ready state.
   */
  public waitForReady(): Promise<void> {
    return new Promise<void>(resolve => {
      this._pendingReadyResolvers.push(resolve);
    });
  }
}

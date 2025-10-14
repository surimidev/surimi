import type { WebContainer, WebContainerProcess } from '@webcontainer/api';

import type { TerminalDimensions } from '#types';

export default class Terminal {
  private _instance: WebContainer | undefined;
  private _shellProcess: WebContainerProcess | undefined;
  private _shellProcessWriter: WritableStreamDefaultWriter<string> | undefined;

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

    void this._shellProcess.output.pipeTo(outputStream);

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
    return this._shellProcessWriter?.write(content);
  }
}

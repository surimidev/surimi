import type { FSWatchCallback, FSWatchOptions } from '@webcontainer/api';
import { WebContainer } from '@webcontainer/api';
import type { Terminal as XTerm } from '@xterm/xterm';

import type { FileSystemTree } from '#types';

import Terminal from './terminal.runtime';

export default class Runtime {
  protected _instance: WebContainer | undefined;

  public terminal: Terminal | undefined;

  /**
   * Initialize the runtime. This does not mount anything, nor does it create a terminal.
   *
   * @returns A teardown function
   */
  public async init(
    /** The name of the project, used to mount as a folder under /home.
     * Will be the default working directory
     */
    name: string,
  ) {
    if (this._instance) throw Error('A project instance is already initialized. Please destroy that one first.');

    console.log('Booting webcontainer');
    const webContainerInstance = await WebContainer.boot({
      workdirName: name,
    });
    this._instance = webContainerInstance;

    return () => {
      this._instance?.teardown();
    };
  }

  public teardown() {
    if (!this._instance) throw new Error('Instance not initialized');

    this._instance.teardown();
  }

  public async mount(files: FileSystemTree) {
    if (!this._instance) throw new Error('Instance not initialized');

    await this._instance.mount(files);
  }

  public watch(path: string, options?: FSWatchOptions, listener?: FSWatchCallback) {
    if (!this._instance) throw new Error('Instance not initialized');

    return this._instance.fs.watch(path, options, listener);
  }

  public run(command: string, args: string[] = []) {
    if (!this._instance) throw new Error('Instance not initialized');

    return this._instance.spawn(command, args);
  }

  public async writeFile(path: string, content: string) {
    if (!this._instance) throw new Error('Instance not initialized');

    return this._instance.fs.writeFile(path, content);
  }

  public async readFile(path: string) {
    if (!this._instance) throw new Error('Instance not initialized');

    return this._instance.fs.readFile(path, 'utf8');
  }

  /**
   * Creates a Terminal instance on the project, initializes it and binds it to the given xterm instance
   * using streams. Things like terminal resizing are not handled by this.
   */
  public async initTerminal(xterm: XTerm) {
    if (!this._instance) throw new Error('Instance not initialized');

    this.terminal = new Terminal(this._instance);

    const terminalReady = Promise.withResolvers<void>();
    let isInteractive = false;

    const outputStream = new WritableStream<string>({
      write(data) {
        if (!isInteractive) {
          const [, osc] = /\x1b\]654;([^\x07]+)\x07/.exec(data) ?? [];

          if (osc === 'interactive') {
            // wait until we see the interactive OSC
            isInteractive = true;

            terminalReady.resolve();
          }
        }

        xterm.write(data);
      },
    });

    const inputStream = new TransformStream<string, string>();
    const inputStreamWriter = inputStream.writable.getWriter();
    xterm.onData(data => {
      void inputStreamWriter.write(data);
    });

    await this.terminal.init({
      rows: xterm.rows,
      cols: xterm.cols,
    });

    this.terminal.registerTerminalStreams(outputStream, inputStream.readable);

    await terminalReady.promise;
  }

  public onServerReady(callback: (port: number, url: string) => void) {
    if (!this._instance) throw new Error('Instance not initialized');

    return this._instance.on('server-ready', callback);
  }
}

import type { FSWatchCallback, FSWatchOptions } from '@webcontainer/api';
import { WebContainer } from '@webcontainer/api';
import type { Terminal as XTerm } from '@xterm/xterm';

import type { FileSystemTree } from '#playground/types';

import Terminal from './terminal.runtime';

export default class Runtime {
  protected _instance: WebContainer | undefined;

  public terminal: Terminal | undefined;
  public xterm: XTerm | undefined;

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
    this.xterm = xterm;

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

  public spawn(command: string, args?: string[]) {
    if (!this._instance) throw new Error('Instance not initialized');

    return this._instance.spawn(command, args ?? []);
  }

  public onServerReady(callback: (port: number, url: string) => void) {
    if (!this._instance) throw new Error('Instance not initialized');

    return this._instance.on('server-ready', callback);
  }

  private async getSymlinkType(path: string) {
    if (!this._instance) throw new Error('Instance not initialized');

    // try to read a directory at the path and catch the error,
    // In case of error, try to instead read it as a file
    // if both fail, return 'none'
    try {
      await this._instance.fs.readdir(path);
      return 'dir';
    } catch {
      try {
        await this._instance.fs.readFile(path);
        return 'file';
      } catch {
        return 'none';
      }
    }
  }

  private async _walkDirectory(dir: string) {
    if (!this._instance) throw new Error('Instance not initialized');
    const instance = this._instance;

    const fsMap = new Map<string, string>();

    const entries = await this._instance.fs.readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name.startsWith('.')) continue; // skip dot directories/files

      const full = `${dir}/${ent.name}`;

      const handleFile = async (path: string) => {
        if (path.endsWith('.d.ts') || path.endsWith('.ts')) {
          const content = await instance.fs.readFile(path, 'utf-8');
          fsMap.set(path, content);
        }
      };

      const handleDir = async (path: string) => {
        const res = await this._walkDirectory(path);
        for (const [k, v] of Object.entries(res)) {
          fsMap.set(k, v);
        }
      };

      if (ent.isFile()) {
        await handleFile(full);
      } else if (ent.isDirectory()) {
        await handleDir(full);
      } else {
        // could be a symlink
        const type = await this.getSymlinkType(full);
        if (type === 'file') {
          await handleFile(full);
        } else if (type === 'dir') {
          await handleDir(full);
        } else {
          console.log('could not interpret file for loading types', full);
        }
      }
    }

    return Object.fromEntries(fsMap);
  }

  /**
   * Given a path like /node_modules/some-package/sub/path/file.d.ts, return the package name (some-package)
   * if it exists in a scope (like /node_modules/@scope/some-package/sub/path/file.d.ts), return the full scoped name (@scope/some-package)
   */
  public getPackageNameFromPath(path: string) {
    const match = /^\/node_modules\/(@[^/]+\/[^/]+|[^/]+)\//.exec(path);
    return match ? match[1] : undefined;
  }

  /**
   * Get all TypeScript definitions for the project's node_modules
   */
  public async getTypescriptDefinitions() {
    if (!this._instance) throw new Error('Instance not initialized');

    const types = this._walkDirectory('/node_modules');

    return types;
  }

  public async downloadProject(): Promise<Uint8Array> {
    if (!this._instance) throw new Error('Instance not initialized');

    console.log('Starting export...');
    const zip = await this._instance.export('/home/surimi', { format: 'zip', excludes: ['**/node_modules/**'] });
    return zip;
  }
}

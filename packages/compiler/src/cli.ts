#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, resolve } from 'node:path';
import process from 'node:process';
import { cancel, intro, log, outro, spinner } from '@clack/prompts';
import chokidar from 'chokidar';

import compile from '#compiler';

interface CLIOptions {
  input: string;
  outDir?: string;
  cwd?: string;
  include?: string[];
  exclude?: string[];
  noJs?: boolean;
  watch?: boolean;
  help?: boolean;
}

function showHelp() {
  intro('Surimi CSS Compiler');
  console.log(`
Usage: surimi compile <input> [options]

Commands:
  compile <input>       Compile a TypeScript file to CSS

Options:
  -o, --out-dir, --out <path>       Output directory (default: same as input file)
  -c, --cwd <path>      Working directory (default: current directory)
  --include <patterns>  Include patterns (comma-separated)
  --exclude <patterns>  Exclude patterns (comma-separated)
  --watch               Watch for changes and recompile
  --no-js               Skip JavaScript file generation
  -h, --help            Show help

Examples:
  surimi compile src/styles.ts
  surimi compile src/styles.ts --outDir dist
  surimi compile src/styles.ts --include "**/*.ts,**/*.tsx" --no-js
`);
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    input: '',
    cwd: process.cwd(),
    include: ['**/*.ts', '**/*.tsx'],
    exclude: ['**/*.d.ts', '**/node_modules/**'],
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case 'compile':
        if (i + 1 < args.length) {
          const nextArg = args[++i];
          if (nextArg) options.input = nextArg;
        } else {
          throw new Error('Missing input file for compile command');
        }
        break;
      case '-o':
      case '--out-dir':
      case '--out':
        if (i + 1 < args.length) {
          const nextArg = args[++i];
          if (nextArg) options.outDir = nextArg;
        } else {
          throw new Error('Missing output directory path');
        }
        break;
      case '-c':
      case '--cwd':
        if (i + 1 < args.length) {
          const nextArg = args[++i];
          if (nextArg) options.cwd = nextArg;
        } else {
          throw new Error('Missing working directory path');
        }
        break;
      case '--include':
        if (i + 1 < args.length) {
          const nextArg = args[++i];
          if (nextArg) options.include = nextArg.split(',').map(p => p.trim());
        } else {
          throw new Error('Missing include patterns');
        }
        break;
      case '--exclude':
        if (i + 1 < args.length) {
          const nextArg = args[++i];
          if (nextArg) options.exclude = nextArg.split(',').map(p => p.trim());
        } else {
          throw new Error('Missing exclude patterns');
        }
        break;
      case '--watch':
        options.watch = true;
        break;
      case '--no-js':
        options.noJs = true;
        break;
      case '-h':
      case '--help':
        options.help = true;
        break;
      default:
        // If no command specified yet and it doesn't start with -, treat as input
        if (!options.input && arg && !arg.startsWith('-')) {
          options.input = arg;
        }
        break;
    }
  }

  return options;
}

function generateOutputPaths(inputPath: string, outDir?: string): { css: string; js: string } {
  const parsed = {
    dir: outDir ?? dirname(inputPath),
    name: basename(inputPath, extname(inputPath)),
  };

  return {
    css: resolve(parsed.dir, `${parsed.name}.css`),
    js: resolve(parsed.dir, `${parsed.name}.js`),
  };
}

async function runCompile(options: CLIOptions) {
  const { input, cwd = process.cwd(), include = [], exclude = [], outDir, noJs = false } = options;

  if (!input) {
    cancel('Input file is required');
    process.exit(1);
  }

  const inputPath = resolve(cwd, input);

  if (!existsSync(inputPath)) {
    cancel(`Input file does not exist: ${inputPath}`);
    process.exit(1);
  }

  const outputPaths = generateOutputPaths(inputPath, outDir ? resolve(cwd, outDir) : undefined);

  try {
    intro('🍣 @surimi/compiler');
    const s = spinner();
    const filename = basename(inputPath);
    let initialCompileTime: number | null = null;

    if (options.watch) {
      log.info(`ℹ️  Running in watch mode. Press 'q' to quit.`);
    }

    s.start(`${options.watch ? 'Watching' : 'Compiling'} ${filename}...`);

    const compileAndLog = async () => {
      try {
        const startTimer = Date.now();
        const result = await compile({
          inputPath,
          cwd,
          include,
          exclude,
        });
        const endTimer = Date.now();

        if (!result) {
          s.stop('❌ Compilation failed: No result returned');
          return null;
        }

        // Ensure output directory exists
        await mkdir(dirname(outputPaths.css), { recursive: true });

        // Write CSS output
        await writeFile(outputPaths.css, result.css, 'utf8');

        // Optionally write JS output
        if (!noJs) {
          await writeFile(outputPaths.js, result.js, 'utf8');
        }

        const durationMs = endTimer - startTimer;
        s.message(`✅ Compilation complete in ${String(durationMs)}ms`);
        return durationMs;
      } catch (error) {
        log.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
      }

      return null;
    };

    if (options.watch) {
      await new Promise<void>(resolve => {
        const watcher = chokidar.watch(inputPath, {
          ignored: exclude,
          persistent: true,
        });

        // Cleanup function to restore terminal state
        const cleanup = () => {
          try {
            if (process.stdin.isTTY) {
              process.stdin.setRawMode(false);
              process.stdin.pause();
            }
          } catch {
            // Ignore errors during cleanup
          }
        };

        // Handle process termination
        process.on('SIGINT', () => {
          cleanup();
          watcher.close().catch(console.error);
          process.exit(0);
        });

        process.on('SIGTERM', () => {
          cleanup();
          watcher.close().catch(console.error);
          process.exit(0);
        });

        // Set up keyboard input handling
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(true);
          process.stdin.resume();
          process.stdin.setEncoding('utf8');

          const onKeyPress = (key: string) => {
            if (key === 'q' || key === '\u0003') {
              // 'q' or Ctrl+C
              s.stop('ℹ️  Exiting watch mode...');
              cleanup();
              watcher
                .close()
                .then(() => {
                  resolve();
                })
                .catch(console.error);
            }
          };

          process.stdin.on('data', onKeyPress);
        }

        const onChange = () => {
          s.message(`✅ Compilation done in ${initialCompileTime}ms`);
          void compileAndLog().then(time => {
            // if the last compilation was successfull, show the watching message
            // Else, we continue showing the error.
            if (time) {
              setTimeout(() => {
                s.message(`🔍 Watching ${filename}...`);
              }, 1000);
            }
          });
        };

        onChange();

        watcher.on('change', onChange);
        watcher.on('unlink', () => {
          s.stop(`ℹ️  File ${basename(inputPath)} was unlinked`);
          cleanup();
          watcher
            .close()
            .then(() => {
              resolve();
            })
            .catch(console.error);
        });
      });
    } else {
      initialCompileTime = await compileAndLog();

      if (initialCompileTime) {
        s.stop(`✅ Compilation completed in ${String(initialCompileTime)}ms`);
      } else {
        s.stop('❌ Compilation failed due to errors above');
      }
    }

    outro(`👋 Thanks for using surimi!`);
  } catch (error) {
    cancel(`Compilation failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    process.exit(0);
  }

  try {
    const options = parseArgs(args);

    if (options.help) {
      showHelp();
      process.exit(0);
    }

    await runCompile(options);
  } catch (error) {
    cancel(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main().catch(console.error);

#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, resolve } from 'node:path';
import process from 'node:process';
import { cancel, intro, log, note, outro, spinner } from '@clack/prompts';
import { Command } from 'commander';

import { compile, compileWatch } from '.';
import { version } from '../package.json';

interface CLIOptions {
  input: string;
  outDir?: string;
  cwd?: string;
  include?: string[];
  exclude?: string[];
  noJs?: boolean;
  watch?: boolean;
}
const DEFAULT_INCLUDE = ['**/*.ts', '**/*.tsx'] as const satisfies string[];
const DEFAULT_EXCLUDE = ['**/*.d.ts', '**/node_modules/**'] as const satisfies string[];
const DEFAULT_OUT_DIR = './dist';

interface CompileCommandRuntimeOptions {
  include?: unknown;
  exclude?: unknown;
  cwd?: unknown;
  outDir?: unknown;
  watch?: unknown;
  js?: unknown;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry): entry is string => typeof entry === 'string');
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

/**
 * Writes compilation results to disk
 */
async function writeCompilationOutput(
  result: Awaited<ReturnType<typeof compile>>,
  outputPaths: { css: string; js: string },
  options: { noJs: boolean },
): Promise<void> {
  if (!result) {
    throw new Error('No compilation result to write');
  }

  // Ensure output directory exists
  await mkdir(dirname(outputPaths.css), { recursive: true });

  // Write CSS output
  await writeFile(outputPaths.css, result.css, 'utf8');

  // Optionally write JS output
  if (!options.noJs) {
    await writeFile(outputPaths.js, result.js, 'utf8');
  }
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
  const compileOptions = { inputPath, cwd, include, exclude };

  try {
    intro(`🍣 @surimi/compiler (v${version})`);
    note('Surimi is still in early development. Please report any issues you encounter!', 'Warning: Early Development');

    const s = spinner();
    const filename = basename(inputPath);

    if (options.watch) {
      log.info(`Running in watch mode. Press 'q' to quit.`);
      await runWatchMode(compileOptions, outputPaths, { noJs }, s, filename);
    } else {
      await runSingleCompile(compileOptions, outputPaths, { noJs }, s, filename);
    }

    outro(`Thanks for using surimi! 👋`);
  } catch (error) {
    cancel(`Compilation failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

/**
 * Run a single compilation without watch mode
 */
async function runSingleCompile(
  compileOptions: Parameters<typeof compile>[0],
  outputPaths: { css: string; js: string },
  options: { noJs: boolean },
  s: ReturnType<typeof spinner>,
  filename: string,
): Promise<void> {
  s.start(`Compiling ${filename}...`);

  try {
    const result = await compile(compileOptions);

    if (!result) {
      s.stop('Compilation failed: No result returned');
      process.exit(1);
    }

    await writeCompilationOutput(result, outputPaths, options);

    s.stop(`Compilation completed in ${String(result.duration)}ms`);
  } catch (error) {
    s.stop('Compilation failed');
    log.error(`${error instanceof Error ? error.message : String(error)}\n`);
    throw error;
  }
}

/**
 * Run compilation in watch mode
 */
async function runWatchMode(
  compileOptions: Parameters<typeof compile>[0],
  outputPaths: { css: string; js: string },
  options: { noJs: boolean },
  s: ReturnType<typeof spinner>,
  filename: string,
): Promise<void> {
  s.start(`Watching ${filename}...`);

  await new Promise<void>(resolve => {
    const watcher = compileWatch(compileOptions, {
      onChange: result => {
        (async () => {
          try {
            if (!result) {
              s.message(`❌ Build failed - Watching...`);
              return;
            }

            await writeCompilationOutput(result, outputPaths, options);

            s.message(`✅ Compiled in ${result.duration}ms. Watching...`);
          } catch (error) {
            log.error(`${error instanceof Error ? error.message : String(error)}\n`);
            s.message(`❌ Error writing files - Watching...`);
          }
        })().catch(console.error);
      },
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
    const handleExit = () => {
      cleanup();
      watcher.close().catch(console.error);
      process.exit(0);
    };

    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);

    // Set up keyboard input handling for 'q' to quit
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');

      const onKeyPress = (key: string) => {
        if (key === 'q' || key === '\u0003') {
          // 'q' or Ctrl+C
          s.stop('ℹ Exiting watch mode...');
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
  });
}

async function main() {
  const program = new Command();

  program.name('surimi').description('🍣 @surimi/compiler').version(version).showHelpAfterError();

  program.addHelpText(
    'after',
    `\nExamples:\n  surimi compile src/styles.css.ts\n  surimi compile src/styles.css.ts --out-dir dist\n  surimi compile src/styles.css.ts --include src/**/*.ts --no-js\n`,
  );

  const compileCommand = new Command('compile')
    .argument('<input>', 'Path to the .css.ts file to compile')
    .option('-o, --out-dir <path>', 'Output directory', DEFAULT_OUT_DIR)
    .option('-c, --cwd <path>', 'Working directory', process.cwd())
    .option('-w, --watch', 'Watch for changes and recompile')
    .option('--no-js', 'Skip JavaScript file generation')
    .option('--include <pattern...>', 'Include glob patterns', DEFAULT_INCLUDE)
    .option('--exclude <pattern...>', 'Exclude glob patterns', DEFAULT_EXCLUDE)
    .action(async (input: string, rawOptions: CompileCommandRuntimeOptions) => {
      const includeCandidate = rawOptions.include;
      const excludeCandidate = rawOptions.exclude;
      const cwdCandidate = rawOptions.cwd;
      const outDirCandidate = rawOptions.outDir;
      const watchCandidate = rawOptions.watch;
      const jsCandidate = rawOptions.js;

      const include = isStringArray(includeCandidate) ? includeCandidate : DEFAULT_INCLUDE;
      const exclude = isStringArray(excludeCandidate) ? excludeCandidate : DEFAULT_EXCLUDE;
      const cwd = typeof cwdCandidate === 'string' && cwdCandidate.length > 0 ? cwdCandidate : process.cwd();
      const outDir =
        typeof outDirCandidate === 'string' && outDirCandidate.length > 0 ? outDirCandidate : DEFAULT_OUT_DIR;
      const watch = watchCandidate === true;
      const noJs = jsCandidate === false;

      await runCompile({
        input,
        cwd,
        outDir,
        include,
        exclude,
        watch,
        noJs,
      });
    });

  program.addCommand(compileCommand, { isDefault: true });

  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  log.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

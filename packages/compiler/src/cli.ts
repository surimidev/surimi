#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, resolve } from 'node:path';
import process from 'node:process';
import { cancel, intro, outro, spinner } from '@clack/prompts';

import compile from '#compiler';

interface CLIOptions {
  input: string;
  outDir?: string;
  cwd?: string;
  include?: string[];
  exclude?: string[];
  noJs?: boolean;
  help?: boolean;
}

function showHelp() {
  intro('Surimi CSS Compiler');
  console.log(`
Usage: surimi compile <input> [options]

Commands:
  compile <input>       Compile a TypeScript file to CSS

Options:
  -o, --outDir <path>       Output directory (default: same as input file)
  -c, --cwd <path>      Working directory (default: current directory)
  --include <patterns>  Include patterns (comma-separated)
  --exclude <patterns>  Exclude patterns (comma-separated)
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
      case '--outDir':
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
    s.start(`Compiling ${basename(inputPath)}...`);

    const result = await compile({
      inputPath,
      cwd,
      include,
      exclude,
    });

    if (!result) {
      s.stop('Compilation failed: No result returned');
      cancel('Compilation failed');
      process.exit(1);
    }

    // Ensure output directory exists
    await mkdir(dirname(outputPaths.css), { recursive: true });

    // Write CSS output
    await writeFile(outputPaths.css, result.css, 'utf8');

    // Optionally write JS output
    if (!noJs) {
      await writeFile(outputPaths.js, result.js, 'utf8');
    }

    s.stop('✅ Compilation complete');

    outro(`✅ Emitted ${noJs ? '1' : '2'} files:`);
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

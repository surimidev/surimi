import { parseArgs } from 'node:util';
import type { ParseArgsOptionsConfig } from 'node:util';
import { exec } from 'tinyexec';

const NPM_SCOPE = '@surimi/';
const allowedPackages = ['surimi', '@surimi/compiler', '@surimi/parsers', 'vite-plugin-surimi'];
const packageMap = {
  surimi: 'surimi',
  '@surimi/compiler': 'compiler',
  '@surimi/parsers': 'parsers',
  'vite-plugin-surimi': 'vite-plugin-surimi',
} as const;

function isValidPackage(pkg: string): pkg is keyof typeof packageMap {
  return allowedPackages.includes(pkg);
}

function processArgs(args: string[]) {
  const options = {
    tag: {
      type: 'string',
      short: 't',
    },
    dryRun: {
      type: 'boolean',
      default: false,
      short: 'd',
    },
  } satisfies ParseArgsOptionsConfig;

  const {
    values: { tag, dryRun },
  } = parseArgs({ args, options, allowPositionals: true });

  if (!tag) {
    console.error('Error: --tag is required (e.g., surimi@0.2.0)');
    process.exit(1);
  }

  const [pkg, version] = tag.replace(NPM_SCOPE, '').split('@');

  if (!pkg || !version) {
    console.error('Error: --tag must be in the format <package>@<version> (e.g., surimi@0.2.0)');
    process.exit(1);
  }

  if (!isValidPackage(pkg)) {
    console.error(`Error: Package "${pkg}" is not allowed. Allowed packages are: ${allowedPackages.join(', ')}`);
    process.exit(1);
  }

  return { pkg, version, dryRun };
}

function publish(args: string[]) {
  const { pkg, version, dryRun } = processArgs(args);

  console.log(`Publishing package "${pkg}" with version "${version}"...`);

  const publishArgs = ['publish', '--access', 'public', '--no-git-checks'];

  if (dryRun) {
    publishArgs.push('--dry-run');
  }

  exec('pnpm', publishArgs, {
    throwOnError: true,
    nodeOptions: { cwd: `packages/${packageMap[pkg]}`, stdio: 'inherit' },
  });
}

publish(process.argv);

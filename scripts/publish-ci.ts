import { parseArgs } from 'node:util';
import type { ParseArgsOptionsConfig } from 'node:util';
import { exec } from 'tinyexec';

const allowedPackages = ['surimi', 'compiler', 'vite-plugin-surimi'];

function processArgs(args: string[]): [string, string] {
  const options = {
    tag: {
      type: 'string',
    },
  } satisfies ParseArgsOptionsConfig;

  const {
    values: { tag },
  } = parseArgs({ args, options, allowPositionals: true });

  if (!tag) {
    console.error('Error: --tag is required (e.g., surimi@0.2.0)');
    process.exit(1);
  }

  const [pkg, version] = tag.split('@');

  if (!pkg || !version) {
    console.error('Error: --tag must be in the format <package>@<version> (e.g., surimi@0.2.0)');
    process.exit(1);
  }

  if (!allowedPackages.includes(pkg)) {
    console.error(`Error: Package "${pkg}" is not allowed. Allowed packages are: ${allowedPackages.join(', ')}`);
    process.exit(1);
  }

  return [pkg, version];
}

function publish(args: string[]) {
  const [pkg, version] = processArgs(args);

  console.log(`Publishing package "${pkg}" with version "${version}"...`);

  const publishArgs = ['publish', '--access', 'public', '--no-git-checks', '--dry-run'];

  exec('pnpm', publishArgs, {
    throwOnError: true,
    nodeOptions: { cwd: `packages/${pkg}`, stdio: 'inherit' },
  });
}

publish(process.argv);

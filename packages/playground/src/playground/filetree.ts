import type { FileSystemTree } from '#types';

const INDEX_TS = `\
import { select } from "surimi";

select('html').style({ backgroundColor: 'red' });
`;

const PACKAGE_JSON = JSON.stringify(
  {
    name: 'surimi-playground-app',
    type: 'module',
    dependencies: {
      surimi: 'latest',
      '@surimi/compiler': 'latest',
      '@rolldown/binding-wasm32-wasi': 'latest',
    },
    scripts: {
      build: 'surimi compile index.ts --out-dir ./dist --no-js --watch',
    },
  },
  null,
  2,
);

export const files = {
  'index.ts': {
    file: {
      contents: INDEX_TS,
    },
  },
  'package.json': {
    file: {
      contents: PACKAGE_JSON,
    },
  },
  dist: {
    directory: {
      'index.css': {
        file: {
          contents: '// The output will appear here',
        },
      },
    },
  },
} satisfies FileSystemTree;

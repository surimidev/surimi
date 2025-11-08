import type { FileSystemTree } from '#types';

const INDEX_TS = `\
// Note that this playground is somewhat limited in it's IntelliSense capabilities.
// For a quicker and more complete experience, check it out locally!
// We've even got a vite plugin :)
// https://github.com/surimidev/surimi

import { select, media } from "surimi";

const theme = {
  primary: '#3498db',
  primaryHover: '#2980b9',
  background: '#f5f5f5',
  text: '#333',
} as const;

select('html', 'button').style({ backgroundColor: theme.background, color: theme.text });

const button = select('button').style({
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  backgroundColor: theme.primary,
  color: '#fff',
  cursor: 'pointer',
});

button.hover().style({ backgroundColor: theme.primaryHover });

media().maxWidth('600px').and().maxHeight('800px').select('#app').style({
  flexDirection: 'column',
  justifyContent: 'center',
  height: '100vh',
});
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

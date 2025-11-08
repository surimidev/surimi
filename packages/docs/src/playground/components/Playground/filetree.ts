import type { FileSystemTree } from '#playground/types';

const INDEX_TS = `\
// If you have any issues, questions or feedback, visit the docs at https://surimi.dev/docs
// or open an issue on GitHub at https://github.com/surimidev/surimi

import { color, mixin, select } from 'surimi';

const theme = {
  primary: color('primary', '#3498db'),
  primaryHover: color('primaryHover', '#2980b9'),
  background: color('background', '#f5f5f5'),
  text: color('text', '#333'),
} as const;

const hoverable = mixin(':hover').style({
  backgroundColor: theme.primaryHover,
});

select('body').style({
  backgroundColor: theme.background,
  color: theme.text,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  flexDirection: 'column',
});

select('h1').style({ color: theme.primary });

select('button').use(hoverable).style({
  padding: '10px 20px',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: theme.primary,
  color: '#fff',
  cursor: 'pointer',
});

select('body').has('button:active').style({
  backgroundColor: '#3498db2e',
});
`;

const INDEX_HTML = `\
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Surimi playground</title>
  </head>
  <body>
    <div id="root">
      <h1>Welcome to surimi!</h1>
      <p>Use the editor on the left to style this page! (this is a paragraph element)</p>
      <button>Click me</button>
    </div>
    <script type="module" src="./src/index.css.ts"></script>
  </body>
</html>
`;

const VITE_CONFIG_TS = `\
import { defineConfig } from 'vite';
import surimi from 'vite-plugin-surimi';

export default defineConfig({
  plugins: [surimi()],
});
`;

const PACKAGE_JSON = JSON.stringify(
  {
    name: 'surimi-playground-app',
    type: 'module',
    dependencies: {
      surimi: 'latest',
      vite: 'latest',
      'vite-plugin-surimi': 'latest',
      '@surimi/compiler': 'latest',
      '@rolldown/binding-wasm32-wasi': 'latest',
    },
    scripts: {
      dev: 'pnpm vite',
      build: 'pnpm surimi compile ./src/index.css.ts --out-dir=./build --no-js --watch',
    },
  },
  null,
  2,
);

export const files = {
  'package.json': {
    file: {
      contents: PACKAGE_JSON,
    },
  },
  'index.html': {
    file: {
      contents: INDEX_HTML,
    },
  },
  'vite.config.ts': {
    file: {
      contents: VITE_CONFIG_TS,
    },
  },
  src: {
    directory: {
      'index.css.ts': {
        file: {
          contents: INDEX_TS,
        },
      },
    },
  },
  build: {
    directory: {
      'index.css.css': {
        file: {
          contents: '// The output will appear here',
        },
      },
    },
  },
} satisfies FileSystemTree;

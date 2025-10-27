import { defineConfig } from 'taze';

export default defineConfig({
  write: true,
  recursive: true,
  update: true,
  // run `npm install` or `yarn install` right after bumping
  install: true,
  ignorePaths: ['**/node_modules/**'],
});

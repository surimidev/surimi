export interface Lecture {
  id: string;
  title: string;
  description: string;
  markdown: string;
  /** Entry file name for compilation (e.g. 'index.css.ts'). Used as compile input. */
  entryFile: string;
  /** Map of absolute paths to file contents (e.g. { '/index.css.ts': '...', '/index.html': '...' }). */
  files: Record<string, string>;
}

const DEFAULT_ENTRY = `\
import { select } from 'surimi';

select('body').style({
  backgroundColor: '#f5f5f5',
  color: '#333',
  fontFamily: 'system-ui, sans-serif',
});

select('h1').style({
  color: '#3498db',
  fontSize: '2.5rem',
});
`;

const HTML_GETTING_STARTED = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
</head>
<body>
  <div id="root">
    <h1>Welcome to Surimi!</h1>
    <p>This is a paragraph. Edit the CSS in the editor to style this page.</p>
  </div>
</body>
</html>`;

const HTML_PSEUDO_CLASSES = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
</head>
<body>
  <div id="root">
    <h1>Interactive States</h1>
    <button>Hover and click me</button>
  </div>
</body>
</html>`;

const HTML_MIXINS = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
</head>
<body>
  <div id="root">
    <h1>Cards</h1>
    <div class="card">Card 1</div>
    <div class="card">Card 2</div>
  </div>
</body>
</html>`;

export const lectures: Lecture[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of Surimi CSS-in-TS',
    entryFile: 'index.css.ts',
    files: {
      '/index.css.ts': DEFAULT_ENTRY,
      '/index.html': HTML_GETTING_STARTED,
    },
    markdown: `
<h1>Welcome to Surimi!</h1>
<p>Surimi is a powerful CSS-in-TypeScript library that allows you to write type-safe styles directly in your TypeScript files.</p>
<h2>What you'll learn</h2>
<ul>
  <li>Use the <code>select()</code> function to target elements</li>
  <li>Apply styles with the <code>style()</code> method</li>
  <li>Use pseudo-classes like <code>:hover</code></li>
  <li>Create reusable mixins</li>
</ul>
<p>Try changing the styles in the editor; output compiles automatically.</p>
    `.trim(),
  },
  {
    id: 'pseudo-classes',
    title: 'Pseudo-Classes & State',
    description: 'Learn how to use pseudo-classes',
    entryFile: 'index.css.ts',
    files: {
      '/index.css.ts': `\
import { select } from 'surimi';

select('body').style({
  backgroundColor: '#1a1a2e',
  color: '#eee',
  fontFamily: 'system-ui, sans-serif',
});

select('button').style({
  padding: '12px 24px',
  backgroundColor: '#16c79a',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
});

select('button').hover().style({
  backgroundColor: '#19e6af',
});
`,
      '/index.html': HTML_PSEUDO_CLASSES,
    },
    markdown: `
<h1>Pseudo-Classes in Surimi</h1>
<ul>
  <li><code>.hover()</code> – Style elements on mouse hover</li>
  <li><code>.focus()</code> – Style elements when focused</li>
  <li><code>.active()</code> – Style elements when active</li>
</ul>
    `.trim(),
  },
  {
    id: 'mixins',
    title: 'Reusable Mixins',
    description: 'Create reusable style mixins',
    entryFile: 'index.css.ts',
    files: {
      '/index.css.ts': `\
import { mixin, select } from 'surimi';

const cardHover = mixin(':hover').style({
  transform: 'translateY(-4px)',
  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
});

select('.card').use(cardHover).style({
  padding: '1.5rem',
  backgroundColor: '#1a1a2e',
  borderRadius: '8px',
  transition: 'all 0.2s',
});
`,
      '/index.html': HTML_MIXINS,
    },
    markdown: `
<h1>Mixins in Surimi</h1>
<p>Use <code>mixin()</code> to create reusable style patterns.</p>
    `.trim(),
  },
];

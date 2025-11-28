import type { FileSystemTree } from '@containerkit/react/webcontainer';

export interface Lecture {
  id: string;
  title: string;
  description: string;
  markdown: string;
  files: FileSystemTree;
  initialFile: string;
}

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

const VITE_CONFIG = `\
import { defineConfig } from 'vite';
import surimi from 'vite-plugin-surimi';

export default defineConfig({
  plugins: [surimi()],
});
`;

const BASE_HTML = `\
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Surimi Playground</title>
  </head>
  <body>
    <div id="root">
      <h1>Welcome to Surimi!</h1>
      <p>This is a paragraph element.</p>
      <button>Click me</button>
    </div>
    <script type="module" src="./src/index.css.ts"></script>
  </body>
</html>
`;

export const lectures: Lecture[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of Surimi CSS-in-TS',
    initialFile: '/src/index.css.ts',
    markdown: `
# Welcome to Surimi!

Surimi is a powerful CSS-in-TypeScript library that allows you to write type-safe styles directly in your TypeScript files.

## What you'll learn

In this tutorial, you'll learn how to:
- Use the \`select()\` function to target elements
- Apply styles with the \`style()\` method
- Use pseudo-classes like \`:hover\`
- Create reusable mixins

## Your First Styles

On the right, you'll see a simple HTML page with a heading, paragraph, and button. Let's style it!

Try changing the background color of the body or the button colors in the editor.
    `,
    files: {
      'package.json': {
        file: { contents: PACKAGE_JSON },
      },
      'vite.config.ts': {
        file: { contents: VITE_CONFIG },
      },
      'index.html': {
        file: { contents: BASE_HTML },
      },
      src: {
        directory: {
          'index.css.ts': {
            file: {
              contents: `\
import { select } from 'surimi';

// Style the body
select('body').style({
  backgroundColor: '#f5f5f5',
  color: '#333',
  fontFamily: 'system-ui, sans-serif',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  margin: '0',
});

// Style the root container
select('#root').style({
  textAlign: 'center',
  padding: '2rem',
});

// Style the heading
select('h1').style({
  color: '#3498db',
  fontSize: '2.5rem',
  marginBottom: '1rem',
});

// Style the paragraph
select('p').style({
  fontSize: '1.125rem',
  marginBottom: '2rem',
  color: '#666',
});

// Style the button
select('button').style({
  padding: '12px 24px',
  fontSize: '1rem',
  backgroundColor: '#3498db',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
});

// Add hover effect to button
select('button').hover().style({
  backgroundColor: '#2980b9',
});
`,
            },
          },
        },
      },
    },
  },
  {
    id: 'pseudo-classes',
    title: 'Pseudo-Classes & State',
    description: 'Learn how to use pseudo-classes like :hover, :focus, and :active',
    initialFile: '/src/index.css.ts',
    markdown: `
# Pseudo-Classes in Surimi

Surimi makes it easy to work with pseudo-classes and element states.

## Common Pseudo-Classes

- \`.hover()\` - Style elements on mouse hover
- \`.focus()\` - Style elements when focused
- \`.active()\` - Style elements when active (e.g., being clicked)
- \`.has(selector)\` - Style elements that contain a matching child

## Try It Out

The example on the right shows various interactive states. Try:
1. Hovering over the button
2. Clicking and holding the button (active state)
3. Focusing the input field
    `,
    files: {
      'package.json': {
        file: { contents: PACKAGE_JSON },
      },
      'vite.config.ts': {
        file: { contents: VITE_CONFIG },
      },
      'index.html': {
        file: {
          contents: `\
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pseudo-Classes Demo</title>
  </head>
  <body>
    <div id="root">
      <h1>Interactive States</h1>
      <div class="demo-container">
        <input type="text" placeholder="Try focusing me" />
        <button>Hover and click me</button>
      </div>
    </div>
    <script type="module" src="./src/index.css.ts"></script>
  </body>
</html>
`,
        },
      },
      src: {
        directory: {
          'index.css.ts': {
            file: {
              contents: `\
import { select } from 'surimi';

select('body').style({
  backgroundColor: '#1a1a2e',
  color: '#eee',
  fontFamily: 'system-ui, sans-serif',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  margin: '0',
});

select('#root').style({
  textAlign: 'center',
});

select('h1').style({
  color: '#16c79a',
  marginBottom: '2rem',
});

select('.demo-container').style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  alignItems: 'center',
});

// Style the input
select('input').style({
  padding: '12px 16px',
  fontSize: '1rem',
  border: '2px solid #444',
  borderRadius: '8px',
  backgroundColor: '#2a2a3e',
  color: '#eee',
  outline: 'none',
  transition: 'all 0.3s',
});

// Input focus state
select('input').focus().style({
  borderColor: '#16c79a',
  backgroundColor: '#333350',
  boxShadow: '0 0 0 3px rgba(22, 199, 154, 0.1)',
});

// Style the button
select('button').style({
  padding: '12px 32px',
  fontSize: '1rem',
  backgroundColor: '#16c79a',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  transform: 'translateY(0)',
});

// Button hover state
select('button').hover().style({
  backgroundColor: '#19e6af',
  transform: 'translateY(-2px)',
  boxShadow: '0 4px 12px rgba(22, 199, 154, 0.3)',
});

// Button active state
select('button').active().style({
  transform: 'translateY(0)',
  backgroundColor: '#13a67d',
  boxShadow: '0 2px 4px rgba(22, 199, 154, 0.2)',
});
`,
            },
          },
        },
      },
    },
  },
  {
    id: 'mixins',
    title: 'Reusable Mixins',
    description: 'Create reusable style mixins for cleaner code',
    initialFile: '/src/index.css.ts',
    markdown: `
# Mixins in Surimi

Mixins allow you to create reusable style patterns that can be applied to multiple elements.

## Creating a Mixin

Use the \`mixin()\` function to create a reusable style pattern:

\`\`\`typescript
import { mixin, select } from 'surimi';

const hoverEffect = mixin(':hover').style({
  transform: 'scale(1.05)',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
});

select('.card').use(hoverEffect);
\`\`\`

## Benefits

- **DRY principle**: Write styles once, use everywhere
- **Consistency**: Ensure uniform styling across components
- **Maintainability**: Update in one place, apply everywhere

Try creating your own mixins in the editor!
    `,
    files: {
      'package.json': {
        file: { contents: PACKAGE_JSON },
      },
      'vite.config.ts': {
        file: { contents: VITE_CONFIG },
      },
      'index.html': {
        file: {
          contents: `\
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mixins Demo</title>
  </head>
  <body>
    <div id="root">
      <h1>Reusable Mixins</h1>
      <div class="card-container">
        <div class="card">
          <h3>Card 1</h3>
          <p>Hover over me!</p>
        </div>
        <div class="card">
          <h3>Card 2</h3>
          <p>I use the same mixin!</p>
        </div>
        <div class="card">
          <h3>Card 3</h3>
          <p>So do I!</p>
        </div>
      </div>
    </div>
    <script type="module" src="./src/index.css.ts"></script>
  </body>
</html>
`,
        },
      },
      src: {
        directory: {
          'index.css.ts': {
            file: {
              contents: `\
import { mixin, select } from 'surimi';

select('body').style({
  backgroundColor: '#0f0f23',
  color: '#e0e0e0',
  fontFamily: 'system-ui, sans-serif',
  padding: '2rem',
  margin: '0',
  minHeight: '100vh',
});

select('#root').style({
  maxWidth: '1200px',
  margin: '0 auto',
});

select('h1').style({
  color: '#00d9ff',
  textAlign: 'center',
  marginBottom: '3rem',
});

// Create a reusable hover effect mixin
const cardHoverEffect = mixin(':hover').style({
  transform: 'translateY(-8px) scale(1.02)',
  boxShadow: '0 12px 24px rgba(0, 217, 255, 0.3)',
  borderColor: '#00d9ff',
});

select('.card-container').style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '2rem',
});

// Apply the mixin to all cards
select('.card')
  .use(cardHoverEffect)
  .style({
    backgroundColor: '#1a1a2e',
    border: '2px solid #333',
    borderRadius: '12px',
    padding: '2rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  });

select('.card h3').style({
  color: '#00d9ff',
  marginTop: '0',
  marginBottom: '0.5rem',
});

select('.card p').style({
  color: '#a0a0a0',
  margin: '0',
  lineHeight: '1.6',
});
`,
            },
          },
        },
      },
    },
  },
];

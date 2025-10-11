import { WebContainer, type FileSystemTree } from '@webcontainer/api';
import { useEffect, useState } from 'react';

import './playground.css';

const files = {
  'index.ts': {
    file: {
      contents: `
import { select } from "surimi";

select('html').style({ backgroundColor: 'red' });
`,
    },
  },
  'package.json': {
    file: {
      contents: `
{
  "name": "surimi-playground-app",
  "type": "module",
  "dependencies": {
    "@surimi/compiler": "latest"
  },
  "scripts": {
    "build": "surimi compile index.ts --outDir dist --no-js"
  }
}`,
    },
  },
} satisfies FileSystemTree;

export default function Playground() {
  const [sourceFile, setSourceFile] = useState(files['index.ts'].file.contents);
  const [instance, setInstance] = useState<WebContainer | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!instance) {
        console.log('Booting up web container...');
        const webcontainerInstance = await WebContainer.boot();
        await webcontainerInstance.mount(files);
        const install = await webcontainerInstance.spawn('npm', ['i']);
        void install.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log(data);
            },
          }),
        );
        await install.exit;

        webcontainerInstance.fs.watch('index.ts', event => {
          if (event !== 'change') return;
          webcontainerInstance
            .spawn('npm', ['run', 'build'])
            .then(async process => {
              void process.output.pipeTo(
                new WritableStream({
                  write(data) {
                    console.log(data);
                  },
                }),
              );
              const output = await process.exit;
              console.log(output);

              const cssContent = await webcontainerInstance.fs.readFile('dist/index.css', 'utf-8');
              console.log('Compiled CSS:', cssContent);
            })
            .catch((err: unknown) => {
              console.error('Failed to run build:', err);
            });
        });

        setInstance(webcontainerInstance);
      }
    };

    init().catch(() => {
      console.error('Failed to initialize web container');
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (instance) {
      instance.fs.writeFile('/index.ts', newContent).catch((err: unknown) => {
        console.error('Failed to write file:', err);
      });
      setSourceFile(newContent);
    }
  };

  return (
    <div className="playground">
      <textarea className="playground__input" value={sourceFile} onChange={handleInputChange}></textarea>
      <div className="playground__output"></div>
    </div>
  );
}

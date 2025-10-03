import { createFilter } from '@rollup/pluginutils';
import { build } from 'rolldown';

export interface CompileOptions {
  inputPath: string;
  cwd: string;
  include?: string | string[];
  exclude?: string | string[];
}

export default async function compile(options: CompileOptions) {
  const { inputPath, cwd, include, exclude } = options;

  const filter = createFilter(include, exclude);

  const buildRes = await build({
    input: inputPath,
    cwd,
    write: false,
    output: {
      esModule: true,
    },
    plugins: [
      {
        name: 'surimi:compiler-transform',
        transform(code, id) {
          if (filter(id)) {
            const finalCode = `${code}\nexport default s.build();\n`;
            return finalCode;
          }
          return null;
        },
      },
    ],
  });

  const output = buildRes.output[0].code;
  const css = await execute(output);
  return css;
}

async function execute(code: string) {
  try {
    console.log('Executing Surimi code in sandboxed environment...');

    const dataUrl = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
    const module = (await import(dataUrl)) as { default: string };
    return module.default;
  } catch (error) {
    console.error('Error executing Surimi code:', error);
    throw error;
  }
}

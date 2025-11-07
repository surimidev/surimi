import { describe, expect, it } from 'vitest';
import { assertValidCompileResult, compileCode } from '../helpers/test-utils';

describe('execute() - Code Execution', () => {
  describe('module execution', () => {
    it('should execute valid JavaScript code', async () => {
      const code = `\
import { select } from 'surimi';

const className = 'test';
select('.' + className).style({
  display: 'block',
});
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.css).toContain('.test');
    });

    it('should execute code with dynamic logic', async () => {
      const code = `\
import { select } from 'surimi';

const colors = ['red', 'blue', 'green'];

colors.forEach((color, index) => {
  select(\`.color-\${index}\`).style({
    backgroundColor: color,
  });
});
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.css).toContain('.color-0');
      expect(result.css).toContain('background-color: red');
      expect(result.css).toContain('.color-1');
      expect(result.css).toContain('background-color: blue');
    });

    it('should handle conditional logic', async () => {
      const code = `\
import { select } from 'surimi';

const isDark = true;

if (isDark) {
  select('.theme').style({
    backgroundColor: 'black',
    color: 'white',
  });
} else {
  select('.theme').style({
    backgroundColor: 'white',
    color: 'black',
  });
}
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.css).toContain('background-color: black');
      expect(result.css).toContain('color: white');
    });

    it('should isolate execution context', async () => {
      const code1 = `\
import { select } from 'surimi';
select('.first').style({ display: 'block' });
`;
      const code2 = `\
import { select } from 'surimi';
select('.second').style({ display: 'flex' });
`;

      const result1 = await compileCode(code1);
      const result2 = await compileCode(code2);

      assertValidCompileResult(result1);
      assertValidCompileResult(result2);

      // Each should only contain its own CSS
      expect(result1.css).toContain('.first');
      expect(result1.css).not.toContain('.second');
      expect(result2.css).toContain('.second');
      expect(result2.css).not.toContain('.first');
    });
  });

  describe('export extraction and serialization', () => {
    it('should extract and serialize string exports', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
export const str = 'hello world';
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.js).toContain('export const str = "hello world"');
    });

    it('should extract and serialize number exports', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
export const num = 42;
export const float = 3.14;
export const negative = -100;
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.js).toContain('export const num = 42');
      expect(result.js).toContain('export const float = 3.14');
      expect(result.js).toContain('export const negative = -100');
    });

    it('should extract and serialize boolean exports', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
export const isTrue = true;
export const isFalse = false;
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.js).toContain('export const isTrue = true');
      expect(result.js).toContain('export const isFalse = false');
    });

    it('should extract and serialize array exports', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
export const arr = [1, 2, 3];
export const mixed = ['a', 1, true, null];
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.js).toContain('export const arr = [1,2,3]');
      expect(result.js).toContain('export const mixed = ["a",1,true,null]');
    });

    it('should extract and serialize object exports', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
export const obj = { a: 1, b: 'two', c: true };
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.js).toContain('export const obj');
      expect(result.js).toContain('"a":1');
      expect(result.js).toContain('"b":"two"');
      expect(result.js).toContain('"c":true');
    });

    it('should extract and serialize nested object exports', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
export const nested = {
  level1: {
    level2: {
      value: 'deep'
    }
  }
};
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.js).toContain('export const nested');
      expect(result.js).toContain('"level1"');
      expect(result.js).toContain('"level2"');
      expect(result.js).toContain('"value":"deep"');
    });

    it('should handle null and undefined exports', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
export const nullValue = null;
export const undefinedValue = undefined;
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.js).toContain('export const nullValue = null');
      expect(result.js).toContain('export const undefinedValue');
    });

    it('should skip default export', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
export default { foo: 'bar' };
export const named = 'value';
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.js).not.toContain('default');
      expect(result.js).toContain('export const named = "value"');
    });

    it('should skip __SURIMI_GENERATED_CSS__ from exports', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.js).not.toContain('__SURIMI_GENERATED_CSS__');
    });

    it('should handle multiple exports of different types', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
export const str = 'text';
export const num = 123;
export const bool = true;
export const arr = [1, 2];
export const obj = { key: 'value' };
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.js).toContain('export const str = "text"');
      expect(result.js).toContain('export const num = 123');
      expect(result.js).toContain('export const bool = true');
      expect(result.js).toContain('export const arr = [1,2]');
      expect(result.js).toContain('export const obj');
    });
  });

  describe('CSS extraction', () => {
    it('should extract generated CSS', async () => {
      const code = `\
import { select } from 'surimi';
select('.css-test').style({ display: 'grid' });
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.css).toContain('.css-test');
      expect(result.css).toContain('display: grid');
    });

    it('should handle empty CSS generation', async () => {
      const code = `\
import { select } from 'surimi';
// No styles generated
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.css).toBe('');
    });

    it('should handle complex CSS generation', async () => {
      const code = `\
import { select, media } from 'surimi';

select('.complex').style({
  display: 'flex',
  flexDirection: 'column',
});

media('(min-width: 768px)').nest(() => {
  select('.complex').style({
    flexDirection: 'row',
  });
});
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.css).toContain('.complex');
      expect(result.css).toContain('display: flex');
      expect(result.css).toContain('@media');
      expect(result.css).toContain('(min-width: 768px)');
    });
  });

  describe('error handling', () => {
    it('should catch and format syntax errors', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
const x = ;  // Syntax error
`;
      await expect(compileCode(code)).rejects.toThrow();
    });

    it('should catch runtime errors', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
throw new Error('Runtime error');
`;
      await expect(compileCode(code)).rejects.toThrow('Runtime error');
    });

    it('should catch reference errors', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
const value = nonExistentVariable;
`;
      await expect(compileCode(code)).rejects.toThrow();
    });

    it('should strip data URLs from error messages', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
throw new Error('Test error');
`;
      try {
        await compileCode(code);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).not.toContain('data:text/javascript');
        expect((error as Error).message).not.toContain('base64');
      }
    });

    it('should provide meaningful error messages', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
throw new Error('Custom error message');
`;
      try {
        await compileCode(code);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toContain('Custom error message');
      }
    });

    it('should handle import errors', async () => {
      const code = `\
import { select } from 'surimi';
import { something } from './non-existent-file';
select('.test').style({ display: 'block' });
`;
      await expect(compileCode(code)).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle exports with special characters in names', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
export const _privateVar = 'value';
export const $dollarVar = 'value';
export const camelCase = 'value';
export const UPPER_CASE = 'value';
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.js).toContain('export const _privateVar');
      expect(result.js).toContain('export const $dollarVar');
      expect(result.js).toContain('export const camelCase');
      expect(result.js).toContain('export const UPPER_CASE');
    });

    it('should handle exports with unicode characters', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
export const text = '你好世界 🌍';
export const emoji = '✨🎉🎊';
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.js).toContain('你好世界 🌍');
      expect(result.js).toContain('✨🎉🎊');
    });

    it('should handle very large export objects', async () => {
      const largeObj: Record<string, number> = {};
      for (let i = 0; i < 1000; i++) {
        largeObj[`key${i}`] = i;
      }

      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
export const large = ${JSON.stringify(largeObj)};
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.js).toContain('export const large');
      expect(result.js).toContain('"key0":0');
      expect(result.js).toContain('"key999":999');
    });

    it('should handle exports with Date objects (serialized as strings)', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
export const date = new Date('2024-01-01');
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.js).toContain('export const date');
      // Date will be serialized as a string representation
      expect(result.js).toMatch(/2024/);
    });

    it('should handle computed export values', async () => {
      const code = `\
import { select } from 'surimi';
select('.test').style({ display: 'block' });
export const computed = 10 + 20;
export const multiplied = 5 * 6;
export const concatenated = 'Hello' + ' ' + 'World';
`;
      const result = await compileCode(code);

      assertValidCompileResult(result);
      expect(result.js).toContain('export const computed = 30');
      expect(result.js).toContain('export const multiplied = 30');
      expect(result.js).toContain('export const concatenated = "Hello World"');
    });
  });
});

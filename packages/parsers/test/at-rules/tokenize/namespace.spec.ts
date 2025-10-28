import { describe, expect, it } from 'vitest';

import { tokenizeAtRule } from '#index';

describe('@namespace - Basic', () => {
  it('should tokenize default namespace with URL', () => {
    const input = '@namespace url(http://www.w3.org/1999/xhtml)';

    const tokens = tokenizeAtRule(input);

    expect(tokens).toEqual([
      { type: 'at-rule-name', name: 'namespace', content: '@namespace' },
      {
        type: 'url',
        value: 'http://www.w3.org/1999/xhtml',
        content: 'url(http://www.w3.org/1999/xhtml)',
      },
    ]);
  });

  it('should tokenize namespace with string', () => {
    const input = '@namespace "http://www.w3.org/2000/svg"';

    const tokens = tokenizeAtRule(input);

    expect(tokens).toEqual([
      { type: 'at-rule-name', name: 'namespace', content: '@namespace' },
      { type: 'string', value: '"http://www.w3.org/2000/svg"', content: '"http://www.w3.org/2000/svg"' },
    ]);
  });

  it('should tokenize prefixed namespace', () => {
    const input = '@namespace svg url(http://www.w3.org/2000/svg)';

    const tokens = tokenizeAtRule(input);

    expect(tokens).toEqual([
      { type: 'at-rule-name', name: 'namespace', content: '@namespace' },
      { type: 'identifier', value: 'svg', content: 'svg' },
      {
        type: 'url',
        value: 'http://www.w3.org/2000/svg',
        content: 'url(http://www.w3.org/2000/svg)',
      },
    ]);
  });

  it('should tokenize prefixed namespace with string', () => {
    const input = '@namespace math "http://www.w3.org/1998/Math/MathML"';

    const tokens = tokenizeAtRule(input);

    expect(tokens).toEqual([
      { type: 'at-rule-name', name: 'namespace', content: '@namespace' },
      { type: 'identifier', value: 'math', content: 'math' },
      {
        type: 'string',
        value: '"http://www.w3.org/1998/Math/MathML"',
        content: '"http://www.w3.org/1998/Math/MathML"',
      },
    ]);
  });
});

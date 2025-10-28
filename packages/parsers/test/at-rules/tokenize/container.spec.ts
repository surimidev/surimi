import { describe, expect, it } from 'vitest';

import { tokenizeAtRule } from '#index';

describe('@container - Basic Queries', () => {
  it('should tokenize simple container query', () => {
    const input = '@container (min-width: 400px)';

    const tokens = tokenizeAtRule(input);

    expect(tokens).toEqual([
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'min-width', content: 'min-width' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'dimension', value: 400, unit: 'px', content: '400px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });

  it('should tokenize container query with max-width', () => {
    const input = '@container (max-width: 800px)';

    const tokens = tokenizeAtRule(input);

    expect(tokens).toEqual([
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'max-width', content: 'max-width' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'dimension', value: 800, unit: 'px', content: '800px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });
});

describe('@container - Named Containers', () => {
  it('should tokenize named container query', () => {
    const input = '@container sidebar (min-width: 300px)';

    const tokens = tokenizeAtRule(input);

    expect(tokens).toEqual([
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'identifier', value: 'sidebar', content: 'sidebar' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'min-width', content: 'min-width' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'dimension', value: 300, unit: 'px', content: '300px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });
});

describe('@container - Comparison Operators', () => {
  it('should tokenize with >= operator', () => {
    const input = '@container (width >= 400px)';

    const tokens = tokenizeAtRule(input);

    expect(tokens).toEqual([
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'width', content: 'width' },
      { type: 'operator', operator: '>=', content: '>=' },
      { type: 'dimension', value: 400, unit: 'px', content: '400px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });

  it('should tokenize with <= operator', () => {
    const input = '@container (width <= 800px)';

    const tokens = tokenizeAtRule(input);

    expect(tokens).toEqual([
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'width', content: 'width' },
      { type: 'operator', operator: '<=', content: '<=' },
      { type: 'dimension', value: 800, unit: 'px', content: '800px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });

  it('should tokenize with > operator', () => {
    const input = '@container (width > 400px)';

    const tokens = tokenizeAtRule(input);

    expect(tokens).toEqual([
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'width', content: 'width' },
      { type: 'operator', operator: '>', content: '>' },
      { type: 'dimension', value: 400, unit: 'px', content: '400px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });

  it('should tokenize with < operator', () => {
    const input = '@container (width < 800px)';

    const tokens = tokenizeAtRule(input);

    expect(tokens).toEqual([
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'width', content: 'width' },
      { type: 'operator', operator: '<', content: '<' },
      { type: 'dimension', value: 800, unit: 'px', content: '800px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });

  it('should tokenize with = operator', () => {
    const input = '@container (width = 600px)';

    const tokens = tokenizeAtRule(input);

    expect(tokens).toEqual([
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'width', content: 'width' },
      { type: 'operator', operator: '=', content: '=' },
      { type: 'dimension', value: 600, unit: 'px', content: '600px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });
});

describe('@container - Logical Operators', () => {
  it('should tokenize with and operator', () => {
    const input = '@container (min-width: 400px) and (max-width: 800px)';

    const tokens = tokenizeAtRule(input);

    expect(tokens).toEqual([
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'min-width', content: 'min-width' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'dimension', value: 400, unit: 'px', content: '400px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
      { type: 'operator', operator: 'and', content: 'and' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'max-width', content: 'max-width' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'dimension', value: 800, unit: 'px', content: '800px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });

  it('should tokenize with or operator', () => {
    const input = '@container (width < 400px) or (width > 800px)';

    const tokens = tokenizeAtRule(input);

    expect(tokens).toEqual([
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'width', content: 'width' },
      { type: 'operator', operator: '<', content: '<' },
      { type: 'dimension', value: 400, unit: 'px', content: '400px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
      { type: 'operator', operator: 'or', content: 'or' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'width', content: 'width' },
      { type: 'operator', operator: '>', content: '>' },
      { type: 'dimension', value: 800, unit: 'px', content: '800px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });

  it('should tokenize with not operator', () => {
    const input = '@container not (min-width: 400px)';

    const tokens = tokenizeAtRule(input);

    expect(tokens).toEqual([
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'operator', operator: 'not', content: 'not' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'min-width', content: 'min-width' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'dimension', value: 400, unit: 'px', content: '400px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });
});

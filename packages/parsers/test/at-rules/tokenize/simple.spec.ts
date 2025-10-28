import { describe, expect, it } from 'vitest';

import { tokenizeAtRule } from '#index';

// ============================================================================
// @media (https://www.w3.org/TR/css3-mediaqueries/)
// ============================================================================

describe('@media Rules', () => {
  it('should tokenize simple @media rule', () => {
    const result = tokenizeAtRule('@media');
    expect(result).toEqual([{ type: 'at-rule-name', name: 'media', content: '@media' }]);
  });

  it('should tokenize @media with media type', () => {
    const result = tokenizeAtRule('@media screen');
    expect(result).toEqual([
      { type: 'at-rule-name', name: 'media', content: '@media' },
      { type: 'identifier', value: 'screen', content: 'screen' },
    ]);
  });

  it('should tokenize @media with feature query', () => {
    const result = tokenizeAtRule('@media (min-width: 768px)');
    expect(result).toEqual([
      { type: 'at-rule-name', name: 'media', content: '@media' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'min-width', content: 'min-width' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'dimension', value: 768, unit: 'px', content: '768px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });

  it('should tokenize @media with and operator', () => {
    const result = tokenizeAtRule('@media screen and (min-width: 768px)');
    expect(result).toEqual([
      { type: 'at-rule-name', name: 'media', content: '@media' },
      { type: 'identifier', value: 'screen', content: 'screen' },
      { type: 'operator', operator: 'and', content: 'and' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'min-width', content: 'min-width' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'dimension', value: 768, unit: 'px', content: '768px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });

  it('should tokenize @media with multiple conditions', () => {
    const result = tokenizeAtRule('@media screen and (min-width: 768px) and (max-width: 1024px)');
    expect(result).toHaveLength(14);
    expect(result[0]).toEqual({ type: 'at-rule-name', name: 'media', content: '@media' });
  });

  it('should tokenize @media with or operator', () => {
    const result = tokenizeAtRule('@media (orientation: portrait) or (orientation: landscape)');
    expect(result[6]).toEqual({ type: 'operator', operator: 'or', content: 'or' });
  });

  it('should tokenize @media with not operator', () => {
    const result = tokenizeAtRule('@media not print');
    expect(result).toEqual([
      { type: 'at-rule-name', name: 'media', content: '@media' },
      { type: 'operator', operator: 'not', content: 'not' },
      { type: 'identifier', value: 'print', content: 'print' },
    ]);
  });
});

// ============================================================================
// @container (https://www.w3.org/TR/css-contain-3/)
// ============================================================================

describe('@container Rules', () => {
  it('should tokenize simple @container rule', () => {
    const result = tokenizeAtRule('@container');
    expect(result).toEqual([{ type: 'at-rule-name', name: 'container', content: '@container' }]);
  });

  it('should tokenize @container with size query', () => {
    const result = tokenizeAtRule('@container (min-width: 400px)');
    expect(result).toEqual([
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'min-width', content: 'min-width' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'dimension', value: 400, unit: 'px', content: '400px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });

  it('should tokenize @container with container name', () => {
    const result = tokenizeAtRule('@container sidebar (min-width: 300px)');
    // Note: 'sidebar (...)' is tokenized as a function call since there's whitespace before (
    // This is acceptable behavior - the semantic parser can interpret container names
    expect(result).toEqual([
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'identifier', value: 'sidebar', content: 'sidebar' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'min-width', content: 'min-width' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'dimension', value: 300, unit: 'px', content: '300px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });

  it('should tokenize @container with comparison operator', () => {
    const result = tokenizeAtRule('@container (width > 400px)');
    expect(result).toEqual([
      { type: 'at-rule-name', name: 'container', content: '@container' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'width', content: 'width' },
      { type: 'operator', operator: '>', content: '>' },
      { type: 'dimension', value: 400, unit: 'px', content: '400px' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });
});

// ============================================================================
// @keyframes (https://www.w3.org/TR/css-animations-1/)
// ============================================================================

describe('@keyframes Rules', () => {
  it('should tokenize @keyframes with animation name', () => {
    const result = tokenizeAtRule('@keyframes slide-in');
    expect(result).toEqual([
      { type: 'at-rule-name', name: 'keyframes', content: '@keyframes' },
      { type: 'identifier', value: 'slide-in', content: 'slide-in' },
    ]);
  });

  it('should tokenize @keyframes with quoted name', () => {
    const result = tokenizeAtRule('@keyframes "my-animation"');
    expect(result).toEqual([
      { type: 'at-rule-name', name: 'keyframes', content: '@keyframes' },
      { type: 'string', value: '"my-animation"', content: '"my-animation"' },
    ]);
  });
});

// ============================================================================
// @property (https://www.w3.org/TR/css-properties-values-api-1/)
// ============================================================================

describe('@property Rules', () => {
  it('should tokenize @property with custom property name', () => {
    const result = tokenizeAtRule('@property --my-color');
    expect(result).toEqual([
      { type: 'at-rule-name', name: 'property', content: '@property' },
      { type: 'identifier', value: '--my-color', content: '--my-color' },
    ]);
  });
});

// ============================================================================
// @font-face (https://www.w3.org/TR/css-fonts-3/)
// ============================================================================

describe('@font-face Rules', () => {
  it('should tokenize simple @font-face', () => {
    const result = tokenizeAtRule('@font-face');
    expect(result).toEqual([{ type: 'at-rule-name', name: 'font-face', content: '@font-face' }]);
  });
});

// ============================================================================
// @supports (https://www.w3.org/TR/css-conditional-3/)
// ============================================================================

describe('@supports Rules', () => {
  it('should tokenize @supports with property check', () => {
    const result = tokenizeAtRule('@supports (display: grid)');
    expect(result).toEqual([
      { type: 'at-rule-name', name: 'supports', content: '@supports' },
      { type: 'delimiter', delimiter: '(', content: '(' },
      { type: 'identifier', value: 'display', content: 'display' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'identifier', value: 'grid', content: 'grid' },
      { type: 'delimiter', delimiter: ')', content: ')' },
    ]);
  });

  it('should tokenize @supports with function value', () => {
    const result = tokenizeAtRule('@supports (transform-function: rotate(45deg))');
    expect(result[4]).toEqual({
      type: 'function',
      name: 'rotate',
      argument: '45deg',
      content: 'rotate(45deg)',
    });
  });

  it('should tokenize @supports with and operator', () => {
    const result = tokenizeAtRule('@supports (display: grid) and (gap: 1rem)');
    expect(result[6]).toEqual({ type: 'operator', operator: 'and', content: 'and' });
  });

  it('should tokenize @supports with not operator', () => {
    const result = tokenizeAtRule('@supports not (display: flex)');
    expect(result[1]).toEqual({ type: 'operator', operator: 'not', content: 'not' });
  });

  it('should tokenize @supports with selector() function', () => {
    const result = tokenizeAtRule('@supports selector(:has(> img))');
    expect(result[1]).toEqual({
      type: 'function',
      name: 'selector',
      argument: ':has(> img)',
      content: 'selector(:has(> img))',
    });
  });
});

// ============================================================================
// @page (https://www.w3.org/TR/css-page-3/)
// ============================================================================

describe('@page Rules', () => {
  it('should tokenize simple @page', () => {
    const result = tokenizeAtRule('@page');
    expect(result).toEqual([{ type: 'at-rule-name', name: 'page', content: '@page' }]);
  });

  it('should tokenize @page with pseudo-class', () => {
    const result = tokenizeAtRule('@page :first');
    expect(result).toEqual([
      { type: 'at-rule-name', name: 'page', content: '@page' },
      { type: 'delimiter', delimiter: ':', content: ':' },
      { type: 'identifier', value: 'first', content: 'first' },
    ]);
  });
});

// ============================================================================
// @layer (https://www.w3.org/TR/css-cascade-5/)
// ============================================================================

describe('@layer Rules', () => {
  it('should tokenize @layer with name', () => {
    const result = tokenizeAtRule('@layer utilities');
    expect(result).toEqual([
      { type: 'at-rule-name', name: 'layer', content: '@layer' },
      { type: 'identifier', value: 'utilities', content: 'utilities' },
    ]);
  });

  it('should tokenize @layer with multiple names', () => {
    const result = tokenizeAtRule('@layer reset, base, components');
    expect(result).toEqual([
      { type: 'at-rule-name', name: 'layer', content: '@layer' },
      { type: 'identifier', value: 'reset', content: 'reset' },
      { type: 'delimiter', delimiter: ',', content: ',' },
      { type: 'identifier', value: 'base', content: 'base' },
      { type: 'delimiter', delimiter: ',', content: ',' },
      { type: 'identifier', value: 'components', content: 'components' },
    ]);
  });
});

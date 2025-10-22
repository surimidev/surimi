import { describe, expectTypeOf, it } from 'vitest';

import type { Token } from '#index';
import { stringify } from '#index';

describe('stringify - Attribute Selectors', () => {
  it('should stringify attribute presence', () => {
    const input = [{ type: 'attribute', content: '[disabled]', name: 'disabled' }] as const satisfies Token[];

    type Expected = '[disabled]';

    const result = stringify(input);

    expectTypeOf(result).toEqualTypeOf<Expected>();
  });

  it('should stringify attribute with equals', () => {
    const input = [
      { type: 'attribute', content: '[type="text"]', name: 'type', operator: '=', value: '"text"' },
    ] as const satisfies Token[];

    type Expected = '[type="text"]';

    const result = stringify(input);

    expectTypeOf(result).toEqualTypeOf<Expected>();
  });

  it('should stringify attribute with tilde equals', () => {
    const input = [
      { type: 'attribute', content: '[class~="active"]', name: 'class', operator: '~=', value: '"active"' },
    ] as const satisfies Token[];

    type Expected = '[class~="active"]';

    const result = stringify(input);

    expectTypeOf(result).toEqualTypeOf<Expected>();
  });

  it('should stringify attribute with pipe equals', () => {
    const input = [
      { type: 'attribute', content: '[lang|="en"]', name: 'lang', operator: '|=', value: '"en"' },
    ] as const satisfies Token[];

    type Expected = '[lang|="en"]';

    const result = stringify(input);

    expectTypeOf(result).toEqualTypeOf<Expected>();
  });

  it('should stringify attribute with caret equals', () => {
    const input = [
      { type: 'attribute', content: '[href^="https"]', name: 'href', operator: '^=', value: '"https"' },
    ] as const satisfies Token[];

    type Expected = '[href^="https"]';

    const result = stringify(input);

    expectTypeOf(result).toEqualTypeOf<Expected>();
  });

  it('should stringify attribute with dollar equals', () => {
    const input = [
      { type: 'attribute', content: '[href$=".pdf"]', name: 'href', operator: '$=', value: '".pdf"' },
    ] as const satisfies Token[];

    type Expected = '[href$=".pdf"]';

    const result = stringify(input);

    expectTypeOf(result).toEqualTypeOf<Expected>();
  });

  it('should stringify attribute with asterisk equals', () => {
    const input = [
      { type: 'attribute', content: '[href*="example"]', name: 'href', operator: '*=', value: '"example"' },
    ] as const satisfies Token[];

    type Expected = '[href*="example"]';

    const result = stringify(input);

    expectTypeOf(result).toEqualTypeOf<Expected>();
  });

  it('should stringify attribute with case insensitive flag', () => {
    const input = [
      {
        type: 'attribute',
        content: '[type="text" i]',
        name: 'type',
        operator: '=',
        value: '"text"',
        caseSensitive: 'i',
      },
    ] as const satisfies Token[];

    type Expected = '[type="text" i]';

    const result = stringify(input);

    expectTypeOf(result).toEqualTypeOf<Expected>();
  });

  it('should stringify attribute with case sensitive flag', () => {
    const input = [
      {
        type: 'attribute',
        content: '[type="text" s]',
        name: 'type',
        operator: '=',
        value: '"text"',
        caseSensitive: 's',
      },
    ] as const satisfies Token[];

    type Expected = '[type="text" s]';

    const result = stringify(input);

    expectTypeOf(result).toEqualTypeOf<Expected>();
  });

  it('should stringify multiple attributes', () => {
    const input = [
      { type: 'attribute', content: '[type="text"]', name: 'type', operator: '=', value: '"text"' },
      { type: 'attribute', content: '[disabled]', name: 'disabled' },
    ] as const satisfies Token[];

    type Expected = '[type="text"][disabled]';

    const result = stringify(input);

    expectTypeOf(result).toEqualTypeOf<Expected>();
  });
});

import { createTheme, defineTokens, type Token, token } from '@surimi/theme';

import { media, Surimi, select, style } from 'surimi';
import { beforeEach, describe, expect, expectTypeOf, it } from 'vitest';

beforeEach(() => {
  Surimi.clear();
});

describe('defineTokens', () => {
  it('should set defaults on :root and return var refs', () => {
    const tokens = defineTokens({ background: '#fff', text: '#111' });

    expect(tokens.background.build()).toBe('var(--background)');
    expectTypeOf(tokens.text).toEqualTypeOf<Token>();
    expect(Surimi.build()).toBe(`\
:root {
    --background: #fff;
    --text: #111;
}`);
  });

  it('should register token() leaves as @property with the default as initial value', () => {
    defineTokens({
      background: token('#fff', '<color>'),
      radius: token(4, { syntax: '<number>', inherits: false }),
      text: '#111',
    });

    expect(Surimi.build()).toMatchSnapshot();
  });

  it('should kebab-case nested paths and the prefix', () => {
    const tokens = defineTokens({ fontSize: { small: '0.875rem', large: '2rem' } }, { prefix: 'myApp' });

    expect(tokens.fontSize.large.build()).toBe('var(--my-app-font-size-large)');
    expect(Surimi.build()).toContain('--my-app-font-size-small: 0.875rem');
  });

  it('should alias other tokens', () => {
    const palette = defineTokens({ gray: { 1: '#fcfcfd' } });
    const tokens = defineTokens({ background: palette.gray[1], border: token(palette.gray[1]) });

    expect(tokens.background.build()).toBe('var(--background)');
    expect(Surimi.build()).toContain('--background: var(--gray-1)');
    expect(Surimi.build()).toContain('@property --border');
  });

  it('should reject a typed token with an alias default', () => {
    const palette = defineTokens({ gray: '#fcfcfd' });

    expect(() => defineTokens({ background: token(palette.gray, '<color>') })).toThrow(/literal default/);
  });

  it('should allow any key, including syntax and inherits', () => {
    const tokens = defineTokens({ syntax: 'a', inherits: { syntax: 'b' } });

    expect(tokens.inherits.syntax.build()).toBe('var(--inherits-syntax)');
  });
});

describe('createTheme', () => {
  it('should apply values wherever it is used', () => {
    const tokens = defineTokens({ background: token('#fff', '<color>'), text: '#111' });
    const dark = createTheme(tokens, { background: '#111', text: '#eee' });

    select('[data-theme="dark"]').use(dark);
    media().prefersColorScheme('dark').select(':root').use(dark);

    expect(Surimi.build()).toMatchSnapshot();
  });

  it('should support partial and nested values and aliases', () => {
    const tokens = defineTokens({ text: { primary: '#111', muted: '#666' }, accent: '#0090ff' });
    const brand = createTheme(tokens, { text: { muted: tokens.accent } });

    select('.brand').use(brand);

    expect(Surimi.build()).toContain(`.brand {
    --text-muted: var(--accent);
}`);
  });

  it('should compose with core styles', () => {
    const tokens = defineTokens({ background: '#fff' });
    const dark = createTheme(tokens, { background: '#111' });

    select('.card').style(style({ padding: '1rem' }).extend(dark));

    expect(Surimi.build()).toContain('--background: #111');
    expect(Surimi.build()).toContain('padding: 1rem');
  });

  it('should only emit CSS when used', () => {
    const tokens = defineTokens({ background: '#fff' });
    Surimi.clear();

    createTheme(tokens, { background: '#111' });

    expect(Surimi.build()).toBe('');
  });

  it('should type values against the tokens', () => {
    const tokens = defineTokens({ text: { primary: '#111' } });

    // @ts-expect-error `primry` is not a token
    createTheme(tokens, { text: { primry: '#000' } });
    // @ts-expect-error a token needs a value, not a group
    expect(() => createTheme(tokens, { text: { primary: { dark: '#000' } } })).toThrow(/--text-primary/);
  });
});

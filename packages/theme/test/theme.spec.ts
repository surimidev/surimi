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

    expect(Surimi.build()).toBe(`\
@property --background {
    syntax: '<color>';
    inherits: true;
    initial-value: #fff;
}
@property --radius {
    syntax: '<number>';
    inherits: false;
    initial-value: 4;
}
:root {
    --background: #fff;
    --radius: 4;
    --text: #111;
}`);
  });

  it('should kebab-case nested paths and the prefix', () => {
    const tokens = defineTokens({ fontSize: { small: '0.875rem', large: '2rem' } }, { prefix: 'myApp' });

    expect(tokens.fontSize.large.build()).toBe('var(--my-app-font-size-large)');
    expect(Surimi.build()).toBe(`\
:root {
    --my-app-font-size-small: 0.875rem;
    --my-app-font-size-large: 2rem;
}`);
  });

  it('should support numeric keys', () => {
    const tokens = defineTokens({ space: { 1: '4px', 2: '8px' } }, { prefix: 'ds' });

    expect(tokens.space[2].build()).toBe('var(--ds-space-2)');
    expect(Surimi.build()).toBe(`\
:root {
    --ds-space-1: 4px;
    --ds-space-2: 8px;
}`);
  });

  it('should register a typed token with an alias default without initial-value', () => {
    const palette = defineTokens({ gray: { 1: '#fcfcfd' } });
    const tokens = defineTokens({ background: palette.gray[1], border: token(palette.gray[1]) });

    expect(tokens.background.build()).toBe('var(--background)');
    expect(Surimi.build()).toBe(`\
:root {
    --gray-1: #fcfcfd;
    --background: var(--gray-1);
    --border: var(--gray-1);
}
@property --border {
    syntax: '*';
    inherits: true;
}`);
  });

  it('should emit nothing for an empty tree', () => {
    defineTokens({});

    expect(Surimi.build()).toBe('');
  });

  it('should reject a typed token with an alias default', () => {
    const palette = defineTokens({ gray: '#fcfcfd' });

    expect(() => defineTokens({ background: token(palette.gray, '<color>') })).toThrow(/literal default/);
  });

  it('should kebab-case acronym names', () => {
    const tokens = defineTokens({ URLValue: 'https://surimi.dev', APIKey: 'key' });

    expect(tokens.URLValue.build()).toBe('var(--url-value)');
    expect(tokens.APIKey.build()).toBe('var(--api-key)');
  });

  it('should not collide acronyms with lowercase keys', () => {
    const tokens = defineTokens({ URLValue: 'a', urlvalue: 'b' });

    expect(tokens.URLValue.build()).toBe('var(--url-value)');
    expect(tokens.urlvalue.build()).toBe('var(--urlvalue)');
  });

  it('should throw when two keys produce the same name', () => {
    expect(() => defineTokens({ textMuted: '#666', 'text-muted': '#999' })).toThrow(/--text-muted/);
    expect(() => defineTokens({ fontSize: { large: '1rem' }, 'font-size': { large: '2rem' } })).toThrow(
      /--font-size-large/,
    );
    expect(() => defineTokens({ URLValue: 'a', 'url-value': 'b' })).toThrow(/--url-value/);
  });

  it('should throw on names that are not valid CSS', () => {
    expect(() => defineTokens({ 'foo bar': 'x' })).toThrow(/--foo bar/);
    expect(() => defineTokens({ 'a.b': 'x' })).toThrow(/--a\.b/);
  });

  it('should throw when the same @property is redefined with different values', () => {
    defineTokens({ background: token('#fff', '<color>') });

    expect(() => defineTokens({ background: token('#111', '<color>') })).toThrow(
      /Conflicting @property definition for --background/,
    );
  });

  it('should not re-register an identical @property', () => {
    defineTokens({ background: token('#fff', '<color>') });
    defineTokens({ background: token('#fff', '<color>') });

    expect(Surimi.build().match(/@property --background/g)).toHaveLength(1);
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

    expect(Surimi.build()).toBe(`\
@property --background {
    syntax: '<color>';
    inherits: true;
    initial-value: #fff;
}
:root {
    --background: #fff;
    --text: #111;
}
[data-theme="dark"] {
    --background: #111;
    --text: #eee;
}
@media ( prefers-color-scheme : dark ) {
    :root {
        --background: #111;
        --text: #eee;
    }
}`);
  });

  it('should support partial and nested values and aliases', () => {
    const tokens = defineTokens({ text: { primary: '#111', muted: '#666' }, accent: '#0090ff' });
    const brand = createTheme(tokens, { text: { muted: tokens.accent } });

    select('.brand').use(brand);

    expect(Surimi.build()).toBe(`\
:root {
    --text-primary: #111;
    --text-muted: #666;
    --accent: #0090ff;
}
.brand {
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

  it('should throw on values for tokens that do not exist', () => {
    const tokens = defineTokens({ background: '#fff', color: { text: '#111' } });

    expect(() => createTheme(tokens, { unknown: '#000' } as never)).toThrow(/Unknown token "unknown"/);
    expect(() => createTheme(tokens, { color: { unknown: '#000' } } as never)).toThrow(
      /Unknown token "color\.unknown"/,
    );
  });

  it('should throw when a group gets a value', () => {
    const tokens = defineTokens({ background: '#fff', color: { text: '#111' } });

    expect(() => createTheme(tokens, { color: tokens.background } as never)).toThrow(/Expected a group for "color"/);
  });

  it('should throw on null values', () => {
    const tokens = defineTokens({ background: '#fff', color: { text: '#111' } });

    expect(() => createTheme(tokens, { background: null } as never)).toThrow(/got null/);
    expect(() => createTheme(tokens, { color: null } as never)).toThrow(/got null/);
  });

  it('should type values against the tokens', () => {
    const tokens = defineTokens({ text: { primary: '#111' } });

    // @ts-expect-error `primry` is not a token
    expect(() => createTheme(tokens, { text: { primry: '#000' } })).toThrow(/Unknown token "text\.primry"/);
    // @ts-expect-error a token needs a value, not a group
    expect(() => createTheme(tokens, { text: { primary: { dark: '#000' } } })).toThrow(/--text-primary/);
  });
});

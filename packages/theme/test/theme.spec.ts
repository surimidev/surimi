import { assignVars, createTheme, defineVars, token } from '@surimi/theme';

import { media, Surimi, select } from 'surimi';
import { beforeEach, describe, expect, it } from 'vitest';

describe('setVars', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  it('should set custom properties using token refs as keys', () => {
    const vars = defineVars({ text: null }, { prefix: 'ds', registerProperties: false });

    select(':root').setVars([[vars.text, '#111']]);

    expect(Surimi.build()).toBe(`\
:root {
    --ds-text: #111;
}`);
  });
});

describe('defineVars', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  it('should treat null and token as equivalent contract leaves', () => {
    const fromNull = defineVars({ a: null }, { prefix: 'x', registerProperties: false });
    const fromToken = defineVars({ b: token }, { prefix: 'x', registerProperties: false });

    select(':root').setVars([
      [fromNull.a, '#111'],
      [fromToken.b, '#222'],
    ]);

    expect(Surimi.build()).toBe(`\
:root {
    --x-a: #111;
    --x-b: #222;
}`);
  });

  it('should register @property for each token by default', () => {
    defineVars(
      {
        bg: { app: null },
        text: { default: { syntax: '<color>' } },
      },
      { initialValues: { text: { default: '#111' } } },
    );

    expect(Surimi.build()).toContain('@property --bg-app');
    expect(Surimi.build()).toContain('@property --text-default');
    expect(Surimi.build()).toContain("syntax: '<color>'");
    expect(Surimi.build()).toContain('initial-value: #111');
  });

  it('should throw when registering typed syntax without an initial value', () => {
    expect(() =>
      defineVars({
        text: { default: { syntax: '<color>' } },
      }),
    ).toThrow(/requires an initial-value/);
  });

  it('should not register @property when registerProperties is false', () => {
    defineVars({ bg: { app: null } }, { registerProperties: false });

    expect(Surimi.build()).toBe('');
  });

  it('should not register tokens with explicit syntax when registerProperties is false', () => {
    defineVars({ text: { default: { syntax: '<color>' } } }, { registerProperties: false });

    expect(Surimi.build()).toBe('');
  });
});

describe('assignVars', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  it('should assign values without re-registering @property', () => {
    const vars = defineVars({ bg: { app: null } });

    assignVars(vars, ':root', { bg: { app: '#fff' } });

    const css = Surimi.build();
    expect(css).toContain('@property --bg-app');
    expect(css).toContain(':root');
    expect(css).toContain('--bg-app: #fff');
    expect(css.match(/@property --bg-app/g)?.length).toBe(1);
  });
});

describe('createTheme', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  it('should emit base mode on :root and dark mode on attribute selector', () => {
    const theme = createTheme({
      modes: {
        light: ':root',
        dark: '[data-theme="dark"]',
      },
      tokens: {
        bg: {
          app: { light: '#fff', dark: '#111', syntax: '<color>' },
        },
        text: {
          default: { light: '#111', dark: '#eee' },
        },
      },
    });

    const css = Surimi.build();

    expect(css).toContain('@property --bg-app');
    expect(css).toContain('initial-value: #fff');
    expect(css).toContain(':root');
    expect(css).toContain('--bg-app: #fff');
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain('--bg-app: #111');
    expect(css).toContain('--text-default: #eee');
    expect(theme.bg.app.build()).toBe('var(--bg-app)');
    expect(css).toMatchSnapshot();
  });

  it('should support partial mode overrides', () => {
    createTheme({
      modes: {
        light: ':root',
        dark: '[data-theme="dark"]',
      },
      tokens: {
        bg: {
          app: { light: '#fff', dark: '#111' },
          canvas: { light: '#eee' },
        },
      },
    });

    const css = Surimi.build();
    const darkBlock = css.match(/\[data-theme="dark"\]\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(css).toContain('--bg-app: #111');
    expect(css).toContain('--bg-canvas: #eee');
    expect(darkBlock).not.toContain('--bg-canvas');
    expect(css).toMatchSnapshot();
  });

  it('should assign values through media query targets', () => {
    createTheme({
      modes: {
        light: ':root',
        dark: media().prefersColorScheme('dark'),
      },
      tokens: {
        bg: {
          app: { light: '#fff', dark: '#111' },
        },
      },
    });

    const css = Surimi.build();

    expect(css).toContain('prefers-color-scheme');
    expect(css).toContain('--bg-app: #111');
    expect(css).toMatchSnapshot();
  });
});
